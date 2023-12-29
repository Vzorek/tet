#include "Dsp.hpp"
#ifdef BB_RING


#include "BlackBox/Ring.hpp"

#include "BlackBox/pinout.hpp"
#include <SmartLeds.h>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <mutex>

namespace BlackBox {
// uint32 Ring::blend(unsigned color1, unsigned color2, unsigned alpha) { // https://gist.github.com/XProger/96253e93baccfbf338de

//     unsigned rb = color1 & 0xff00ff;
//     unsigned g = color1 & 0x00ff00;
//     rb += ((color2 & 0xff00ff) - rb) * alpha >> 8;
//     g += ((color2 & 0x00ff00) - g) * alpha >> 8;
//     return (rb & 0xff00ff) | (g & 0xff00);
// }

Ring::Ring(int i_count)
    : m_leds(LED_WS2812, i_count, Pins::Leds::Data, channel, DoubleBuffer)
    , m_buffer(new Rgb[i_count])
    , m_count(i_count)
    , m_darkModeValue(10)
    , m_isDarkModeEnabled(false)
    , m_beginning(0) {
}

void Ring::show() {
    std::scoped_lock l(m_mutex);
    Index j = m_beginning;
    for (int i = 0; i < m_count; i++) {
        #if BLACK_BOX == 0x0100
            m_leds[j] = (*this)[m_count - i];
        #else
            m_leds[j] = (*this)[i];
        #endif
        if (m_isDarkModeEnabled)
            m_leds[j].stretchChannelsEvenly(m_darkModeValue);
        ++j;
    }
    m_leds.wait();
    m_leds.show();
}

void Ring::wait() {
    m_leds.wait();
}

void Ring::drawArc(Rgb i_rgb, Index i_beginnig, Index i_ending, ArcType i_arcType) {
    std::scoped_lock l(m_mutex);
    if ((i_arcType == ArcType::ShorterDistance) || (i_arcType == ArcType::LongerDistance)) {
        if (i_arcType == ArcType::ShorterDistance) {
            i_arcType = (abs(i_beginnig - i_ending) <= (m_count / 2))
                ? ArcType::Clockwise
                : ArcType::CounterClockwise;
        } else {
            i_arcType = (abs(i_beginnig - i_ending) > (m_count / 2))
                ? ArcType::Clockwise
                : ArcType::CounterClockwise;
        }
    }

    if (i_arcType == ArcType::Clockwise)
        for (Index i = i_beginnig; true; ++i) {
            m_buffer[i] = i_rgb;
            if (i == i_ending)
                break;
        }
    else
        for (Index i = i_ending; i != i_beginnig; ++i) {
            m_buffer[i] = i_rgb;
        }
}

void Ring::drawCircle(Rgb i_rgb) {
    std::scoped_lock l(m_mutex);
    for (int i = 0; i < m_count; i++)
        m_buffer[i] = i_rgb;
}

void Ring::draw(std::unique_ptr<Rgb[]> i_buffer) {
    std::scoped_lock l(m_mutex);
    for (int i = 0; i < m_count; i++) {
        m_buffer[i] = i_buffer[i];
    }
}

void Ring::clear() {
    drawCircle(Rgb(0, 0, 0));
}

void Ring::enableDarkMode() {
    std::scoped_lock l(m_mutex);
    m_isDarkModeEnabled = true;
}

void Ring::disableDarkMode() {
    std::scoped_lock l(m_mutex);
    m_isDarkModeEnabled = false;
}

void Ring::setDarkModeValue(int i_value) {
    std::scoped_lock l(m_mutex);
    m_darkModeValue = i_value;
}

const Rgb& Ring::operator[](const Index& i_index) const {
    std::scoped_lock l(m_mutex);
    return m_buffer[i_index.value()];
}

Rgb& Ring::operator[](const Index& i_index) {
    std::scoped_lock l(m_mutex);
    return m_buffer[i_index.value()];
}

void Ring::rotate(Index i_beginning) {
    std::scoped_lock l(m_mutex);
    m_beginning = i_beginning;
}

} // namespace BlackBox
#endif
