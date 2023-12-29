#pragma once

#include "pinout.hpp"

#include "SmartLeds.h"

#include <chrono>
#include <utility>
#include <array>

struct State {
    std::chrono::steady_clock::time_point time;
    std::array<Rgb, 5> leds;
};

class Manager {
private:
    SmartLed m_leds;

public:
    using StateType = State;

    Manager()
        : m_leds(LED_WS2812B, 5, Pins::Leds, 0, SingleBuffer) {
    }

    State get() const {
        State out;
        out.time = std::chrono::steady_clock::now();
        for (std::size_t i = 0; i < out.leds.size(); ++i) {
            out.leds[i] = m_leds[i];
        }
        return out;
    }

    void apply(const State& state) {
        for (std::size_t i = 0; i < state.leds.size(); ++i) {
            m_leds[i] = state.leds[i];
        }
    }
};
