#pragma once

#include "driver/gpio.h"

#if defined(BLACK_BOX) && defined(LANTERN)
    #error "You can not have multiple types of board!"
#endif

#ifdef BLACK_BOX
    #define BB_POWER BLACK_BOX
    #define BB_RING BLACK_BOX
    #define BB_LDC BLACK_BOX
    #define BB_RTC BLACK_BOX
    #define BB_LOCK BLACK_BOX
    #define BB_USB BLACK_BOX
    #define BB_IR BLACK_BOX
    #define BB_I2C BLACK_BOX
    #define BB_SPL BLACK_BOX
    #define BB_TOUCHPAD BLACK_BOX

    #if BLACK_BOX == 0x0100
        #define BB_BMX BLACK_BOX
    #elif BLACK_BOX == 0x0101
        #define BB_MPU BLACK_BOX
        #define BB_QMC5883 BLACK_BOX
    #else
        #error "Incorrect version!"
    #endif
#endif

#ifdef LANTERN
    #define BB_POWER LANTERN
    // #define BB_RING LANTERN
    #define BB_BEACON LANTERN
    #define BB_LDC LANTERN
    #define BB_RTC LANTERN
    #define BB_USB LANTERN
    #define BB_I2C LANTERN
    #define BB_MPU LANTERN
    #define BB_QMC6310 LANTERN
    #define BB_DOORS LANTERN
    #define BB_TOUCHPAD LANTERN
#endif

#ifndef BB_LDC // Sanity check to use LDC when needed
    #ifdef BB_TOUCHPAD
        #define BB_LDC BB_TOUCHPAD
    #endif
#endif

#ifndef BB_I2C // Sanity check to use I2C when needed
    #ifdef BB_LDC
        #define BB_I2C BB_LDC
    #endif
    
    #ifdef BB_RTC
        #define BB_I2C BB_RTC
    #endif
    
    #ifdef BB_SPL
        #define BB_I2C BB_SPL
    #endif
    
    #ifdef BB_BMX
        #define BB_I2C BB_BMX
    #endif
    
    #ifdef BB_MPU
        #define BB_I2C BB_MPU
    #endif
    
    #ifdef BB_QMC5883
        #define BB_I2C BB_QMC5883
    #endif
    
    #ifdef BB_QMC6310
        #define BB_I2C BB_QMC6310
    #endif
#endif

#if defined(BB_RING) && defined(BB_BEACON)
    #error "Can not use both Ring and Beacon at the same time!"
#endif
