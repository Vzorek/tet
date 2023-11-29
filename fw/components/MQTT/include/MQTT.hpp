#pragma once

#include "types.hpp"

#include "eventpp/eventdispatcher.h"

#include "esp_event.h"
#include "esp_log.h"
#include "esp_tls.h"
#include "mqtt_client.h"

#include <atomic>
#include <optional>
#include <string>
#include <string_view>
#include <utility>
#include <variant>

namespace MQTT {
class Client {
public:
    using Dispatcher = eventpp::EventDispatcher<Event::Id, void(Event::Data)>;
    using Callback = Dispatcher::Callback;
    using SubscribeCallback = std::function<void(std::string_view, std::string_view)>;
    using Handle = Dispatcher::Handle;

private:
    static constexpr const char* s_tag = "MQTT";

    esp_mqtt_client_config_t m_config;
    esp_mqtt_client_handle_t m_client;

    Dispatcher m_dispatcher;

    std::atomic_bool m_connected = false;

    static void trampoline(void* handler_args, esp_event_base_t base, std::int32_t event_id, void* event_data);

public:
    Client(const std::string& host, const std::optional<Message>& will = std::nullopt);
    Client(const std::string& host, const std::string& user, const std::string& password, const std::optional<Message>& will = std::nullopt);
    Client(const Config& config);

    Client(const Client&) = delete;
    Client(Client&&) = default;

    Client& operator=(const Client&) = delete;
    Client& operator=(Client&&) = default;

    ~Client();

    void start();
    void stop();
    void publish(std::string_view topic, std::string_view message, QOS qos = QOS::AtMostOnce, bool retain = false);
    void publish(const Message& message);
    void subscribe(std::string_view topic, QOS qos = QOS::ExactlyOnce);
    Handle subscribe(std::string_view topic, Callback callback, QOS qos = QOS::ExactlyOnce);
    void unsubscribe(std::string_view topic);

    Handle on(Event::Id event, Callback callback);
    void removeListener(Event::Id event, Handle handle);

    bool connected() const;
};

} // namespace MQTT
