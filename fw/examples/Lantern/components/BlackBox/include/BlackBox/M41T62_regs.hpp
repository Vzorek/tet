/**
 * @file M41T62_regs.hpp
 * @author Tomáš Rohlínek (haberturdeur)
 * \~czech @brief Seznam RTC registrů
 * \~english @brief List of RTC registers
 */

#pragma once

#include <cstdint>
#include <ctime>

namespace M41T62Regs {

enum registerAddresses {
    FractionsOfSeconds = 0,
    Seconds,
    Minutes,
    Hours,
    Day,
    Date,
    CenturyMonth,
    Year,
    Calibration,
    Watchdog,
    AlarmMonth,
    AlarmDate,
    AlarmHour,
    AlarmMinute,
    AlarmSecond,
    Flags,
    MaxAddress,
};

union M41T62_dev_t {
    struct {
        struct {
            std::uint8_t hundredthsOfSecond : 4;
            std::uint8_t tenthsOfSecond : 4;
        };

        struct {
            std::uint8_t second : 4;
            std::uint8_t tensOfSeconds : 3;
            std::uint8_t stopBit : 1;
        };

        struct {
            std::uint8_t minute : 4;
            std::uint8_t tensOfMinutes : 3;
            std::uint8_t oscillatorFailInterruptEnable : 1;
        };

        struct {
            std::uint8_t hour : 4;
            std::uint8_t tensOfHours : 2;
            std::uint8_t zeros0 : 2;
        };

        struct {
            std::uint8_t dayOfWeek : 3;
            std::uint8_t zero1 : 1;
            std::uint8_t sqwResolution : 4; /*!< Formula: frequency = 2 to power of (15 - sqwResolution) */
        };

        struct {
            std::uint8_t day : 4;
            std::uint8_t tensOfDays : 2;
            std::uint8_t zeros2 : 2;
        };

        struct {
            std::uint8_t month : 4;
            std::uint8_t tensOfMonths : 1;
            std::uint8_t zero3 : 1;
            std::uint8_t century : 2; //These bits are arbitrary, they get incremented at the turn of century, but they do not have defined meaning...
        };

        struct {
            std::uint8_t year : 4;
            std::uint8_t tensOfYears : 4;
        };

        struct {
            std::uint8_t calibration : 5;
            std::uint8_t signBit : 1;
            std::uint8_t zero4 : 1;
            std::uint8_t outputLevel : 1;
        };

        struct {
            std::uint8_t resolution01 : 2;
            std::uint8_t multiplier : 5;
            std::uint8_t resolution2 : 1;
            // FIXME: add method to parse the values (possibly operator=)
        } watchdog;

        struct {
            struct {
                std::uint8_t month : 4;
                std::uint8_t tensOfMonths : 1;
                std::uint8_t zero5 : 1;
                std::uint8_t sqwEnable : 1;
                std::uint8_t alarmFlagEnable : 1;
            };

            struct {
                std::uint8_t day : 4;
                std::uint8_t tensOfDays : 2;
                std::uint8_t repeatMode45 : 2;
            };

            struct {
                std::uint8_t hour : 4;
                std::uint8_t tensOfHours : 2;
                std::uint8_t zero6 : 1;
                std::uint8_t repeatMode3 : 1;
            };

            struct {
                std::uint8_t minute : 4;
                std::uint8_t tensOfMinutes : 3;
                std::uint8_t repeatMode2 : 1;
            };

            struct {
                std::uint8_t second : 4;
                std::uint8_t tensOfSeconds : 3;
                std::uint8_t repeatMode1 : 1; // For some reason it starts with 1, see datasheet
            };

        } alarm;

        struct {
            std::uint8_t zeros7 : 2;
            std::uint8_t oscillatorFail : 1;
            std::uint8_t zeros8 : 3;
            std::uint8_t alarmFlag : 1;
            std::uint8_t watchdogFlag : 1;
        };
    };

    std::uint8_t regs[MaxAddress];

    std::tm time() const {
        std::tm newTime;

        newTime.tm_sec = (tensOfSeconds * 10) + second;
        newTime.tm_min = (tensOfMinutes * 10) + minute;
        newTime.tm_hour = (tensOfHours * 10) + hour;
        newTime.tm_wday = dayOfWeek - 1;
        newTime.tm_mday = (tensOfDays * 10) + day;
        newTime.tm_mon = (tensOfMonths * 10) + month - 1;
        newTime.tm_year = (century * 100) + (tensOfYears * 10) + year;
        return newTime;
    }
    void time(std::tm time) {
        second = time.tm_sec % 10;
        tensOfSeconds = time.tm_sec / 10;

        minute = time.tm_min % 10;
        tensOfMinutes = time.tm_min / 10;

        hour = time.tm_hour % 10;
        tensOfHours = time.tm_hour / 10;

        dayOfWeek = time.tm_wday + 1;
        day = time.tm_mday % 10;
        tensOfDays = time.tm_mday / 10;

        month = (time.tm_mon + 1) % 10;
        tensOfSeconds = (time.tm_mon + 1) / 10;

        year = time.tm_year % 10;
        tensOfYears = (time.tm_year % 100) / 10;
        century = ((time.tm_year % 1000) / 100);
    }
};

constexpr std::uint8_t defaultValues[MaxAddress] = {
    0,
    0,
    0,
    0,
    1 << 4, /*!< SQW frequency */
    0,
    0,
    0,
    0,
    0,
    1 << 6, /*!< SQW enable */
    0,
    0,
    0,
    0,
    0
};

enum class AlarmRepeatMode {
    OncePerYear = 0b00000,
    OncePerMonth = 0b10000,
    OncePerDay = 0b11000,
    OncePerHour = 0b11100,
    OncePerMinute = 0b11110,
    OncePerSecond = 0b11111,
};

enum class WatchdogResolution {
    SixteenthOfSecond = 0b000, /*!< 1/16 second */
    FourthOfSecond = 0b001, /*!< 1/4 second */
    OneSecond = 0b010, /*!< 1 second */
    FourSeconds = 0b011, /*!< 4 seconds */
    OneMinute = 0b010, /*!< 1 minute */
};

/**
 * \~czech @brief Generate bits for setting sqw generator to correct frequency
 * \~english @brief Generate bits for setting sqw generator to correct frequency
 * 
 * @param frequency (must be a power of 2 upto 32768 (2 to the power of 15))
 * @return constexpr std::uint8_t bits for configuration
 */
constexpr std::uint8_t sqwBits(unsigned frequency) {
    if (frequency >= 32768)
        return 0b0001;
    if (frequency == 0)
        return 0;
    std::uint8_t out = 1;
    while (frequency >>= 1)
        out++;
    return out;
}
} // namespace M41T62Regs
