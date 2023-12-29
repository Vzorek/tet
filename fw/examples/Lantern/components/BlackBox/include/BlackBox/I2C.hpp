/**
 * @file BlackBox_I2C.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief knihovna pro práci s I2C
 * \~english @brief library for working with I2C
 */
#pragma once

#include "Dsp.hpp"
#ifdef BB_I2C

#include "BlackBox/pinout.hpp"
#include "driver/i2c.h"
#include <atomic>
#include <cstdint>
#include <mutex>
#include <utility>

namespace I2C {

enum ACKCheck {
    DisableACKCheck = false,
    EnableACKCheck = true,
};

enum ACKValue {
    ACK = I2C_MASTER_ACK,
    NACK = I2C_MASTER_NACK,
    LastNACK = I2C_MASTER_LAST_NACK,
};

/**
 * \~czech @brief RAII wrapper pro i2c komunikaci v ESP-IDF
 * \~english @brief RAII wrapper for ESP-IDFs i2c commands
 */
class Transmission {
private:
    Transmission(const Transmission&) = delete;
    Transmission& operator=(const Transmission&) = delete;

    mutable std::recursive_mutex m_mutex;
    const char* m_tag = "I2C_Transmission";

    i2c_cmd_handle_t m_handle;
    bool m_sent = false;

public:
    /**
     * \~czech @brief Vytvoří čistý objekt Transmission
     * \~english @brief Construct a new clean Transmission object
     */
    Transmission();

    /**
     * \~czech @brief Vytvoří nový objekt Transmission z existující handle
     * \~english @brief Construct a new Transmission object from existing handle
     * 
     */
    explicit Transmission(i2c_cmd_handle_t);

    Transmission(Transmission&&);
    Transmission& operator=(Transmission&&);

    ~Transmission();

    /**
     * \~czech @brief Zařadí start bit do přenosu
     * \~english @brief Queue start bit into transmission
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t startBit();

    /**
     * \~czech @brief Zařadí stop bit do přenosu
     * \~english @brief Queue stop bit into transmission
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t stopBit();

    /**
     * \~czech @brief Přidá zápis 1 byte do přenosu
     * \~english @brief Add write of 1 byte into transmission 
     * 
     * @param data data byte to write
     * @param ackCheck enable ack checks
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t writeByte(std::uint8_t data, bool ACKCheck = EnableACKCheck);

    /**
     * \~czech @brief Přidá čtení 1 byte do přenosu
     * \~english @brief Add read of 1 byte into transmission
     * 
     * @param data buffer to put read data into
     * @param ackValue ack value for read command
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t readByte(std::uint8_t* data, ACKValue = ACK);

    /**
     * \~czech @brief Přidá zápis bufferu do přenosu 
     * \~english @brief Add write of buffer into transmission 
     * 
     * @param data data byte to write
     * @param dataLength length of data
     * @param ackCheck enable ack checks
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t write(std::uint8_t* data, size_t dataLength, bool ackCheck = EnableACKCheck);

    /**
     * \~czech @brief Přidá čtení bufferu do přenosu 
     * \~english @brief Add read of buffer into transmission
     * 
     * @param data buffer to put read data into
     * @param dataLength length of data
     * @param ackType ack value for read command
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     */
    esp_err_t read(std::uint8_t* data, size_t dataLength, ACKValue = ACK);

    /**
     * \~czech @brief Odešle příkazy zařazené v přenosu
     * \~english @brief Send queued commands
     * 
     * @param i2cNum I2C port
     * @param ticksToWait maximum wait ticks
     * 
     * @return
     *     - ESP_OK Success
     *     - ESP_ERR_INVALID_ARG Parameter error
     *     - ESP_FAIL Sending command error, slave doesn't ACK the transfer.
     *     - ESP_ERR_INVALID_STATE I2C driver not installed or not in master mode.
     *     - ESP_ERR_TIMEOUT Operation timeout because the bus is busy.
     */
    esp_err_t send(i2c_port_t i2cNum, TickType_t ticksToWait = 1000 / portTICK_PERIOD_MS);

    /**
     * \~czech @brief Vymaž zařazené příkazy pro pozdější použití přenosu
     * \~english @brief Reset this transmission for future use
     */
    void reset();

    /**
     * \~czech @brief Vrátí handle k ESP-IDF i2c handle
     * \~english @brief Get the raw handle to I2C_cmd
     * 
     * @return raw handle
     */
    i2c_cmd_handle_t raw();

    /**
     * \~czech @brief Oddělí RAII objekt od i2c_cmd_handle
     * \~english @brief Detach the RAII object from i2c_cmd_handle
     * 
     */
    void detach();
};

/**
 * \~czech @brief Základní třída pro I2C zařízení
 * \~english @brief Base class for I2C devices
 */
class Device { // FIXME: This has to change to be implemented as "universal", write and read functions need to be public, but what with derived classes should we not derive them but nest them?
protected:
    std::uint16_t m_address;

