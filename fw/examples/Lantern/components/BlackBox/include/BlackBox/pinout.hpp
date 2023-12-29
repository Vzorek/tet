/**
 * @file BlackBox_pinout.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Soubor řídící více verzí pinoutu desky BlackBox 
 * \~english @brief File managing different versions of pinout
 */

#pragma once

#include "Dsp.hpp"

namespace BlackBox {

namespace Pins {

#ifdef BB_POWER

struct PowerPin {
    gpio_num_t pinNumber;
    bool onLevel; /*!< Level needed to put the thing which this pin controls to On state */
    bool defaultLevel; /*!< Default state of the pin as dictated by pull resistors on board */
};

namespace Power {
constexpr PowerPin PowerAll = {
    .pinNumber = GPIO_NUM_5,
    .onLevel = 1,
    .defaultLevel = 1,
};
constexpr PowerPin Power5V = {
    .pinNumber = GPIO_NUM_14,
    .onLevel = 0,
    .defaultLevel = 1,
};
constexpr PowerPin PowerLDC = {
    .pinNumber = GPIO_NUM_18,
    .onLevel = 0,
    .defaultLevel = 0,
};
constexpr gpio_num_t BatteryLevel = GPIO_NUM_39;
} // namespace BlackBox::Pins::Power
#endif // BB_POWER

#if defined(BB_RING) || defined(BB_BEACON) 

namespace Leds {
constexpr gpio_num_t Data = GPIO_NUM_19;
} // namespace BlackBox::Pins::Leds

#endif // BB_RING || BB_BEACON

#ifdef BB_I2C

namespace I2C {
constexpr gpio_num_t SCL = GPIO_NUM_22;
constexpr gpio_num_t SDA = GPIO_NUM_23;
} // namespace BlackBox::Pins::I2C

#endif  // BB_I2C

#ifdef BB_UART

namespace UART {
constexpr gpio_num_t TX = GPIO_NUM_1;
constexpr gpio_num_t RX = GPIO_NUM_3;
} // namespace BlackBox::Pins::UART

#endif // BB_UART

#ifdef BB_BMX

namespace Interrupts {
constexpr gpio_num_t Magnetometer = GPIO_NUM_25;
constexpr gpio_num_t Gyroscope1 = GPIO_NUM_32;
constexpr gpio_num_t Gyroscope2 = GPIO_NUM_33;
constexpr gpio_num_t Accelerometer1 = GPIO_NUM_34;
constexpr gpio_num_t Accelerometer2 = GPIO_NUM_35;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_BMX

#ifdef BB_LDC

namespace Interrupts {
constexpr gpio_num_t LDC = GPIO_NUM_0;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_LDC

#ifdef BB_RTC

namespace Interrupts {
constexpr gpio_num_t RTC = GPIO_NUM_26;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_RTC

#ifdef BB_BAROMETER

namespace Interrupts {
constexpr gpio_num_t Barometer = GPIO_NUM_27;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_BAROMETER

#ifdef BB_LOCK

namespace Lock {
constexpr gpio_num_t A = GPIO_NUM_4;
constexpr gpio_num_t B = GPIO_NUM_13;

constexpr gpio_num_t Motor = GPIO_NUM_12;
} // namespace BlackBox::Pins::Lock

#endif // BB_LOCK

#ifdef BB_USB

namespace USB
{
constexpr gpio_num_t IsUSBConnected = GPIO_NUM_36;
} // namespace BlackBox::Pins::USB

#endif // BB_USB

#ifdef BB_IR

namespace IR {
constexpr gpio_num_t Receiver = GPIO_NUM_15;
constexpr gpio_num_t Transmitter = GPIO_NUM_2;
} // namespace BlackBox::Pins::IR

#endif // BB_IR

#ifdef BB_MPU

namespace Interrupts {
constexpr gpio_num_t MPU = GPIO_NUM_34;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_MPU

#ifdef BB_QMC5883

namespace Interrupts {
constexpr gpio_num_t Magnetometer = GPIO_NUM_25;
} // namespace BlackBox::Pins::Interrupts

#endif // BB_QMC5883

#ifdef BB_PIEZO

namespace Sound {
constexpr gpio_num_t Piezo = GPIO_NUM_21;
} // namespace BlackBox::Pins::Sound

#endif // BB_PIEZO

#ifdef BB_A9

namespace A9 {
constexpr gpio_num_t TX = GPIO_NUM_33;
constexpr gpio_num_t RX = GPIO_NUM_32;
} // namespace BlackBox::Pins::A9

#endif // BB_A9

#ifdef BB_DOORS

struct DoorPin {
    gpio_num_t servo;
    gpio_num_t tamperCheck;
    bool unlockedState;
};

namespace Doors
{
constexpr gpio_num_t Servo0 = GPIO_NUM_27;
constexpr gpio_num_t Servo1 = GPIO_NUM_25;
constexpr gpio_num_t Servo2 = GPIO_NUM_13;
constexpr gpio_num_t Servo3 = GPIO_NUM_2;

constexpr gpio_num_t TamperCheck0 = GPIO_NUM_15;
constexpr gpio_num_t TamperCheck1 = GPIO_NUM_33;
constexpr gpio_num_t TamperCheck2 = GPIO_NUM_35;
constexpr gpio_num_t TamperCheck3 = GPIO_NUM_4;

constexpr DoorPin DoorPins[4] = {
    {
        .servo = Servo0,
        .tamperCheck = TamperCheck0,
        .unlockedState = 0,
    },
    {
        .servo = Servo1,
        .tamperCheck = TamperCheck1,
        .unlockedState = 0,
    },
    {
        .servo = Servo2,
        .tamperCheck = TamperCheck2,
        .unlockedState = 0,
    },
    {
        .servo = Servo3,
        .tamperCheck = TamperCheck3,
        .unlockedState = 0,
    },
};
} // namespace Doors

#endif // BB_DOORS

} // namespace BlackBox::Pins
} // namespace BlackBox