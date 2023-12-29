#pragma once

#include "Dsp.hpp"
#ifdef BB_BEACON

#include "BlackBox/CircularInteger.hpp"
#include "BlackBox/pinout.hpp"
#include <SmartLeds.h>
#include <array>
#include <mutex>

namespace BlackBox {
constexpr int ledCountTop = 60;
constexpr int ledCountPerimeter = 52;
constexpr int sides = 4;
constexpr int ledCountCorner = 1;
constexpr int ledChannel = 0;

enum class ArcType {
    ShorterDistance = 0,
    LongerDistance,
    Clockwise,
    CounterClockwise,
};

template <typename T>
class Portion {
private:
    int m_darkModeValue; // max value
    bool m_isDarkModeEnabled;

public:
    virtual unsigned count() = 0;
    virtual Rgb& access(T) = 0;

    void drawArc(Rgb i_rgb, T i_beginnig, T i_ending, ArcType i_arcType = ArcType::ShorterDistance) {
        if ((i_arcType == ArcType::ShorterDistance) || (i_arcType == ArcType::LongerDistance)) {
            if (i_arcType == ArcType::ShorterDistance) {
                i_arcType = (abs(i_beginnig - i_ending) <= (count() / 2))
                    ? ArcType::Clockwise
                    : ArcType::CounterClockwise;
            } else {
                i_arcType = (abs(i_beginnig - i_ending) > (count() / 2))
                    ? ArcType::Clockwise
                    : ArcType::CounterClockwise;
            }
        }

        if (i_arcType == ArcType::Clockwise)
            for (T i = i_beginnig; true; ++i) {
                access(i) = i_rgb;
                if (i == i_ending)
                    break;
            }
        else
            for (T i = i_ending; i != i_beginnig; ++i) {
                access(i) = i_rgb;
            }
    }

    void fill(Rgb i_rgb) {
        for (int i = 0; i < count(); i++)
            access(i) = i_rgb;
    }

    void clear() {
        fill(Rgb(0, 0, 0));
    }
};

template <unsigned t_topLedsCount = ledCountTop,
    unsigned t_perimeterLedsCount = ledCountPerimeter,
    unsigned t_totalLedsCount = ledCountTop + ledCountPerimeter,
    unsigned t_sides = sides,
    unsigned t_cornerLedsCount = ledCountCorner,
    int t_channel = ledChannel>
class Beacon : public Portion<Circular::CircularInteger<t_topLedsCount + t_perimeterLedsCount>> {
public:
    static constexpr unsigned s_ledCountSide = ((t_totalLedsCount - t_topLedsCount) - (t_sides * t_cornerLedsCount)) / t_sides;
    using Index = Circular::CircularInteger<t_topLedsCount + t_perimeterLedsCount>;
    using TopIndex = Circular::CircularInteger<t_topLedsCount>;
    using PerimeterIndex = Circular::CircularInteger<t_perimeterLedsCount>;
    using IndexOfSide = Circular::CircularInteger<t_sides>;
    using SideIndex = Circular::CircularInteger<s_ledCountSide>;

private:
    const char* m_tag = "Beacon";

    mutable std::recursive_mutex m_mutex;

    SmartLed m_leds;

    std::array<Rgb, t_topLedsCount + t_perimeterLedsCount> m_buffer;

    const TopIndex m_beginning;
    const PerimeterIndex m_firstCorner;

    class Top : public Portion<TopIndex> {
    private:
        Beacon& m_parent;
        static constexpr unsigned s_count = t_topLedsCount;

    public:
        unsigned count() override { return s_count; }
        Top(Beacon& i_parent)
            : m_parent(i_parent) {};
        Rgb& access(TopIndex i_index) override { return m_parent.onTop(i_index); }
        Rgb operator[](TopIndex i_index) const { return m_parent.onTop(i_index); }
        Rgb& operator[](TopIndex i_index) { return m_parent.onTop(i_index); }
    };

    class Perimeter : public Portion<PerimeterIndex> {
    private:
        Beacon& m_parent;
        static constexpr unsigned s_count = t_perimeterLedsCount;

    public:
        unsigned count() override { return s_count; }
        Perimeter(Beacon& i_parent)
            : m_parent(i_parent) {};
        Rgb& access(PerimeterIndex i_index) override { return m_parent.onPerimeter(i_index); }
        Rgb operator[](PerimeterIndex i_index) const { return m_parent.onPerimeter(i_index); }
        Rgb& operator[](PerimeterIndex i_index) { return m_parent.onPerimeter(i_index); }
    };

    class Side : public Portion<SideIndex> {
    private:
        Beacon& m_parent;
        IndexOfSide m_index;
        static constexpr unsigned s_count = s_ledCountSide;

    public:
        unsigned count() override { return s_count; }
        Side(Beacon& i_parent, const IndexOfSide& i_index)
            : m_parent(i_parent)
            , m_index(i_index) {};
        Rgb& access(SideIndex i_index) override { return m_parent.onSide(m_index, i_index); }
        Rgb operator[](SideIndex i_index) const { return m_parent.onSide(m_index, i_index); }
        Rgb& operator[](SideIndex i_index) { return m_parent.onSide(m_index, i_index); }
    };

public:
    Beacon(TopIndex beginningAddress, PerimeterIndex firstCornerAddress)
        : m_leds(LED_WS2812, t_totalLedsCount, Pins::Leds::Data, t_channel)
        , m_beginning(beginningAddress)
        , m_firstCorner(firstCornerAddress) {};

    const Top& top() const { return Top(*this); }
    Top top() { return Top(*this); }

    Rgb onTop(const TopIndex& i_index) const { return m_buffer[TopIndex(i_index)]; }
    Rgb& onTop(const TopIndex& i_index) { return m_buffer[TopIndex(i_index + m_beginning)]; }

    const Perimeter& perimeter() const { return Perimeter(*this); }
    Perimeter perimeter() { return Perimeter(*this); }

    Rgb onPerimeter(const PerimeterIndex& i_index) const { return m_buffer[t_topLedsCount + PerimeterIndex(m_firstCorner + i_index)]; }
    Rgb& onPerimeter(const PerimeterIndex& i_index) { return m_buffer[t_topLedsCount + PerimeterIndex(m_firstCorner + i_index)]; }

    const Side& side(const IndexOfSide& i_side) const { return Side(*this, i_side); }
    Side side(const IndexOfSide& i_side) { return Side(*this, i_side); }

    Rgb onSide(const IndexOfSide& i_side, const SideIndex& i_index) const { return onPerimeter(((ledCountCorner + 1) / 2) + ((t_cornerLedsCount + s_ledCountSide) * i_side) + i_index); }
    Rgb& onSide(const IndexOfSide& i_side, const SideIndex& i_index) { return onPerimeter(((ledCountCorner + 1) / 2) + ((t_cornerLedsCount + s_ledCountSide) * i_side) + i_index); }

    Rgb operator[](const Index& i_index) const { return m_buffer[i_index]; }
    Rgb& operator[](const Index& i_index) { return m_buffer[i_index]; }

    void show( unsigned darkModeValue = 255) {
        std::scoped_lock l(m_mutex);
        for (int i = 0; i < t_totalLedsCount; i++) {
            m_leds[i] = m_buffer[i];
            m_leds[i].stretchChannelsEvenly(darkModeValue);
        }
        m_leds.wait();
        m_leds.show();
    }

    unsigned count() override { return t_totalLedsCount; }
    Rgb& access(Index i_index) override { return m_buffer[i_index]; }

};
};
#endif
