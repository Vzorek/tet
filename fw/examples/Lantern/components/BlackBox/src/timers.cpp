/* MIT License

Copyright (c) 2018 RoboticsBrno (RobotikaBrno)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

#include <freertos/FreeRTOS.h>
#include <freertos/timers.h>

#include "BlackBox/timers.hpp"

#include <cstring>

namespace BlackBox {

static void dieTimers(TimerHandle_t timer) {
    vPortFree(timer);
    vTaskDelete(NULL); // lol
}

void Timers::deleteFreeRtOsTimerTask() {
    xTimerStart(
        xTimerCreate("sike!", 1, pdFALSE, NULL, dieTimers), portMAX_DELAY);
}

Timers& Timers::get() {
    static Timers instance;
    return instance;
}

Timers::Timers()
    : m_id_counter(1) {}

Timers::~Timers() {}

void Timers::timerCallback(void* idVoid) {
    auto& self = Timers::get();
    const auto id = (uint16_t)(uintptr_t)idVoid;

    std::lock_guard<std::recursive_mutex> l(self.m_mutex);
    for (const auto& tm : self.m_timers) {
        if (tm.id != id)
            continue;
        if (!tm.callback()) {
            self.cancel(id);
        }
        break;
    }
}

uint16_t Timers::schedule(uint32_t period_ms, std::function<bool()> callback) {
    std::lock_guard<std::recursive_mutex> l(m_mutex);

    const auto id = getFreeIdLocked();

    const esp_timer_create_args_t timer_args = {
        .callback = timerCallback,
        .arg = (void*)(uintptr_t)id,
        .dispatch_method = ESP_TIMER_TASK,
        .name = "rb_timer",
        .skip_unhandled_events = false,
    };

    esp_timer_handle_t timer = nullptr;
    esp_timer_create(&timer_args, &timer);

    m_timers.emplace_back(std::move(timer_t {
        .callback = callback,
        .handle = timer,
        .id = id,
    }));

    esp_timer_start_periodic(timer, uint64_t(period_ms) * 1000);

    return id;
}

bool Timers::reset(uint16_t id, uint32_t period_ms) {
    std::lock_guard<std::recursive_mutex> l(m_mutex);

    for (auto& t : m_timers) {
        if (t.id != id)
            continue;

        esp_timer_stop(t.handle);
        esp_timer_start_periodic(t.handle, uint64_t(period_ms) * 1000);
        return true;
    }
    return false;
}

bool Timers::cancel(uint16_t id) {
    std::lock_guard<std::recursive_mutex> l(m_mutex);

    const auto size = m_timers.size();
    for (size_t i = 0; i < size; ++i) {
        if (m_timers[i].id == id) {
            cancelByIdxLocked(i);
            return true;
        }
    }
    return false;
}

bool Timers::stop(uint16_t id) {
    std::lock_guard<std::recursive_mutex> l(m_mutex);

    for (auto& t : m_timers) {
        if (t.id != id)
            continue;
        esp_timer_stop(t.handle);
        return true;
    }
    return false;
}

void Timers::cancelByIdxLocked(size_t idx) {
    auto& t = m_timers[idx];
    esp_timer_stop(t.handle);
    esp_timer_delete(t.handle);

    const auto size = m_timers.size();
    if (idx + 1 < size) {
        m_timers[idx].swap(m_timers[size - 1]);
    }
    m_timers.pop_back();
}

uint16_t Timers::getFreeIdLocked() {
    uint16_t id = m_id_counter;
    while (1) {
        if (id == INVALID_ID) {
            ++id;
            continue;
        }

        bool found = false;
        for (const auto& t : m_timers) {
            if (t.id == id) {
                found = true;
                ++id;
                break;
            }
        }

        if (!found) {
            m_id_counter = id + 1;
            return id;
        }
    }
}

bool Timers::isOnTimerTask() const {
    return strcmp(pcTaskGetName(NULL), "esp_timer") == 0;
}
};