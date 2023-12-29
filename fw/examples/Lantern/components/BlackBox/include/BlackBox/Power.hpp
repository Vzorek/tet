/**
 * @file BlackBox_Power.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Knihovna pro ovládání napájení desky
 * \~english @brief Library for controling power pins
 */

#pragma once

#include "Dsp.hpp"
#ifdef BB_POWER

#include "BlackBox/pinout.hpp"

#include "driver/gpio.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "esp_adc/adc_oneshot.h"
#include "soc/adc_channel.h"
#include <memory>
#include <mutex>

namespace BlackBox {
/**
 * \~czech @brief Třída pro ovládání napájení desky
 * \~english @brief Class for controling power pins
 */
class Power {
private:
    static constexpr const char* s_tag = "Power";

    mutable std::recursive_mutex m_mutex;

    static constexpr int s_batteryVoltages[2] = { 3700, 4150 };
    static constexpr int s_baseVoltage = s_batteryVoltages[0];
    static constexpr int s_maxVoltage = s_batteryVoltages[1];
    static constexpr int s_voltageDifference = s_maxVoltage - s_baseVoltage;

    const Pins::PowerPin m_powerAll;
    const Pins::PowerPin m_power5V;
    const Pins::PowerPin m_powerLDC;

    const gpio_num_t m_usbConnectionCheck;

    const adc_channel_t m_channel;
    adc_oneshot_chan_cfg_t m_channelConfig;

    adc_oneshot_unit_handle_t m_adcUnit;
    adc_oneshot_unit_init_cfg_t m_unitConfig;

    adc_cali_handle_t m_calibration;

    bool m_isAllOn;
    bool m_is5VOn;
    bool m_isLDCOn;

    int m_voltage;

    gpio_config_t m_powerConfig;
    gpio_config_t m_usbConnectionCheckConfig;

    void setDefault();

    void readVoltage();

    static bool initCalibration(adc_unit_t unit, adc_channel_t channel, adc_atten_t atten, adc_bitwidth_t bitwidth, adc_cali_handle_t& out_handle);

public:
    Power(Pins::PowerPin powerAll = Pins::Power::PowerAll,
        Pins::PowerPin power5V = Pins::Power::Power5V,
        Pins::PowerPin powerLDC = Pins::Power::PowerLDC,
        gpio_num_t usbConnectionCheck = Pins::USB::IsUSBConnected,
        adc_channel_t = ADC_CHANNEL_3,
        adc_bitwidth_t = ADC_BITWIDTH_DEFAULT);

    ~Power() = default;

    void init();

    void turnOn(Pins::PowerPin);
    void turnOff(Pins::PowerPin);

    void turnOn();
    void turnOff();

    void turnOnLDC();
    void turnOffLDC();

    void turnOn5V();
    void turnOff5V();

    int batteryVoltage(bool update = false);
    int batteryPercentage(bool update = false);

    bool checkBatteryLevel(unsigned batteryLevel = s_baseVoltage, bool act = false);

    bool usbConnected();
};

} // namespace BlackBox
#endif
