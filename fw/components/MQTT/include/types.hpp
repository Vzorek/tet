#pragma once

#include "mqtt_client.h"

#include <optional>
#include <string_view>
#include <variant>

namespace MQTT {
enum class QOS {
    AtMostOnce = 0,
    AtLeastOnce = 1,
    ExactlyOnce = 2,
};

enum class Version {
    V3_1 = MQTT_PROTOCOL_V_3_1,
    V3_1_1 = MQTT_PROTOCOL_V_3_1_1,
    V5 = MQTT_PROTOCOL_V_5,
};

enum class Transport {
    TCP = MQTT_TRANSPORT_OVER_TCP,
    SSL = MQTT_TRANSPORT_OVER_SSL,
    WebSocket = MQTT_TRANSPORT_OVER_WS,
    WebSocketSecure = MQTT_TRANSPORT_OVER_WSS,
};

struct Message {
    std::string_view topic;
    std::string_view data;
    QOS qos;
    bool retain;
};

namespace Event {

enum class Id {
    Any = MQTT_EVENT_ANY,

    Error = MQTT_EVENT_ERROR,
    Connected = MQTT_EVENT_CONNECTED,
    Disconnected = MQTT_EVENT_DISCONNECTED,
    Subscribed = MQTT_EVENT_SUBSCRIBED,
    Unsubscribed = MQTT_EVENT_UNSUBSCRIBED,
    Published = MQTT_EVENT_PUBLISHED,
    Data = MQTT_EVENT_DATA,
    BeforeConnect = MQTT_EVENT_BEFORE_CONNECT,
    Deleted = MQTT_EVENT_DELETED,
};

using Data = esp_mqtt_event_handle_t;
} // namespace Event

struct NoCertificate {};
struct UseGlobalStore {};
using BundleAttacher = esp_err_t (*)(void* conf);

struct Config {
    std::string_view host;
    std::optional<std::string_view> user;
    std::optional<std::string_view> password;
    std::variant<NoCertificate, std::string_view, BundleAttacher, UseGlobalStore> serverCertificate;
    std::optional<std::string_view> clientCertificate;
    std::optional<std::string_view> clientKey;
    std::optional<Message> will;
    std::optional<std::string_view> clientId;
};

} // namespace MQTT