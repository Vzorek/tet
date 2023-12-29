/**
 * @file BlackBox_Lock.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Knihovna pro práci se zámkem lock
 * \~english @brief Library for interfacing with lock
 */

#pragma once

#include "Dsp.hpp"
#ifdef BB_LOCK

#include "BlackBox/pinout.hpp"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include <mutex>

namespace BlackBox {
/**
 * \~czech @brief Třída pro ovládání zámku
 * \~english @brief Class for controling lock
 */
class Lock {
private:
    const char* m_tag = "Lock";

    bool m_isLocked;

    static constexpr int s_locked = 1;

    mutable std::recursive_mutex m_mutex;

    gpio_num_t m_motor;
    gpio_num_t m_encoderA;
    gpio_num_t m_encoderB;

    ledc_timer_config_t m_timerConfig;
    ledc_channel_config_t m_channelConfig;

    gpio_config_t m_encoderConfig;

    void drive(bool locked, int duty = 0b110); // FIXME: test maximum reliable speed and use it

    void readState();

public:
    ~Lock() = default;

    /**
     * \~czech @brief Vytvoří nový Lock objekt
     * \~english @brief Construct a new Lock object
     * 
     * @param motor pin on which motor is connected
     * @param encoderA pin on which encoder is connected
     * @param encoderB pin on which encoder is connected
     * @param timer number of timer to use (for compability with other applications)
     * @param channel number of LEDC channel to use (for compability with other applications)
     */
    Lock(gpio_num_t motor = Pins::Lock::Motor,
        gpio_num_t encoderA = Pins::Lock::A,
        gpio_num_t encoderB = Pins::Lock::B,
        ledc_timer_t timer = LEDC_TIMER_0,
        ledc_channel_t channel = LEDC_CHANNEL_0);

    /**
     * \~czech @brief Inicializuje zámek
     * \~english @brief Initialize lock
     */
    void init();

    /**
     * \~czech @brief Zamkne zámek
     * \~english @brief Lock lock
     */
    void lock();

    /**
     * \~czech @brief Odemkne zámek
     * \~english @brief Unlock lock
     */
    void unlock();

    /**
     * \~czech @brief Vrátí zda je zámek zamčený, nebo ne
     * \~english @brief Whether or not the lock is locked
     * 
     * @retval true - locked
     * @retval false - unlocked
     */
    bool locked();
};
} // namespace BlackBox
#endif
