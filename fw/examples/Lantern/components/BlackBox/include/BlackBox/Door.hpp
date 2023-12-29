#pragma once

#include "Dsp.hpp"
#ifdef BB_DOORS

#include "driver/gpio.h"
#include "driver/ledc.h"
#include "BlackBox/pinout.hpp"
#include <mutex>

namespace BlackBox {
class Door {
private:
    const char* m_tag = "Door";

    static constexpr int s_duty[2] = {7864, 1638};
    static constexpr bool s_closed = 0;

    mutable std::recursive_mutex m_mutex;

    const Pins::DoorPin m_pins;

    ledc_timer_config_t m_timerConfig;
    ledc_channel_config_t m_channelConfig;

    gpio_config_t m_tamperCheckConfig;

    bool m_isClosed;

    void drive(bool closed);
public:
    ~Door() = default;

    Door(Pins::DoorPin pins, 
        ledc_timer_t timer = LEDC_TIMER_0,
        ledc_channel_t channel = LEDC_CHANNEL_0);

    void init();

    [[deprecated]]
    void lock();

    [[deprecated]]
    void unlock();

    [[deprecated]]
    bool locked();

    void open();

    void close();

    bool readTamperCheckButton();
    bool isClosed() const;
    bool isClosed(bool update);
    bool tamperCheck();
};
} // namespace BlackBox
#endif
