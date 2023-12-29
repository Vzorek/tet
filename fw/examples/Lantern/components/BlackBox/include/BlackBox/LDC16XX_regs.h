/**
 * @file LDC16XX_regs.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Seznam LDC registrů
 * \~english @brief List of LDC registers
 */

#pragma once

#include <stdint.h>

namespace LDCRegs {

union LDC16XX_dev_t {
    struct {
        union {
            struct {
                uint32_t value : 28;
                uint32_t amplitudeError : 1;
                uint32_t watchdogTimeoutError : 1;
                uint32_t overRangeError : 1;
                uint32_t underRangeError : 1;
            };
            uint16_t regs[2];
            uint8_t bytes[4];
        } data[4];

        uint16_t referenceCount[4];

        uint16_t offset[4];

        uint16_t settleCount[4];

        union {
            struct {
                uint16_t referenceDivider : 10;
                uint16_t reserved : 2;
                uint16_t inputDivider : 4;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } clockDividers[4];

        union {
            struct {
                uint16_t unreadConversion3 : 1;
                uint16_t unreadConversion2 : 1;
                uint16_t unreadConversion1 : 1;
                uint16_t unreadConversion0 : 1;
                uint16_t reserved : 2;
                uint16_t dataReady : 1;
                uint16_t reserved1 : 1;
                uint16_t zeroCountError : 1;
                uint16_t sensorAmplitudeLowError : 1;
                uint16_t sensorAmplitudeHighError : 1;
                uint16_t watchdogTimeoutError : 1;
                uint16_t conversionOverRangeError : 1;
                uint16_t conversionUnderRangeError : 1;
                uint16_t errorChannel : 2;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } status;

        union {
            struct {
                uint16_t dataReadyToINTB : 1;
                uint16_t reserved : 1;
                uint16_t zeroCountErrorToINTB : 1;
                uint16_t amplitudeLowErrorToINTB : 1;
                uint16_t amplitudeHighErrorToINTB : 1;
                uint16_t watchdogTimeoutErrorToINTB : 1;
                uint16_t overRangeErrorToINTB : 1;
                uint16_t underRangeErrorToINTB : 1;
                uint16_t reserved1 : 2;
                uint16_t amplitudeLowErrorToOutputRegister : 1;
                uint16_t amplitudeHighErrorToOutputRegister : 1;
                uint16_t watchdogTimeoutErrorToOutputRegister : 1;
                uint16_t overRangeErrorToOutputRegister : 1;
                uint16_t underRangeErrorToOutputRegister : 1;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } errorConfig;

        union {
            struct {
                uint16_t reserved : 6;
                uint16_t highCurrentSensorDrive : 1;
                uint16_t intbDisable : 1;
                uint16_t reserved1 : 1;
                uint16_t referenceFrequencySource : 1;
                uint16_t automaticAmplitudeDisable : 1;
                uint16_t sensorActivationMode : 1;
                uint16_t sensorRPOverride : 1;
                uint16_t sleepMode : 1;
                uint16_t activeChannel : 2;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } config;

        union {
            struct {
                uint16_t deglitch : 3;
                uint16_t reserved : 10;
                uint16_t autoScanSequenceConfiguration : 2;
                uint16_t autoScan : 1;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } muxConfig;

        union {
            struct {
                uint16_t reserved0 : 9;
                uint16_t outputGain : 2;
                uint16_t reserved1 : 4;
                uint16_t resetDevice : 1;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } resetDevice;

        union {
            struct {
                uint16_t reserved : 6;
                uint16_t initIDrive : 5;
                uint16_t IDrive : 5;
            };
            uint16_t reg;
            uint8_t bytes[2];
        } driveCurrent[4];

        uint16_t manufacturerID = 0x5449;
        uint16_t deviceID = 0x3055;
    };
    uint16_t regs[36];
};

// FIXME: Would this be good as iterators?
enum registerAddresses {
    DATA0_MSB,
    DATA0_LSB,

    DATA1_MSB,
    DATA1_LSB,

    DATA2_MSB,
    DATA2_LSB,

    DATA3_MSB,
    DATA3_LSB,

    RCOUNT0,
    RCOUNT1,
    RCOUNT2,
    RCOUNT3,

    OFFSET0,
    OFFSET1,
    OFFSET2,
    OFFSET3,

    SETTLECOUNT0,
    SETTLECOUNT1,
    SETTLECOUNT2,
    SETTLECOUNT3,

    CLOCK_DIVIDERS0,
    CLOCK_DIVIDERS1,
    CLOCK_DIVIDERS2,
    CLOCK_DIVIDERS3,

    DEVICE_STATUS,

    ERROR_CONFIG,
    CONFIG,
    MUX_CONFIG,

    RESET_DEV,

    DRIVE_CURRENT0,
    DRIVE_CURRENT1,
    DRIVE_CURRENT2,
    DRIVE_CURRENT3,

    MANUFACTURER_ID,
    DEVICE_ID,

    MAX_ADDRESS
};

static const uint8_t offsettedAddresses[6] {
    0x1E,
    0x1F,
    0x20,
    0x21,
    0x7E,
    0x7F,
};

[[maybe_unused]]
static unsigned ldcGetHWAddress(unsigned i_address) {
    return (i_address < 29) ? i_address : offsettedAddresses[i_address - 29];
}

const uint16_t resetValues[MAX_ADDRESS] = {
    // data
    0,
    0,

    0,
    0,

    0,
    0,

    0,
    0,

    //rcount
    0x0080,
    0x0080,
    0x0080,
    0x0080,

    //offset
    0,
    0,
    0,
    0,

    //settlecount
    0,
    0,
    0,
    0,

    //clock_divider
    0,
    0,
    0,
    0,

    //status
    0,

    //configs
    0,
    0x2801,
    0x020F,

    //reset
    0,

    //drive current
    0,
    0,
    0,
    0,

    //manufacturer_id
    0x5449,

    //device_id
    0x3055
};

const uint16_t writeMask[MAX_ADDRESS] = {
    // data
    0,
    0,

    0,
    0,

    0,
    0,

    0,
    0,

    //rcount
    0xFFFF,
    0xFFFF,
    0xFFFF,
    0xFFFF,

    //offset
    0xFFFF,
    0xFFFF,
    0xFFFF,
    0xFFFF,

    //settle_count
    0xFFFF,
    0xFFFF,
    0xFFFF,
    0xFFFF,

    //clock_divider
    0b1111001111111111,
    0b1111001111111111,
    0b1111001111111111,
    0b1111001111111111,

    //status
    0,

    //configs
    0b1111100011111101,
    0b1111111111000000,
    0b1110000000000111,

    //reset
    (1 << 15),

    //drive current
    0b1111110000000000,
    0b1111110000000000,
    0b1111110000000000,
    0b1111110000000000,

    //manufacturer_id
    0,

    //device_id
    0
};
}