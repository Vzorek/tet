#include "Dsp.hpp"
#ifdef BB_RTC

#include "BlackBox/RTC.hpp"

#include "BlackBox/I2C.hpp"
#include "BlackBox/M41T62_regs.hpp"
#include "driver/i2c.h"
#include <ctime>
#include <mutex>

namespace BlackBox {

void RTC::clearCache() {
    for (int i = 0; i < M41T62Regs::MaxAddress; i++)
        m_regs.regs[i] = M41T62Regs::defaultValues[i];
}

void RTC::readRegister(M41T62Regs::registerAddresses i_address) {
    std::scoped_lock l(m_mutex);
    m_regs.regs[i_address] = readByte(i_address);
}

void RTC::writeRegister(M41T62Regs::registerAddresses i_address) {
    std::scoped_lock l(m_mutex);
    writeByte(i_address, m_regs.regs[i_address]);
}

void RTC::writeRegister(M41T62Regs::registerAddresses i_address, std::uint8_t i_value) {
    std::scoped_lock l(m_mutex);
    m_regs.regs[i_address] = i_value;
    writeRegister(i_address);
}

RTC::RTC(std::uint16_t i_address, i2c_port_t i_port)
    : Device(i_address, i_port) {
}

void RTC::init() {
    I2C::Ports::init(m_port);
    reset();
    adjustESP();
}

void RTC::adjustRTC(std::tm i_newTime) {
    std::scoped_lock l(m_mutex);

    m_regs.time(i_newTime);

    writeBytes(M41T62Regs::Seconds, &m_regs.regs[M41T62Regs::Seconds], 7);
}

void RTC::adjustESP() {
    std::tm newTime;

    std::time_t start, end;
    std::time(&start);

    std::scoped_lock l(m_mutex);

    readBytes(M41T62Regs::Seconds, &m_regs.regs[M41T62Regs::Seconds], 7);

    newTime = m_regs.time();

    time_t helper = mktime(&newTime);

    std::time(&end);

    timeval tv = {
        .tv_sec = helper + (end - start),
        .tv_usec = 0,
    };

    settimeofday(&tv, nullptr);
}

void RTC::reset() {
    m_regs.stopBit = 1;
    writeRegister(M41T62Regs::Seconds);
    m_regs.stopBit = 0;
    writeRegister(M41T62Regs::Seconds);
}

std::tm RTC::now() {
    std::scoped_lock l(m_mutex);

    readBytes(M41T62Regs::Seconds, &m_regs.regs[M41T62Regs::Seconds], 7);
    return m_regs.time();
}

M41T62Regs::M41T62_dev_t RTC::registers() const {
    return m_regs;
}

const M41T62Regs::M41T62_dev_t& RTC::regs() const {
    return m_regs;
}

void RTC::writeRegisters(const M41T62Regs::M41T62_dev_t&) {
    writeBytes(M41T62Regs::Seconds, m_regs.regs, M41T62Regs::MaxAddress);
}

} // namespace BlackBox
#endif
