#pragma once

#include "MQTT.hpp"

#include <nlohmann/json.hpp>

#include <functional>
#include <stdexcept>
#include <string>
#include <vector>
#include <chrono>

namespace HW {
template <class T>
concept State = requires(const T& a) {
    requires std::same_as<std::decay_t<decltype(a.time)>, std::chrono::steady_clock::time_point>;
};

template <class M, class S>
concept Manager = requires(const M& manager, const S& state) {
    requires State<S>;
    { manager.get() } -> std::same_as<S>;
} && requires(M& manager, const S& state) {
    { manager.apply(state) } -> std::same_as<void>;
};
} // namespace HW

namespace tet {

template <HW::State State, HW::Manager<State> Manager>
class Client {
public:
    struct Parameter {
        enum class Type {
            String,
            Number,
            Boolean,
        };

        NLOHMANN_JSON_SERIALIZE_ENUM(Type, {
                                               { Type::String, "string" },
                                               { Type::Number, "number" },
                                               { Type::Boolean, "boolean" },
                                           });

        std::string identifier;
        std::string description;
        std::string defaultValue;
        Type type;

        NLOHMANN_DEFINE_TYPE_INTRUSIVE(Parameter, identifier, description, defaultValue, type)
    };

    struct Command {
        using Callback = std::function<void(const State&, const nlohmann::json&)>;
        std::string identifier;
        std::string description;
        std::vector<Parameter> parameters;
        Callback callback;

        NLOHMANN_DEFINE_TYPE_INTRUSIVE(Command, identifier, description, parameters)
    };

    struct Event {
        std::string identifier;
        std::string description;
        std::vector<Parameter> parameters;
    };

private:
    static constexpr const char* s_tag = "tet::Client";
    static constexpr MQTT::QOS s_qos = MQTT::QOS::ExactlyOnce;

    MQTT::Client& m_mqtt;
    Manager& m_manager;
    std::string m_id;
    std::map<std::string, Command> m_commands;
    std::map<std::string, Event> m_events;

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
        auto _command = m_commands.find(command);
        if (_command == m_commands.end()) {
            ESP_LOGE(s_tag, "Unknown command %s", command.c_str());
            m_mqtt.publish("tet/devices/" + m_id, "Unknown command " + command, s_qos);
            return;
        }

        _command->second.callback(m_manager.get(), data);
    }

    void onDisconnect(esp_mqtt_event_handle_t const event) const {
        ESP_LOGI(s_tag, "Disconnected");
    }

    void onConnected(esp_mqtt_event_handle_t const event) {
        using namespace nlohmann;

        json out = json::object();
        out["commands"] = json::array();
        auto& commands = out["commands"];

        for (auto& [identifier, command] : m_commands)
            commands.emplace_back(command);

        m_mqtt.subscribe("tet/devices/" + m_id + "/commands", s_qos);
        m_mqtt.publish("tet/devices/" + m_id, out.dump(), s_qos);
    }

public:
    Client(MQTT::Client& mqtt, Manager& manager, std::string id)
        : m_mqtt(mqtt)
        , m_manager(manager)
        , m_id(id) {
        using namespace MQTT::Event;
        using namespace std::placeholders;
        m_mqtt.on(Id::Data, std::bind(&Client::onData, this, _1));
        m_mqtt.on(Id::Connected, std::bind(&Client::onConnected, this, _1));
        m_mqtt.on(Id::Disconnected, std::bind(&Client::onDisconnect, this, _1));
    }

    ~Client() = default;

    void registerCommand(Command command) {
        m_commands[command.identifier] = command;
    }

    void registerEvent(Event event) {
        m_events[event.identifier] = event;
    }

    void sendEvent(std::string event, nlohmann::json data) {
        m_mqtt.publish("tet/devices/" + m_id + "/events/" + event, data.dump(), s_qos);
    }

    void executeCommand(std::string command, nlohmann::json data) {
        if (m_commands.find(command) == m_commands.end())
            return;

        m_commands[command].callback(m_manager.get(), data);
    }
};

} // namespace tet
