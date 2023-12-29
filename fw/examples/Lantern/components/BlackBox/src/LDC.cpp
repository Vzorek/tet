#include "Dsp.hpp"
#ifdef BB_LDC

#include "BlackBox/LDC.hpp"

#include "BlackBox/I2C.hpp"
#include "BlackBox/LDC16XX_regs.h"
#include "esp_log.h"
#include <cstdint>
#include <mutex>

namespace BlackBox {
void LDC::clearCache() {
    std::scoped_lock l(m_mutex);
    for (int i = 0; i < LDCRegs::MAX_ADDRESS; i++)
        m_regs.regs[i] = LDCRegs::resetValues[i];
}

void LDC::readRegister(LDCRegs::registerAddresses i_address) {
    if (i_address >= LDCRegs::RCOUNT0) {
        std::scoped_lock l(m_mutex);
        m_regs.regs[i_address] = readWord(LDCRegs::ldcGetHWAddress(i_address));
    } else
        readChannel(i_address / 2);
}

void LDC::writeRegister(LDCRegs::registerAddresses i_address) {
    std::scoped_lock l(m_mutex);
    m_regs.regs[i_address] &= LDCRegs::writeMask[i_address];
    writeWord(LDCRegs::ldcGetHWAddress(i_address), m_regs.regs[i_address]);
}

void LDC::writeRegister(LDCRegs::registerAddresses i_address, std::uint16_t i_value) {
    std::scoped_lock l(m_mutex);
    m_regs.regs[i_address] = i_value & LDCRegs::writeMask[i_address];
    writeWord(LDCRegs::ldcGetHWAddress(i_address), m_regs.regs[i_address]);
}

void LDC::readChannel(int i_channel) {
    std::scoped_lock l(m_mutex);
    
    m_regs.data[i_channel].regs[1] = readWord(i_channel * 2);
    m_regs.data[i_channel].regs[0] = readWord((i_channel * 2) + 1);
    
    if (m_regs.data[i_channel].regs[1] & ((0b1111) << 12)) {
        ESP_LOGE(m_tag, "Detected error in data from LDC.");

        if (m_regs.data[i_channel].amplitudeError)
            ESP_LOGE(m_tag, "Error is Amplitude Error");

        if (m_regs.data[i_channel].watchdogTimeoutError)
            ESP_LOGE(m_tag, "Error is Watchdog Timeout Error");

        if (m_regs.data[i_channel].overRangeError)
            ESP_LOGE(m_tag, "Error is Over Range Error");

        if (m_regs.data[i_channel].underRangeError)
            ESP_LOGE(m_tag, "Error is Under Range Error");
    }   
}

LDC::LDC(std::uint16_t i_address, i2c_port_t i_port)
    : Device(i_address, i_port) {
}

void LDC::init() { // FIXME: implement this, GPIO
    I2C::Ports::init(m_port);
    reset();
    configure();
}

void LDC::configure() {
    std::scoped_lock l(m_mutex);
    sleep();
    m_regs.muxConfig.autoScan = 1;
    m_regs.muxConfig.autoScanSequenceConfiguration = 0b10;
    m_regs.config.automaticAmplitudeDisable = true;
    writeRegister(LDCRegs::MUX_CONFIG);
    wake();
}

void LDC::readErrors() { // FIXME: implement this
    // Probably should create struct to return errors
    // Maybe it would be best to disable everything except DataReady
    // FIXME: Disable everything except DataReady atleast for now
    // This function will be used in interrupt so:
    // FIXME: Put this function to IRAM
}

void LDC::wake() {
    std::scoped_lock l(m_mutex);
    m_regs.config.sleepMode = 0;
    writeRegister(LDCRegs::CONFIG);
}

void LDC::sleep() {
    std::scoped_lock l(m_mutex);
    m_regs.config.sleepMode = 1;
    writeRegister(LDCRegs::CONFIG);
}

void LDC::syncCache() {
    std::scoped_lock l(m_mutex);
    for (int i = 0; i < LDCRegs::MAX_ADDRESS; i++)
        readRegister(static_cast<LDCRegs::registerAddresses>(i));
}

void LDC::syncChannels() {
    readChannel(0);
    readChannel(1);
    readChannel(2);
    readChannel(3);
}

void LDC::reset() {
    std::scoped_lock l(m_mutex);
    m_regs.resetDevice.resetDevice = 1;
    writeRegister(LDCRegs::RESET_DEV);
    m_regs.resetDevice.resetDevice = 0;
    clearCache();
}

LDCRegs::LDC16XX_dev_t LDC::registers() const {
    std::scoped_lock l(m_mutex);
    return m_regs;
}

const LDCRegs::LDC16XX_dev_t& LDC::regs() const {
    return m_regs;
}

void LDC::writeRegisters(const LDCRegs::LDC16XX_dev_t& i_regs) { // FIXME: implement this
    std::scoped_lock l(m_mutex);
    for (int i = 0; i < LDCRegs::MAX_ADDRESS; i++) {
        m_regs.regs[i] = i_regs.regs[i];
        writeRegister(static_cast<LDCRegs::registerAddresses>(i));
    }
}

std::uint32_t LDC::operator[](int i_channel) const {
    std::scoped_lock l(m_mutex);
    return m_regs.data[i_channel].value;
}

}
#endif
