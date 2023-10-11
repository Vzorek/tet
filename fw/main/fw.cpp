#include "tet.hpp"

#include "MQTT.hpp"

#include <chrono>

struct State {
    std::chrono::steady_clock::time_point time;
};

class Manager {
private:
    State m_state;

public:
    State get() const {
        return m_state;
    }

    void apply(const State& state) {
        m_state = std::move(state);
    }
};

extern "C" void app_main(void) {
    Manager manager;
    MQTT::Client mqtt("mqtts://mqtt.gwenlian.eu:8883", "tet", "tet");
    tet::Client<State, Manager> client(mqtt, manager, "tet");
}
