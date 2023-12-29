/**
 * @file BlackBox_Manger.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Knihovna řídící všechny ostatní knihovny
 * \~english @brief Library controling all of the other hardware libraries
 */

#pragma once

#include "Dsp.hpp"

#include "BlackBox/Beacon.hpp"
#include "BlackBox/LDC.hpp"
#include "BlackBox/Lock.hpp"
#include "BlackBox/Power.hpp"
#include "BlackBox/Ring.hpp"
#include "BlackBox/RTC.hpp"
#include "BlackBox/Touchpad.hpp"
#include "BlackBox/Door.hpp"

#include <array>

namespace BlackBox {
/**
 * \~czech @brief Třída řídící všechny ostatní knihovny hardwarové abstrakce
 * \~english @brief Class controling all of the other hardware abstraction classes
 */
class Manager {
private:
    Manager();
#ifdef BB_LDC
    LDC m_ldc;
#endif

#ifdef BB_LOCK
    Lock m_lock;
#endif

#ifdef BB_POWER
    Power m_power;
#endif

#ifdef BB_RING
    Ring m_ring;
#endif

#ifdef BB_BEACON
    Beacon<> m_beacon{Beacon<>::TopIndex(8), Beacon<>::PerimeterIndex(-10)};
#endif

#ifdef BB_RTC
    RTC m_rtc;
#endif

#ifdef BB_TOUCHPAD
    Touchpad m_touchpad{16, 0b1111, 1, 1, 1, 1};
#endif

#ifdef BB_DOORS
    std::array<Door, 4> m_doors = {Door(Pins::Doors::DoorPins[0], LEDC_TIMER_0, LEDC_CHANNEL_0), Door(Pins::Doors::DoorPins[1], LEDC_TIMER_1, LEDC_CHANNEL_1), Door(Pins::Doors::DoorPins[2], LEDC_TIMER_2, LEDC_CHANNEL_2), Door(Pins::Doors::DoorPins[3], LEDC_TIMER_3, LEDC_CHANNEL_3)};
#endif

public:
    Manager(Manager const&) = delete;
    void operator=(Manager const&) = delete;

    static Manager& singleton()
    {
        static Manager instance;
        return instance;
    }

    void init();

#ifdef BB_LDC
    LDC& ldc();
#endif

#ifdef BB_LOCK
    Lock& lock();
#endif

#ifdef BB_POWER
    Power& power();
#endif

#ifdef BB_RING
    Ring& ring();
#endif

#ifdef BB_BEACON
    Beacon<>& beacon();
#endif

#ifdef BB_RTC
    RTC& rtc();
#endif

#ifdef BB_TOUCHPAD
    Touchpad& touchpad();
#endif

#ifdef BB_DOORS
    Door& door(int number);
    std::array<Door, 4>& doors();
#endif

};

} // namespace BlackBox
