#pragma once

#include "Color.h"
#include <array>
#include <cstdint>
#include <functional>
// #include "BlackBox_manager.hpp"
#include "BlackBox/LEDring.hpp"

namespace BlackBox {
typedef std::function<void()> interface_btn_t;

class BlackBox_page {
private:
    std::array<interface_btn_t, 60> m_functions;
    std::array<Rgb, 60> m_LEDs;

public:
    BlackBox_page() = default;
    ~BlackBox_page() = default;

    std::array<interface_btn_t, 60>& getFunctions() { return m_functions; }

    std::array<Rgb, 60>& getLEDs() { return m_LEDs; }

    void call(uint8_t i_index)
    {
        auto& a = m_functions.at(i_index);
        a();
    }

    void storeFunction(index_t i_index, interface_btn_t i_function)
    {
        m_functions[i_index] = i_function;
    }

    void setRGB(uint8_t i_index, Rgb i_RGB)
    {
        m_LEDs[i_index] = i_RGB;
    }
};
} // namespace BlackBox
