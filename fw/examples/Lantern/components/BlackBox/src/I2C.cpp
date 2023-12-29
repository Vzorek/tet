#include "Dsp.hpp"
#ifdef BB_I2C

#include "BlackBox/I2C.hpp"

#include "esp_log.h"
#include <cstdint>
#include <mutex>

namespace I2C {
Transmission::Transmission()
    : m_handle(i2c_cmd_link_create()) {
}

Transmission::Transmission(i2c_cmd_handle_t i_handle)
    : m_handle(std::exchange(i_handle, nullptr)) {
}

Transmission::Transmission(Transmission&& other) {
    std::scoped_lock lock(other.m_mutex);
    m_handle = std::exchange(other.m_handle, nullptr);
    m_sent = std::exchange(other.m_sent, true);
}

Transmission& Transmission::operator=(Transmission&& other) {
    if (this != &other) {
        std::scoped_lock lock(other.m_mutex, m_mutex);
        if (m_handle != nullptr) {
            i2c_cmd_link_delete(m_handle);
            m_handle = nullptr;
        }
        m_handle = std::exchange(other.m_handle, nullptr);
        m_sent = std::exchange(other.m_sent, true);
    }
    return *this;
}

Transmission::~Transmission() {
    std::scoped_lock lock(m_mutex);
    if (m_handle != nullptr) {
        i2c_cmd_link_delete(m_handle);
        m_handle = nullptr;
    }
}

esp_err_t Transmission::startBit() {
    std::scoped_lock lock(m_mutex);
    return i2c_master_start(m_handle);
}

esp_err_t Transmission::stopBit() {
    std::scoped_lock lock(m_mutex);
    return i2c_master_stop(m_handle);
}

esp_err_t Transmission::writeByte(std::uint8_t i_data, bool i_ackCheck) {
    std::scoped_lock lock(m_mutex);
    return i2c_master_write_byte(m_handle, i_data, i_ackCheck);
}

esp_err_t Transmission::readByte(std::uint8_t* o_data, ACKValue i_ackValue) {
    return i2c_master_read_byte(m_handle, o_data, static_cast<i2c_ack_type_t>(i_ackValue));
}

esp_err_t Transmission::write(std::uint8_t* i_data, size_t i_dataLengt, bool i_ackCheck) {
    std::scoped_lock lock(m_mutex);
    return i2c_master_write(m_handle, i_data, i_dataLengt, i_ackCheck);
}

esp_err_t Transmission::read(std::uint8_t* o_data, size_t i_dataLengt, ACKValue i_ackValue) {
    std::scoped_lock lock(m_mutex);
    return i2c_master_read(m_handle, o_data, i_dataLengt, static_cast<i2c_ack_type_t>(i_ackValue));
}

esp_err_t Transmission::send(i2c_port_t i_i2cNum, TickType_t i_ticksToWait) {
    std::scoped_lock lock(m_mutex);
    m_sent = true;
    return i2c_master_cmd_begin(i_i2cNum, m_handle, i_ticksToWait);
}

void Transmission::reset() {
    std::scoped_lock lock(m_mutex);
    if (!m_sent)
        ESP_LOGW(m_tag, "Reseting without sending data!");
    i2c_cmd_link_delete(m_handle);
    m_handle = i2c_cmd_link_create();
    m_sent = false;
}

i2c_cmd_handle_t Transmission::raw() {
    std::scoped_lock lock(m_mutex);
    return m_handle;
}

void Transmission::detach() {
    std::scoped_lock lock(m_mutex);
    m_handle = NULL;
}

Device::Device(std::uint16_t i_address, i2c_port_t i_port)
    : m_address(i_address)
    , m_port(i_port) {
}

uint8_t Device::readByte(std::uint8_t i_registerAddress) {
    std::uint8_t data;
    I2C::Transmission transmission;
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_READ, EnableACKCheck);
    transmission.readByte(&data, NACK);
    transmission.stopBit();
    transmission.send(m_port);
    return data;
}

void Device::readBytes(std::uint8_t i_registerAddress, std::uint8_t* o_data, size_t i_dataLength) {
    I2C::Transmission transmission;
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_READ, EnableACKCheck);
    transmission.read(o_data, i_dataLength, LastNACK);
    transmission.stopBit();
    transmission.send(m_port);
}

std::uint16_t Device::readWord(std::uint8_t i_registerAddress) {
    I2C::Transmission transmission;
    std::uint8_t data[] = { 0, 0 };
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_READ, EnableACKCheck);
    transmission.read(data, 2, LastNACK);
    transmission.stopBit();
    transmission.send(m_port);
    return ((data[0] << 8) | data[1]);
}

void Device::writeByte(std::uint8_t i_registerAddress, std::uint8_t i_data) {
    I2C::Transmission transmission;
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.writeByte(i_data, EnableACKCheck);
    transmission.stopBit();
    transmission.send(m_port);
}

void Device::writeBytes(std::uint8_t i_registerAddress, std::uint8_t* i_data, size_t i_dataLength) {
    I2C::Transmission transmission;
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.write(i_data, i_dataLength, EnableACKCheck);
    transmission.stopBit();
    transmission.send(m_port);
}

void Device::writeWord(std::uint8_t i_registerAddress, std::uint16_t i_data) {
    I2C::Transmission transmission;
    std::uint8_t* data = reinterpret_cast<std::uint8_t*>(&i_data);
    std::swap(data[0], data[1]);
    transmission.startBit();
    transmission.writeByte((m_address << 1) | I2C_MASTER_WRITE, EnableACKCheck);
    transmission.writeByte(i_registerAddress, EnableACKCheck);
    transmission.write(data, 2, EnableACKCheck);
    transmission.stopBit();
    transmission.send(m_port);
}

std::uint16_t Device::address() const {
    return m_address;
}

i2c_port_t Device::port() const {
    return m_port;
}

void Device::init() {
    I2C::Ports::init(m_port);
}

void Ports::init(i2c_port_t i_port, const i2c_config_t& i_config, size_t i_slaveRxBuffer, size_t i_slaveTxBuffer, int i_intrAllockationFlag) {
    bool expected = false;
    if (!initializedPorts[i_port].compare_exchange_strong(expected, true))
        return;
    ESP_ERROR_CHECK(i2c_param_config(i_port, &i_config));
    ESP_ERROR_CHECK(i2c_driver_install(i_port, i_config.mode, i_slaveRxBuffer, i_slaveTxBuffer, i_intrAllockationFlag));
}

void Ports::config(i2c_port_t i_port, const i2c_config_t& i_config) {
    if (isInitialized(i_port)) {
        ESP_ERROR_CHECK(i2c_param_config(i_port, &i_config));
    } else {
        ESP_LOGE(tag, "Trying configuring without init on port: %i", i_port);
    }
}

void Ports::deinit(i2c_port_t i_port) {
    if (isInitialized(i_port)) {
        ESP_ERROR_CHECK(i2c_driver_delete(i_port));
        initializedPorts[i_port].store(false);
    } else {
        ESP_LOGE(tag, "Trying to deinit without init on port: %i", i_port);
    }
}

bool Ports::isInitialized(i2c_port_t i_port) {
    return initializedPorts[i_port].load();
}
}
#endif
