/**
 * @file BlackBox_pinout.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief pinout desky BlackBox
 * \~english @brief pinout of BlackBox board
 */

#pragma once

#include "driver/gpio.h"

namespace BlackBox {

struct PowerPin {
    gpio_num_t pinNumber;
    bool onLevel; /*!< Level needed to put the thing which this pin controls to On state */
    bool defaultLevel; /*!< Default state of the pin as dictated by pull resistors on board */
};

namespace Pins {
namespace Leds {
constexpr gpio_num_t Data = GPIO_NUM_19;
} // namespace BlackBox::Pins::Leds

namespace I2C {
constexpr gpio_num_t SCL = GPIO_NUM_22;
constexpr gpio_num_t SDA = GPIO_NUM_23;
} // namespace BlackBox::Pins::I2C

namespace UART {
constexpr gpio_num_t TX = GPIO_NUM_1;
constexpr gpio_num_t RX = GPIO_NUM_3;
} // namespace BlackBox::Pins::UART

namespace Interrupts {
constexpr gpio_num_t LDC = GPIO_NUM_0;

constexpr gpio_num_t Magnetometer = GPIO_NUM_25; /*!< both BMX055 and QMC5883 */

constexpr gpio_num_t RTC = GPIO_NUM_26;

constexpr gpio_num_t Barometer = GPIO_NUM_27;

constexpr gpio_num_t Gyroscope1 = GPIO_NUM_32; /*!< BMX055 only */
constexpr gpio_num_t Gyroscope2 = GPIO_NUM_33; /*!< BMX055 only */

constexpr gpio_num_t Accelerometer1 = GPIO_NUM_34; /*!< Both BMX055 (1/2 of accelerometer) and MPU6050 (Accelerometer and Gyroscope) */
constexpr gpio_num_t Accelerometer2 = GPIO_NUM_35; /*!< BMX055 only */
} // namespace BlackBox::Pins::Interrupts

namespace Lock {
constexpr gpio_num_t A = GPIO_NUM_4;
constexpr gpio_num_t B = GPIO_NUM_13;

constexpr gpio_num_t Motor = GPIO_NUM_12;

constexpr gpio_num_t IsUSBConnected = GPIO_NUM_36;
} // namespace BlackBox::Pins::Lock

namespace IR {
constexpr gpio_num_t Receiver = GPIO_NUM_15;
constexpr gpio_num_t Transmitter = GPIO_NUM_2;
} // namespace BlackBox::Pins::IR

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
} // namespace BlackBox::Pins
} // namespace BlackBox