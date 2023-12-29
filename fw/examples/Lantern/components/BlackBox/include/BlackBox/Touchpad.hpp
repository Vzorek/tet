/**
 * @file BlackBox_Touchpad.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Knihovna pro převod dat z LDC na souřadnice
 * \~english @brief Library for converting LDC data to coords
 */

#pragma once

#include "Dsp.hpp"
#ifdef BB_TOUCHPAD

#include "BlackBox/LDC.hpp"
#include <cstdint>

// FIXME: Implement adaptive filter measuring average difference and update threshold based on that

namespace BlackBox
{
/**
 * \~czech @brief Datový typ pro uchovávání touchpad souřadnic
 * \~english @brief Data type for handling touchpad coordinates
 */
struct Coords {
    int x;
    int y;
    unsigned pressure;

    Coords(int x = 0, int y = 0, unsigned pressure = 0);
    Coords& operator=(Coords other);
    Coords operator+(Coords other) const;
    Coords& operator+=(Coords other);
};

/**
 * \~czech @brief Třída pro převod dat z LDC na souřadnice
 * \~english @brief Class for converting LDC data to coords
 */
class Touchpad
{
private:
    const int m_dataBitsToRemove;
    const std::uint8_t m_protectOverflow;
    const float m_calculationCoefficient[4];
    
    int removeOverflow(int value);
    int prepareData(int value, int channel);

    LDC* m_ldc = nullptr;
public:
    Touchpad(int dataBitsToRemove, std::uint8_t protectOverflow, float m_calculationCoefficient[4]);
    Touchpad(int dataBitsToRemove, std::uint8_t protectOverflow, float m_calcCoefs0, float m_calcCoefs1, float m_calcCoefs2, float m_calcCoefs3);
    ~Touchpad() = default;

    void init(LDC*);

    Coords calculate(int channel0, int channel1, int channel2, int channel3);
    Coords calculate(int channels[4]);
    Coords calculate(const LDC& ldc);
    Coords calculate(LDC& ldc, bool update);
    Coords calculate();
};
} // namespace BlackBox
#endif
