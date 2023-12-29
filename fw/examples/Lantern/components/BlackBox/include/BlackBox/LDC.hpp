/**
 * @file BlackBox_LDC.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Knihovna pro práci s LDCXX14
 * \~english @brief Library for interfacing LDCXX14
 */

#pragma once

#include "Dsp.hpp"
#ifdef BB_LDC

#include "BlackBox/I2C.hpp"
#include "BlackBox/LDC16XX_regs.h"
#include "driver/i2c.h"
#include <cstdint>
#include <mutex>

namespace BlackBox {
/**
 * \~czech @brief Třída pro práci s LDCXX14
 * \~english @brief Class for interfacing with LDC
 */
class LDC : public I2C::Device {
private:
    LDCRegs::LDC16XX_dev_t m_regs;

    mutable std::recursive_mutex m_mutex;

    const char* m_tag = "LDC";

    void clearCache(); // Reset cache to default state

    void readRegister(LDCRegs::registerAddresses address); // Read register from LDC 

    void writeRegister(LDCRegs::registerAddresses address); // Write register to LDC
    void writeRegister(LDCRegs::registerAddresses address, std::uint16_t value); // Write register to LDC

    void readChannel(int channel); // Read channel from LDC
public:

    /**
     * \~czech @brief Vytvoří nový LDC objekt
     * \~english @brief Construct a new LDC object
     * 
     * @param address Address of LDC (0x2A or 0x2B)
     * @param port ESP32s i2c port on which LDC is connected
     */
    LDC(std::uint16_t address = 0x2A, i2c_port_t = I2C_NUM_0);
    ~LDC() = default;

    /**
     * \~czech @brief Inicializuje LDC
     * \~english @brief Initialize LDC
     */
    virtual void init() final;

    /**
     * \~czech @brief Nastaví LDC do výchozího funkčního stavu
     * \~english @brief Configure LDC to its default operation state
     */
    void configure(); // FIXME: this should have parameters for configuration

    /**
     * \~czech @brief Přečte jakékoliv nepřečtené chyby z LDC
     * \~english @brief Read any pending errors from LDC
     */
    void readErrors();

    /**
     * \~czech @brief Probudí LDC ze spánku
     * \~english @brief Wake up LDC from sleep mode
     */
    void wake();

    /**
     * \~czech @brief Uloží LDC ke spánku
     * \~english @brief Put LDC into sleep mode
     */
    void sleep();

    /**
     * \~czech @brief Synchronizuje (Read Only) všechny registry v paměti s jejich fyzickými protějšky v LDC
     * \~english @brief Synchronize (Read Only) all cached registers with their physical counterparts
     */
    void syncCache();

    /**
     * \~czech @brief Synchronizuje hodnoty kanálů v paměti s jejich fyzickými protějšky v LDC
     * \~english @brief Sync channel values in cache with their physical counterparts
     */
    void syncChannels();

    /**
     * \~czech @brief Resetuje LDC pomocí softwarového resetu
     * \~english @brief Reset LDC using SW reset
     */
    void reset();

    /**
     * \~czech @brief Vrátí kopii registrů v paměti
     * \~english @brief Retrieve copy of cached registers
     * 
     * @return copy of cached registers
     */
    LDCRegs::LDC16XX_dev_t registers() const;

    /**
     * \~czech @brief Vrátí konstantní referenci na registry v paměti
     * \~english @brief Retrieve const reference to cached registers
     * 
     * @return copy of cached registers
     */
    const LDCRegs::LDC16XX_dev_t& regs() const;

    /**
     * \~czech @brief Zapíše registry
     * \~english @brief Write registers
     */
    void writeRegisters(const LDCRegs::LDC16XX_dev_t&); // FIXME: probably should use pass by value for thread safety?

    /**
     * \~czech @brief Vrátí hodnotu na kanálu.
     * \~english @brief Returns value on channel.
     * 
     * @param channel(0-3) - channel of LDC whose value is to be returned
     * @return value 
     */
    std::uint32_t operator[](int channel) const;
};
} // namespace BlackBox
#endif
