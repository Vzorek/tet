#pragma once

#include "tet/Command.hpp"
#include "tet/Event.hpp"
#include "tet/State.hpp"
#include "tet/StaticFunction.hpp"
#include "tet/util.hpp"

#include "MQTT.hpp"

#include "coll/basic_string.h"

#include "frozen/bits/elsa.h"
#include "frozen/bits/hash_string.h"
#include <frozen/string.h>
#include <frozen/unordered_map.h>
#include <nlohmann/json.hpp>

#include <chrono>
#include <filesystem>
#include <functional>
#include <map>
#include <stdexcept>
#include <string>
#include <vector>

namespace tet {

template <typename... Commands, typename... Events>
consteval auto makeSchema(const std::tuple<Commands...>& commands, const std::tuple<Events...>& events) {
    return "{\n"
        + indent<1> + "\"commands\": {\n"
        + encodeMultiple<1, 0>(commands)
        + indent<1> + "},\n"
        + indent<1> + "\"events\": {\n"
        + encodeMultiple<1, 0>(events)
        + indent<1> + "}\n"
        + "}";
}

template <HW::State State, typename... Commands>
constexpr frozen::unordered_map<frozen::string, Callback<State>, sizeof...(Commands)> makeFrozenMap(const std::tuple<Commands...>& commands) {
    return  { std::make_pair(frozen::string(std::get<Commands>(commands).identifier), std::get<Commands>(commands).callback)... };
}

using namespace std::string_literals;
static constexpr inline std::string s_topicPrefix = "tet/devices/"s;
static constexpr inline std::string s_commandTopic = "/commands"s;
static constexpr inline std::string s_eventTopic = "/events/"s;


template <HW::State State,
    HW::Manager<State> Manager,
    std::size_t t_commandCount>
class Client {
public:
    template <std::size_t t_identifierSize, std::size_t t_descriptionSize, typename... Args>
    using Command = tet::Command<State, t_identifierSize, t_descriptionSize, Args...>;

    using Callback = tet::Callback<State>;

private:
    static constexpr const char* s_tag = "tet::Client";
    static constexpr MQTT::QOS s_qos = MQTT::QOS::ExactlyOnce;

    const std::string m_id;
    const std::string m_definitionString;

    const frozen::unordered_map<frozen::string, Callback, t_commandCount> m_callbacks;

    MQTT::Client* m_mqtt = nullptr;
    Manager* m_manager = nullptr;

    void onData(esp_mqtt_event_handle_t const event) {
        ESP_LOGI(s_tag, "Received message on topic %.*s", event->topic_len, event->topic);

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

    void handleCommand(const nlohmann::json& json) const {
        if (!json.contains("command")) {
            ESP_LOGE(s_tag, "No command in JSON");
            return;
        }
        std::string command;
        json["command"].get_to(command);
        auto _command = m_callbacks.find(std::string_view(command));
        if (_command == m_callbacks.end()) {
            ESP_LOGE(s_tag, "Unknown command %s", command.c_str());
            m_mqtt->publish(s_topicPrefix + m_id, "Unknown command " + command, s_qos);
            return;
        }

        if (!json.contains("data")) {
            ESP_LOGE(s_tag, "No data in JSON");
            return;
        }
        _command->second(m_manager->get(), json["data"]);
    }

    void onDisconnect(esp_mqtt_event_handle_t const event) const {
        ESP_LOGI(s_tag, "Disconnected");
    }

    void onConnected(esp_mqtt_event_handle_t const event) {
        ESP_LOGI(s_tag, "Connected");
        m_mqtt->subscribe(s_topicPrefix + m_id + s_commandTopic, s_qos);
        m_mqtt->publish(s_topicPrefix + m_id, m_definitionString, s_qos);
    }

public:
    Client(
        const std::string& id,
        const std::string_view& definitionString,
        const frozen::unordered_map<frozen::string, Callback, t_commandCount>& callbacks)
        : m_id(id)
        , m_definitionString(std::string(definitionString))
        , m_callbacks(callbacks) {
    }

    void init(MQTT::Client* mqtt, Manager* manager) {
        using namespace MQTT::Event;
        using namespace std::placeholders;
        m_mqtt = mqtt;
        m_manager = manager;
        m_mqtt->on(Id::Data, std::bind(&Client::onData, this, _1));
        m_mqtt->on(Id::Connected, std::bind(&Client::onConnected, this, _1));
        m_mqtt->on(Id::Disconnected, std::bind(&Client::onDisconnect, this, _1));
    }

    ~Client() = default;

    void sendEvent(std::string event, nlohmann::json data) {
        m_mqtt->publish(s_topicPrefix + m_id + s_eventTopic + event, data.dump(), s_qos);
    }

    void executeCommand(std::string_view command, nlohmann::json data) {
        if (m_callbacks.find(command) == m_callbacks.end())
            return;

        m_callbacks[command].callback(m_manager->get(), data);
    }
};

} // namespace tet
