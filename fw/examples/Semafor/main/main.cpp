#include "definition.hpp"
#include "pinout.hpp"
#include <SmartLeds.h>

#include "MQTT.hpp"
#include "NVS.hpp"
#include "NetIf.hpp"
#include "WiFi.hpp"
#include "mDNS.hpp"

#include <nlohmann/json.hpp>

#include "esp_crt_bundle.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "esp_system.h"

#include <chrono>
#include <iostream>
#include <thread>

using namespace std::chrono_literals;

using SSID = std::string;
using Password = std::string;
using Network = std::pair<SSID, Password>;
using Networks = std::multimap<SSID, Password>;

static const char* TAG = "main";

SmartLed g_leds(LED_WS2812B, Pins::LED_COUNT, Pins::Leds);

bool tryConnect(const Network& network) {
    std::atomic_int success = 0;

    auto& wifi = WiFi::singleton();

    auto onConnected = wifi.on(WIFI_EVENT_STA_CONNECTED, [&success](const wifi_event_sta_connected_t* event) {
        success = 1;
        success.notify_all();
    });

    auto onDisconnected = wifi.on(WIFI_EVENT_STA_DISCONNECTED, [&success](const wifi_event_sta_disconnected_t* event) {
        success = -1;
        success.notify_all();
    });

    wifi.connect(network.first, network.second, false);

    success.wait(0);

    wifi.removeListener(WIFI_EVENT_STA_CONNECTED, onConnected);
    wifi.removeListener(WIFI_EVENT_STA_DISCONNECTED, onDisconnected);

    return success == 1;
}

std::optional<Network> tryConnect(Networks& networks) {
    WiFi& wifi = WiFi::singleton();

    auto available = wifi.scan();

    for (const auto& entry : available) {
        std::string ssid = reinterpret_cast<const char*>(entry.ssid);
        auto [fst, last] = networks.equal_range(ssid);
        for (auto it = fst; it != last; ++it) {
            if (tryConnect(*it)) {
                return *it;
            }
        }
    }
    return std::nullopt;
}

void keepConnected(Network network) {
    ESP_LOGI(TAG, "Connecting to AP");
    WiFi& wifi = WiFi::singleton();
    !tryConnect(network);

    auto onDisconnected = wifi.on(WIFI_EVENT_STA_DISCONNECTED, [=, &wifi](const wifi_event_sta_disconnected_t* event) {
        ESP_LOGI(TAG, "Disconnected from AP");
        esp_restart();
    });
}

void initPins() {
    gpio_config_t io_conf;
    io_conf.intr_type = GPIO_INTR_DISABLE;
    io_conf.mode = GPIO_MODE_INPUT;
    io_conf.pin_bit_mask = (1ULL << Pins::SW1) | (1ULL << Pins::SW2);
    io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    io_conf.pull_up_en = GPIO_PULLUP_ENABLE;
    gpio_config(&io_conf);
}

bool readSwitch(gpio_num_t pin) {
    return gpio_get_level(pin) == 0;
}

Rgb parseColor(const nlohmann::json& json) {
    if (!json.contains("r") || !json.contains("g") || !json.contains("b")) {
        ESP_LOGE(TAG, "Invalid color JSON");
        return {};
    }
    return { json["r"], json["g"], json["b"] };
}

void handleCommand(const nlohmann::json& json) {
    ESP_LOGI(TAG, "Handling command");
    if (!json.contains("command")) {
        ESP_LOGE(TAG, "No command in JSON");
        return;
    }

    std::string command;
    json["command"].get_to(command);
    if (command != "stateChange")
        return;

    if (!json.contains("data")) {
        ESP_LOGE(TAG, "No data in JSON");
        return;
    }

    auto& data = json["data"];
    if (!data.contains("leds")) {
        ESP_LOGE(TAG, "No leds in JSON");
        return;
    }

    auto& leds = data["leds"];
    if (!leds.is_array()) {
        ESP_LOGE(TAG, "Leds is not an array");
        return;
    }

    for (std::size_t i = 0; i < leds.size(); ++i) {
        auto& led = leds[i];
        if (!led.is_object()) {
            ESP_LOGE(TAG, "Led is not an object");
            return;
        }

        g_leds[i] = parseColor(led);
        ESP_LOGI(TAG, "Setting led %d to %d %d %d", i, g_leds[i].r, g_leds[i].g, g_leds[i].b);
    }

    g_leds.show();
}

void onData(esp_mqtt_event_handle_t const event) {
    ESP_LOGI(TAG, "Received message on topic %.*s", event->topic_len, event->topic);

    std::string_view message(event->data, event->data_len);
    std::string_view topic(event->topic, event->topic_len);

    nlohmann::json json = nlohmann::json::parse(message);

    if (json.is_object())
        handleCommand(json);
    else if (json.is_array())
        for (auto& item : json)
            handleCommand(item);
    else
        throw std::runtime_error("Invalid JSON");
}

extern "C" void app_main(void) {
    NVS::init();
    NetIf::init();
    WiFi::singleton().init();
    mDNS::Device mdns("semafor");
    initPins();

    std::array<std::uint8_t, 4> mac;
    esp_base_mac_addr_get(mac.data());
    std::string id(17, '\0');
    snprintf(id.data(), id.size() + 1, MACSTR, MAC2STR(mac.data()));

    std::unique_ptr<MQTT::Client> mqtt = nullptr;

    std::atomic_flag connected = ATOMIC_FLAG_INIT;

    NetIf::on(IP_EVENT_STA_GOT_IP, [&](auto data) {
        ESP_LOGI(TAG, "Got IP.");
        connected.test_and_set();
        connected.notify_all();
    });

    keepConnected(std::make_pair("MotoG5G", "haberturdeur"));

    connected.wait(0);

    std::optional<mDNS::Device::ServiceResult> service;
    // while (!(service = mdns.queryService("_tet", "_tcp")))
    std::this_thread::sleep_for(1s);

    // ESP_LOGI(TAG, "Found service: %s:%d", service->hostname.c_str(), service->port);
    MQTT::Config mqttConfig = {
        // .host = "mqtt://" + service->ip.toString() + ":" + std::to_string(service->port),
        .host = "mqtt://192.168.8.48:1883",
    };
    ESP_LOGI(TAG, "Connecting to: %s", mqttConfig.host.c_str());
    mqtt = std::make_unique<MQTT::Client>(mqttConfig);
    mqtt->start();
    mqtt->on(MQTT::Event::Id::Connected, [&](esp_mqtt_event_handle_t) {
        ESP_LOGI(TAG, "Connected to MQTT");
        mqtt->publish("tet/devices/" + id, definition);
        mqtt->subscribe("tet/devices/" + id + "/commands", onData);
    });

    mqtt->on(MQTT::Event::Id::Data, onData);

    while (true) {

        static bool sw1Last = false;
        static bool sw2Last = false;

        bool sw1 = readSwitch(Pins::SW1);
        bool sw2 = readSwitch(Pins::SW2);

        if (sw1 != sw1Last) {
            sw1Last = sw1;
            if (sw1) {
                ESP_LOGI(TAG, "SW1 pressed");
                mqtt->publish("tet/devices/" + id + "/events", R"( { "event": "buttonPressed", "data": "A" })");
            }
        }

        if (sw2 != sw2Last) {
            sw2Last = sw2;
            if (sw2) {
                ESP_LOGI(TAG, "SW2 pressed");
                mqtt->publish("tet/devices/" + id + "/events", R"( { "event": "buttonPressed", "data": "B" })");
            }
        }

        std::this_thread::sleep_for(100ms);
    }
}
