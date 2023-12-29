#pragma once

#include "BlackBox/Touchpad.hpp"
#include <cmath>

namespace Circular {

/**
 * \~czech @brief Datový typ pro práci s pozicí na LED kruhu
 * \~english @brief Data type for handling polar coords based on LED Ring model
 */
template <unsigned t_count>
class CircularInteger {
private:
    int m_value;
    int trim(int index);
    CircularInteger<t_count>& trimThis();

public:
    CircularInteger(int index = 0);
    CircularInteger(BlackBox::Coords other);

    int value() const;

    CircularInteger<t_count>& operator+=(const CircularInteger<t_count>&);
    CircularInteger<t_count>& operator-=(const CircularInteger<t_count>&);
    
    CircularInteger<t_count>& operator+=(int);
    CircularInteger<t_count>& operator-=(int);

    CircularInteger<t_count>& operator++();
    CircularInteger<t_count>& operator--();

    bool operator<(const CircularInteger<t_count>&) const;
    bool operator>(const CircularInteger<t_count>&) const;
    bool operator<=(const CircularInteger<t_count>&) const;
    bool operator>=(const CircularInteger<t_count>&) const;
    bool operator==(const CircularInteger<t_count>&) const;
    bool operator!=(const CircularInteger<t_count>&) const;

    operator int() const;
};

template <unsigned t_count>
int CircularInteger<t_count>::trim(int index) {
    return (t_count + (index % t_count)) % t_count;
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::trimThis() {
    m_value = trim(m_value);
    return *this;
}

template <unsigned t_count>
CircularInteger<t_count>::CircularInteger(int i_index)
    : m_value(trim(i_index)) {
}

template <unsigned t_count>
CircularInteger<t_count>::CircularInteger(BlackBox::Coords other)
    : m_value(trim(atan2(other.x, other.y) * 3.14 * 3)) {
}

template <unsigned t_count>
int CircularInteger<t_count>::value() const {
    return m_value;
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator+=(const CircularInteger<t_count>& i_other) {
    m_value += i_other.m_value;
    return trimThis();
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator-=(const CircularInteger<t_count>& i_other) {
    m_value -= i_other.m_value;
    return trimThis();
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator+=(int i_other) {
    m_value += i_other;
    return trimThis();
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator-=(int i_other) {
    m_value -= i_other;
    return trimThis();
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator++() {
    m_value++;
    return trimThis();
}

template <unsigned t_count>
CircularInteger<t_count>& CircularInteger<t_count>::operator--() {
    m_value--;
    return trimThis();
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator<(const CircularInteger<t_count>& i_other) const {
    return m_value < i_other.m_value;
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator>(const CircularInteger<t_count>& i_other) const {
    return m_value > i_other.m_value;
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator<=(const CircularInteger<t_count>& i_other) const {
    return m_value <= i_other.m_value;
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator>=(const CircularInteger<t_count>& i_other) const {
    return m_value >= i_other.m_value;
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator==(const CircularInteger<t_count>& i_other) const {
    return m_value == i_other.m_value;
}

template <unsigned t_count>
bool CircularInteger<t_count>::operator!=(const CircularInteger<t_count>& i_other) const {
    return m_value != i_other.m_value;
}

template <unsigned t_count>
CircularInteger<t_count>::operator int() const {
    return m_value;
}

} // namespace Circular