#include "HW.hpp"
#include "commands.hpp"
#include "events.hpp"

#include "tet/Client.hpp"
#include "MQTT.hpp"

#include <chrono>

extern "C" void app_main(void) {
    Manager manager;
    MQTT::Client mqtt("mqtts://mqtt.gwenlian.eu:8883", "tet", "tet");

    static constexpr auto schema = tet::makeSchema(Commands::all, Events::all);
    static auto callbacks = tet::makeFrozenMap<State>(Commands::all);
    tet::Client<State, Manager, std::tuple_size_v<decltype(Commands::all)>> client("tet", schema.view(), callbacks);
    client.init(&mqtt, &manager);
}