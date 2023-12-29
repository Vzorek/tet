#include "Dsp.hpp"
#ifdef BB_POWER

#include "BlackBox/Power.hpp"

#include "BlackBox/pinout.hpp"

#include "driver/gpio.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "soc/adc_channel.h"

#include <algorithm>
#include <mutex>

namespace BlackBox {
void Power::setDefault() {
    std::scoped_lock l(m_mutex);
    gpio_set_level(m_powerAll.pinNumber, m_powerAll.defaultLevel);
    gpio_set_level(m_powerLDC.pinNumber, m_powerLDC.defaultLevel);
    gpio_set_level(m_power5V.pinNumber, m_power5V.defaultLevel);
}

void Power::readVoltage() {
    std::scoped_lock l(m_mutex);
    int raw;
    int voltage;
    adc_oneshot_read(m_adcUnit, static_cast<adc_channel_t>(m_channel), &raw);
    adc_cali_raw_to_voltage(m_calibration, raw, &voltage);
    m_voltage = static_cast<float>(voltage) * 4.34;
}

Power::Power(Pins::PowerPin i_powerAll,
    Pins::PowerPin i_power5V,
    Pins::PowerPin i_powerLDC,
    gpio_num_t i_usbConnectionCheck,
    adc_channel_t i_channel,
    adc_bitwidth_t i_width)
    : m_powerAll(i_powerAll)
    , m_power5V(i_power5V)
    , m_powerLDC(i_powerLDC)
    , m_usbConnectionCheck(i_usbConnectionCheck)
    , m_channel(i_channel)
    , m_channelConfig {
        .atten = ADC_ATTEN_DB_6,
        .bitwidth = i_width,
    }
    , m_adcUnit(nullptr)
    , m_unitConfig {
        .unit_id = ADC_UNIT_1,
        .clk_src = ADC_RTC_CLK_SRC_DEFAULT,
        .ulp_mode = ADC_ULP_MODE_DISABLE,
    }
    , m_calibration(nullptr)
    , m_isAllOn(i_powerAll.defaultLevel)
    , m_is5VOn(i_power5V.defaultLevel)
    , m_isLDCOn(i_powerLDC.defaultLevel)
    , m_powerConfig {
        .pin_bit_mask = ((1ULL << i_powerAll.pinNumber) | (1ULL << i_power5V.pinNumber) | (1ULL << i_powerLDC.pinNumber)),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    }
    , m_usbConnectionCheckConfig {
        .pin_bit_mask = (1ULL << i_usbConnectionCheck),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    } {
}

bool Power::initCalibration(adc_unit_t unit, adc_channel_t channel, adc_atten_t atten, adc_bitwidth_t bitwidth, adc_cali_handle_t& out_handle) {

    adc_cali_handle_t handle = NULL;
    esp_err_t ret = ESP_FAIL;
    bool calibrated = false;

#if ADC_CALI_SCHEME_CURVE_FITTING_SUPPORTED
    if (!calibrated) {
        ESP_LOGI(s_tag, "calibration scheme version is %s", "Curve Fitting");
        adc_cali_curve_fitting_config_t cali_config = {
            .unit_id = unit,
            .chan = channel,
            .atten = atten,
            .bitwidth = bitwidth,
        };
        ret = adc_cali_create_scheme_curve_fitting(&cali_config, &handle);
        if (ret == ESP_OK) {
            calibrated = true;
        }
    }
#endif

#if ADC_CALI_SCHEME_LINE_FITTING_SUPPORTED
    if (!calibrated) {
        ESP_LOGI(s_tag, "calibration scheme version is %s", "Line Fitting");
        adc_cali_line_fitting_config_t cali_config = {
            .unit_id = unit,
            .atten = atten,
            .bitwidth = bitwidth,
            .default_vref = 1100,
        };
        ret = adc_cali_create_scheme_line_fitting(&cali_config, &handle);
        if (ret == ESP_OK) {
            calibrated = true;
        }
    }
#endif

    out_handle = handle;
    if (ret == ESP_OK) {
        ESP_LOGI(s_tag, "Calibration Success");
    } else if (ret == ESP_ERR_NOT_SUPPORTED || !calibrated) {
        ESP_LOGW(s_tag, "eFuse not burnt, skip software calibration");
    } else {
        ESP_LOGE(s_tag, "Invalid arg or no memory");
    }

    return calibrated;
}

void Power::init() {
    std::scoped_lock l(m_mutex);
    setDefault();
    gpio_config(&m_powerConfig);
    gpio_config(&m_usbConnectionCheckConfig);

    adc_oneshot_new_unit(&m_unitConfig, &m_adcUnit);

    adc_oneshot_config_channel(m_adcUnit, static_cast<adc_channel_t>(m_channel), &m_channelConfig);

    if (!initCalibration(m_unitConfig.unit_id, static_cast<adc_channel_t>(m_channel), m_channelConfig.atten, m_channelConfig.bitwidth, m_calibration))
        throw std::runtime_error("Power calibration failed");
}

void Power::turnOn(Pins::PowerPin i_powerPin) {
    std::scoped_lock l(m_mutex);
    gpio_set_level(i_powerPin.pinNumber, i_powerPin.onLevel);
}

void Power::turnOff(Pins::PowerPin i_powerPin) {
    std::scoped_lock l(m_mutex);
    gpio_set_level(i_powerPin.pinNumber, !i_powerPin.onLevel);
}

void Power::turnOn() {
    turnOn(m_powerAll);
}

void Power::turnOff() {
    turnOff(m_powerAll);
}

void Power::turnOnLDC() {
    turnOn(m_powerLDC);
}

void Power::turnOffLDC() {
    turnOff(m_powerLDC);
}

void Power::turnOn5V() {
    turnOn(m_power5V);
}

void Power::turnOff5V() {
    turnOff(m_power5V);
}

int Power::batteryVoltage(bool update) {
    std::scoped_lock l(m_mutex);
    if (update)
        readVoltage();
    return m_voltage;
}

int Power::batteryPercentage(bool i_update) {
    return std::max(std::min(((batteryVoltage(i_update) - s_baseVoltage) * 100 / s_voltageDifference), 100), 0);
}

bool Power::checkBatteryLevel(unsigned i_batteryLevel, bool i_act) {
    bool check = batteryVoltage(true) < i_batteryLevel;
    if (check && i_act)
        turnOff();
    return !check;
}

bool Power::usbConnected() {
    std::scoped_lock l(m_mutex);

    return gpio_get_level(m_usbConnectionCheck);
}

} // namespace BlackBox
#endif
