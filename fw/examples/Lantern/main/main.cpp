#include "HW.hpp"
#include "commands.hpp"
#include "events.hpp"

#include "tet/Client.hpp"
#include "MQTT.hpp"
#include "NetIf.hpp"
#include "WiFi.hpp"
#include "NVS.hpp"

#include "esp_log.h"
#include "esp_crt_bundle.h"
#include "esp_mac.h"
#include "esp_system.h"

#include <chrono>
#include <thread>
#include <iostream>

using namespace std::chrono_literals;

using SSID = std::string;
using Password = std::string;
using Network = std::pair<SSID, Password>;
using Networks = std::multimap<SSID, Password>;

static const char* TAG = "main";

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
    while (!tryConnect(network));

    auto onDisconnected = wifi.on(WIFI_EVENT_STA_DISCONNECTED, [=, &wifi](const wifi_event_sta_disconnected_t* event) {
        ESP_LOGI(TAG, "Disconnected from AP");
        esp_restart();
    });
}

bool readButton1() {
    auto& touchpad = BlackBox::Manager::singleton().touchpad();

    auto data = touchpad.calculate();

    // ESP_LOGI(g_tag, "Pressure: %i", data.pressure);
    static int lastPressure = 0;
    static bool firstRead = true;
    if (firstRead) {
        lastPressure = data.pressure;
        firstRead = false;
    }

    int diff = data.pressure - lastPressure;
    if (diff < 0) {
        diff = 0;
    }

    bool pressNow = diff >= 5;

    if (!pressNow)
        lastPressure = data.pressure;

    return pressNow;
}

extern "C" void app_main(void) {
    NVS::init();
    NetIf::init();
    WiFi::singleton().init();
    Manager manager;
    BlackBox::Manager::singleton().power().turnOff();

    std::array<std::uint8_t, 4> mac;
    esp_base_mac_addr_get(mac.data());
    std::string id(17, '\0');
    snprintf(id.data(), id.size() + 1, MACSTR, MAC2STR(mac.data()));

    MQTT::Config mqttConfig = {
        .host = "mqtt://192.168.155.48:1883",
    };
    MQTT::Client mqtt(mqttConfig);

    static constexpr auto schema = tet::makeSchema(Commands::all, Events::all);
    std::cout << schema.view() << std::endl;
    static auto callbacks = tet::makeFrozenMap<State>(Commands::all);
    using commandCount = std::tuple_size<std::decay_t<decltype(Commands::all)>>;
    tet::Client<State, Manager, commandCount::value> client(id, schema.view(), callbacks);

    NetIf::on(IP_EVENT_STA_GOT_IP, [&](auto data){
        ESP_LOGI(TAG, "Got IP.");
        mqtt.start();
        client.init(&mqtt, &manager);
    });

    keepConnected(std::make_pair("MotoG5G", "haberturdeur"));

    while (true) {
        // man.power().checkBatteryLevel(3700, true);
        
        static bool lastState = false;
        bool state = readButton1();
        if (state != lastState) {
            if (state)
                client.sendEvent("btnPressed", nlohmann::json::object());
            else
                client.sendEvent("btnReleased", nlohmann::json::object());

            lastState = state;
        }
        std::this_thread::sleep_for(100ms);
    }
}
