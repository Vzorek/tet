#include "MQTT.hpp"
#include "types.hpp"

#include "magic_enum.hpp"

#include "eventpp/eventdispatcher.h"

#include "esp_crt_bundle.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_tls.h"
#include "mqtt_client.h"

#include <exception>
#include <string>
#include <string_view>
#include <utility>

namespace MQTT {

void Client::trampoline(void* handler_args, esp_event_base_t base, int32_t event_id, void* event_data) {
    ESP_LOGI(s_tag, "Received event: %s:%s", base, magic_enum::enum_name(static_cast<esp_mqtt_event_id_t>(event_id)).data());
    auto client = static_cast<Client*>(handler_args);
    client->m_dispatcher.dispatch(static_cast<Event::Id>(event_id), static_cast<esp_mqtt_event_handle_t>(event_data));
}

Client::Client(const Config& config)
    : m_config(esp_mqtt_client_config_t {}) {
    ESP_LOGI(s_tag, "Initializing MQTT client");
    m_config.broker.address.uri = config.host.data();

    if (config.clientId)
        m_config.credentials.client_id = config.clientId->data();

    if (config.user)
        m_config.credentials.username = config.user->data();
    else if (config.password)
        throw std::invalid_argument("Password must be empty if user is empty");

    if (config.password)
        m_config.credentials.authentication.password = config.password->data();

    switch (config.serverCertificate.index()) {
    case 1:
        m_config.broker.verification.certificate = std::get<1>(config.serverCertificate).data();
        m_config.broker.verification.certificate_len = std::get<1>(config.serverCertificate).size();
        break;
    case 2:
        m_config.broker.verification.crt_bundle_attach = std::get<2>(config.serverCertificate);
        break;
    case 3:
        m_config.broker.verification.use_global_ca_store = true;
        break;
    default:
        break;
    }

    if (config.will) {
        m_config.session.last_will.topic = config.will->topic.data();
        m_config.session.last_will.msg = config.will->data.data();
        m_config.session.last_will.msg_len = config.will->data.size();
        m_config.session.last_will.qos = static_cast<int>(config.will->qos);
        m_config.session.last_will.retain = config.will->retain;
    }

    m_client = esp_mqtt_client_init(&m_config);
    if (m_client == nullptr)
        throw std::runtime_error("Failed to initialize MQTT client");

    m_dispatcher.appendListener(Event::Id::Connected, [this](auto event) {
        ESP_LOGI(s_tag, "MQTT connected");
        m_connected = 1;
    });

    m_dispatcher.appendListener(Event::Id::Disconnected, [this](auto event) {
        m_connected = 0;
        ESP_LOGI(s_tag, "MQTT disconnected");
    });

    m_dispatcher.appendListener(Event::Id::Subscribed, [this](auto event) {
        ESP_LOGI(s_tag, "MQTT subscribed");
    });

    m_dispatcher.appendListener(Event::Id::Unsubscribed, [this](auto event) {
        ESP_LOGI(s_tag, "MQTT unsubscribed");
    });

    m_dispatcher.appendListener(Event::Id::Published, [this](auto event) {
        ESP_LOGI(s_tag, "MQTT published");
    });

    m_dispatcher.appendListener(Event::Id::Data, [this](auto event) {
        ESP_LOGI(s_tag,
            "MQTT data:\r\n"
            "\tTOPIC = %.*s\r\n"
            "\tDATA = %.*s\r\n",
            event->topic_len,
            event->topic,
            event->data_len,
            event->data);
    });

    m_dispatcher.appendListener(Event::Id::Error, [this](auto event) {
        ESP_LOGI(s_tag, "MQTT error");
    });
}

Client::Client(const std::string& host, const std::optional<Message>& will)
    : Client(Config {
        .host = host,
        .will = will,
    }) {
}
Client::Client(const std::string& host, const std::string& user, const std::string& password, const std::optional<Message>& will)
    : Client(Config {
        .host = host,
        .user = user,
        .password = password,
        .will = will,
    }) {
}

Client::~Client() {
    esp_mqtt_client_destroy(m_client);
}

void Client::subscribe(std::string_view topic, QOS qos) {
    int ret = esp_mqtt_client_subscribe(m_client, topic.data(), static_cast<int>(qos));
    if (ret < 0)
        ESP_LOGE(s_tag, "Error subscribing to topic: %s", topic.data());
}

Client::Handle Client::subscribe(std::string_view topic, Client::Callback callback, QOS qos) {
    int ret = esp_mqtt_client_subscribe(m_client, topic.data(), static_cast<int>(qos));
    if (ret < 0)
        ESP_LOGE(s_tag, "Error subscribing to topic: %s", topic.data());

    ESP_LOGI(s_tag, "Subscribed to topic: %s", topic.data());
    return m_dispatcher.appendListener(Event::Id::Data, [=](esp_mqtt_event_handle_t event) {
        std::string_view received_topic(event->topic, event->topic_len);

        if (received_topic == topic) {
            callback(event);
        }
    });
}

void Client::unsubscribe(std::string_view topic) {
    int ret = esp_mqtt_client_unsubscribe(m_client, topic.data());
    if (ret < 0)
        ESP_LOGE(s_tag, "Error unsubscribing from topic: %s", topic.data());
}

void Client::publish(std::string_view topic, std::string_view message, QOS qos, bool retain) {
    int ret = esp_mqtt_client_publish(m_client, topic.data(), message.data(), message.size(), static_cast<int>(qos), retain);
    if (ret < 0)
        ESP_LOGE(s_tag, "Error publishing message \"%s\" to topic: %s", message.data(), topic.data());
}

void Client::stop() {
    ESP_ERROR_CHECK(esp_mqtt_client_stop(m_client));
}

void Client::start() {
    ESP_LOGI(s_tag, "Starting MQTT client");
    ESP_ERROR_CHECK(esp_mqtt_client_start(m_client));
    ESP_ERROR_CHECK(esp_mqtt_client_register_event(m_client, static_cast<esp_mqtt_event_id_t>(ESP_EVENT_ANY_ID), trampoline, this));
}

Client::Handle Client::on(Event::Id event, Callback callback) {
    return m_dispatcher.appendListener(event, callback);
}

void Client::removeListener(Event::Id event, Handle handle) {
    m_dispatcher.removeListener(event, handle);
}

bool Client::connected() const {
    return m_connected;
}

} // namespace MQTT
