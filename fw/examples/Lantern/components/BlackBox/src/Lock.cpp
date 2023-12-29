#include "Dsp.hpp"
#ifdef BB_LOCK

#include "BlackBox/Lock.hpp"

#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "BlackBox/pinout.hpp"

namespace BlackBox {
void Lock::drive(bool i_locked, int i_duty) {
    std::scoped_lock l(m_mutex);
    ESP_LOGV(m_tag, "Driving lock to: %i;\t Previous state: %i;\t Physical state: %i", i_locked, m_isLocked, gpio_get_level(m_encoderA) == s_locked);

    if (i_locked != m_isLocked) {
        ledc_set_duty(LEDC_HIGH_SPEED_MODE, m_channelConfig.channel, i_duty);
        ledc_update_duty(LEDC_HIGH_SPEED_MODE, m_channelConfig.channel);
        if (i_locked) {
            while (gpio_get_level(m_encoderA) != s_locked) { // FIXME: Change this to use interrupts rather than polling == make this non-blocking
                vTaskDelay(10 / portTICK_PERIOD_MS);
            }
        } else {
            while (gpio_get_level(m_encoderA) == s_locked) {
                vTaskDelay(10 / portTICK_PERIOD_MS);
            }
        }
        ledc_set_duty(LEDC_HIGH_SPEED_MODE, m_channelConfig.channel, 0);
        ledc_update_duty(LEDC_HIGH_SPEED_MODE, m_channelConfig.channel);
        m_isLocked = i_locked;
    }
}

void Lock::readState() {
    std::scoped_lock l(m_mutex);
    m_isLocked = (gpio_get_level(m_encoderA) == s_locked);
}

Lock::Lock(gpio_num_t i_motor,
    gpio_num_t i_encoderA,
    gpio_num_t i_encoderB,
    ledc_timer_t i_timer,
    ledc_channel_t i_channel)
    : m_isLocked(false)
    , m_motor(i_motor)
    , m_encoderA(i_encoderA)
    , m_encoderB(i_encoderB)
    , m_timerConfig {
        .speed_mode = LEDC_HIGH_SPEED_MODE,
        .duty_resolution = LEDC_TIMER_5_BIT,
        .timer_num = i_timer,
        .freq_hz = 100,
        .clk_cfg = LEDC_AUTO_CLK,
    }
    , m_channelConfig {
        .gpio_num = i_motor,
        .speed_mode = LEDC_HIGH_SPEED_MODE,
        .channel = i_channel,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = i_timer,
        .duty = 0,
        .hpoint = 0,
    }
    , m_encoderConfig {
        .pin_bit_mask = ((1ULL << i_encoderA) | (1ULL << i_encoderB)), // FIXME: Update this to newer version with new hall sensor
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    } {
}

void Lock::init() {
    std::scoped_lock l(m_mutex);

    ledc_timer_config(&m_timerConfig);
    ledc_channel_config(&m_channelConfig);

    gpio_config(&m_encoderConfig); // FIXME: Update this to newer version with new hall sensor

    readState();
}

void Lock::lock() {
    drive(true);
}

void Lock::unlock() {
    drive(false);
}

bool Lock::locked() {
    std::scoped_lock l(m_mutex);
    return m_isLocked;
}

} // namespace BlackBox
#endif