    i2c_port_t m_port;

    Device() = delete;
public:
    virtual ~Device() = default;

    /**
     * \~czech @brief Přečte 1 byte ze zařízení
     * \~english @brief Read a single byte from device
     * 
     * @param registerAddress 
     * @return read data
     */
    std::uint8_t readByte(std::uint8_t registerAddress);

    /**
     * \~czech @brief Přečte více bytů ze zařízení
     * \~english @brief Read multiple bytes from device
     * 
     * @param registerAddress
     * @param data Pointer to variable where to store read data
     * @param dataLength Length of data to be read
     */
    void readBytes(std::uint8_t registerAddress, std::uint8_t* data, size_t dataLength);

    /**
     * \~czech @brief Přečte 1 word (2 byty) ze zařízení
     * \~english @brief Read a single word (2 bytes) from device
     * 
     * @param registerAddress 
     * @return read data 
     */
    std::uint16_t readWord(std::uint8_t registerAddress);

    /**
     * \~czech @brief Zapíše 1 byte do zařízení
     * \~english @brief Write a single byte to device
     * 
     * @param registerAddress 
     * @param data 
     */
    void writeByte(std::uint8_t registerAddress, std::uint8_t data);

    /**
     * \~czech @brief Zapíše více bytů do zařízení
     * \~english @brief Write multiple bytes to device
     * 
     * @param registerAddress 
     * @param data Pointer to the data variable
     * @param dataLength Length of data to be written
     */
    void writeBytes(std::uint8_t registerAddress, std::uint8_t* data, size_t dataLength);

    /**
     * \~czech @brief Zapíše 1 word (2 byty) do zařízení
     * \~english @brief Write a single word (2 bytes) to device
     * 
     * @param registerAddress 
     * @param data 
     */
    void writeWord(std::uint8_t registerAddress, std::uint16_t data);

    /**
     * \~czech @brief Vytvoří nový Device objekt
     * \~english @brief Construct a new Device object
     * 
     * @param address address of device
     * @param port i2c port on which device is connected
     */
    Device(std::uint16_t address, i2c_port_t);

    /**
     * \~czech @brief Vrátí adresu I2C zařízení specifikovanou při inicializaci
     * \~english @brief Returns address of I2C device specified on initialization
     * @return address 
     */
    std::uint16_t address() const;

    i2c_port_t port() const;

    virtual void init(); // FIXME: Write init for i2c device
};

namespace Ports {
constexpr char const* tag = "I2C_Port_Guard";

static std::atomic<bool> initializedPorts[I2C_NUM_MAX];

/**
 * \~czech @brief Výchozí nastavení kompatibilní se všemi zabudovanými I2C periferiemi BlackBoxu
 * \~english @brief Default configuration to be used with all built-in I2C devices on BlackBox
 */
constexpr i2c_config_t defaultConfig = {
    // FIXME: Make this overritable easily
    .mode = I2C_MODE_MASTER,
    .sda_io_num = ::BlackBox::Pins::I2C::SDA,
    .scl_io_num = ::BlackBox::Pins::I2C::SCL,
    .sda_pullup_en = true,
    .scl_pullup_en = true,
    .master = {
        .clk_speed = 400000, // FIXME: Do all devices support this speed?
    },
    .clk_flags = I2C_SCLK_SRC_FLAG_FOR_NOMAL,
};

// FIXME: Should I implement counting on inits and call deinit after all I2C::Devices are destroyed?
/**
 * \~czech @brief Inicializuje daný I2C port.
 * \~english @brief Initialize given I2C port.
 * 
 * @param port 
 * @param config 
 * @param slaveRxBuffer 
 * @param slaveTxBuffer 
 * @param intrAllocationFlag 
 */
void init(i2c_port_t, const i2c_config_t& = defaultConfig, size_t slaveRxBuffer = 0, size_t slaveTxBuffer = 0, int intrAllocationFlag = 0);

/**
 * \~czech @brief Nastav daný I2C port.
 *                @note
 *                Port musí být již inicializovaný, jinak se nic nestane
 * \~english @brief Configure given I2C port.
 *                @note
 *                The port must already be initialized otherwise the configuration won't happen
 * 
 * @param port 
 * @param config 
 */
void config(i2c_port_t, const i2c_config_t& config = defaultConfig);

/**
 * \~czech @brief De-inicializuje daný I2C port.
 *                @note
 *                Port musí být již inicializovaný
 * \~english @brief Deinitialize given I2C port.
 *           @note
 *           The port must already be initialized
 * 
 * @param port
 */
void deinit(i2c_port_t);

/**
 * \~czech @brief Vrátí zda je daný I2C port již inicializovaný
 * \~english @brief Returns whether or not is given I2C port initialized
 * 
 * @param port
 * 
 * @return initialization state
 */
bool isInitialized(i2c_port_t);
};

}
#endif
