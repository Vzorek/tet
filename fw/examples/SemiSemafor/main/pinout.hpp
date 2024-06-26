#pragma once

#include <driver/gpio.h>

namespace Pins {
    static constexpr gpio_num_t SW1 = GPIO_NUM_0;
    static constexpr gpio_num_t SW2 = GPIO_NUM_1;
    static constexpr gpio_num_t Leds = GPIO_NUM_8;
}
