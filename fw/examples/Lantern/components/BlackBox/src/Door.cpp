#include "Dsp.hpp"
#ifdef BB_DOORS

#include "BlackBox/Door.hpp"

#include "driver/gpio.h"
#include "driver/ledc.h"

namespace BlackBox {
void Door::drive(bool i_closed) {
    std::scoped_lock l(m_mutex);

    ledc_set_duty(LEDC_LOW_SPEED_MODE, m_channelConfig.channel, s_duty[i_closed]);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, m_channelConfig.channel);

    m_isClosed = i_closed;
}

Door::Door(Pins::DoorPin i_pins,
    ledc_timer_t i_timer,
    ledc_channel_t i_channel)
    : m_pins(i_pins)
    , m_timerConfig {
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .duty_resolution = LEDC_TIMER_16_BIT,
        .timer_num = i_timer,
        .freq_hz = 50,
        .clk_cfg = LEDC_AUTO_CLK,
    }
    , m_channelConfig {
        .gpio_num = m_pins.servo,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = i_channel,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = i_timer,
        .duty = 0,
        .hpoint = 0,
    }
    , m_tamperCheckConfig {
        .pin_bit_mask = (1ULL << m_pins.tamperCheck),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    } {}

void Door::init() {
    std::scoped_lock l(m_mutex);

    ESP_ERROR_CHECK(ledc_timer_config(&m_timerConfig));
    ESP_ERROR_CHECK(ledc_channel_config(&m_channelConfig));

    gpio_config(&m_tamperCheckConfig);
    isClosed(true);
}

void Door::lock() {
    drive(true);
}

void Door::unlock() {
    drive(false);
}

bool Door::locked() {
    std::scoped_lock l(m_mutex);

    return (ledc_get_duty(LEDC_LOW_SPEED_MODE, m_channelConfig.channel) == s_duty[s_closed]);
}

void Door::open() {
    drive(!s_closed);
}

void Door::close() {
    drive(s_closed);
}

bool Door::isClosed() const {
    std::scoped_lock l(m_mutex);

    return m_isClosed;
}

bool Door::isClosed(bool i_update) {
    if (i_update) {
        std::scoped_lock l(m_mutex);
        m_isClosed = ledc_get_duty(LEDC_LOW_SPEED_MODE, m_channelConfig.channel) == s_duty[s_closed];
    }
    return isClosed();
}

bool Door::readTamperCheckButton() {
    std::scoped_lock l(m_mutex);
    return gpio_get_level(m_pins.tamperCheck);
}

bool Door::tamperCheck() {
    return readTamperCheckButton() == isClosed(true);
}

} // namespace BlackBox
#endif
