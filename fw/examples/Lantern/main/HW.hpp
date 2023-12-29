#pragma once

#include "BlackBox/Manager.hpp"
#include "SmartLeds.h"

#include "esp_log.h"

#include <chrono>
#include <utility>
#include <array>

struct State {
    std::chrono::steady_clock::time_point time;
    std::array<Rgb, 60> top;
    std::array<Rgb, 52> perim;
    std::array<bool, 4> doors;
    bool shutdown = false;
};

class Manager {
private:
    BlackBox::Manager& m_blackBox;

public:
    using StateType = State;

    Manager()
        : m_blackBox(BlackBox::Manager::singleton()) {
            m_blackBox.init();
            m_blackBox.power().turnOn();
            m_blackBox.power().turnOn5V();
            m_blackBox.power().turnOnLDC();
            for (auto& door: m_blackBox.doors())
                door.close();
    }

    State get() const {
        State out;
        out.time = std::chrono::steady_clock::now();
        
        for (std::size_t i = 0; i < 4; i++)
            out.doors[i] = m_blackBox.door(i).isClosed(true);

        for (std::size_t i = 0; i < 60; i++)
            out.top[i] = m_blackBox.beacon().onTop(i);

        for (std::size_t i = 0; i < 52; i++)
            out.perim[i] = m_blackBox.beacon().onPerimeter(i);
        
        return out;
    }

    void apply(const State& state) {
        // for (std::size_t i = 0; i < 4; i++)
        //     if (state.doors[i])
        //         m_blackBox.door(i).open();
        //     else
        //         m_blackBox.door(i).close();

        // for (std::size_t i = 0; i < 60; i++)
        //     m_blackBox.beacon().onTop(i) = state.top[i];

        // for (std::size_t i = 0; i < 52; i++)
        //     m_blackBox.beacon().onPerimeter(i) = state.perim[i];

        // if (state.shutdown)
        //     m_blackBox.power().turnOff();

        // ESP_LOGI("HW", "State applied");
    }
};
