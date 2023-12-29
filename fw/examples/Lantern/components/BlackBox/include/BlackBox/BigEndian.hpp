#pragma once

#include <array>
#include <cstdint>

namespace BE {

#pragma pack(push, 1)

template <typename T>
class BigEndian {
private:
    std::array<std::uint8_t, sizeof(T)> m_data;

public:
    BigEndian() = default;

    BigEndian& operator=(const T& other);
    BigEndian& operator=(const std::array<std::uint8_t, sizeof(T)>& other);

    std::array<std::uint8_t, sizeof(T)>& regs();
    T value() const;

    std::uint8_t& operator[](int index) const;
    operator T() const;
};

using Uint16 = BigEndian<std::uint16_t>;
using Uint32 = BigEndian<std::uint32_t>;
using Uint64 = BigEndian<std::uint64_t>;

using Int16 = BigEndian<std::int16_t>;
using Int32 = BigEndian<std::int32_t>;
using Int64 = BigEndian<std::int64_t>;

template <typename T>
std::uint8_t& BigEndian<T>::operator[](int i_index) const {
    return m_data.at(i_index);
}

template <typename T>
std::array<std::uint8_t, sizeof(T)>& BigEndian<T>::regs() {
    return m_data;
}

template <typename T>
T BigEndian<T>:: value() const{
    T out;
    std::uint8_t* outp = reinterpret_cast<uint8_t*>(&out);
    for (size_t i = 0; i < sizeof(T); i++)
        outp[i] = m_data.at(sizeof(T) - 1 - i);
    return out;
}

template <typename T>
BigEndian<T>::operator T() const {
    return value();
}

template <typename T>
BigEndian<T>& BigEndian<T>::operator=(const T& i_other) {
    for (int i = 0; i < sizeof(T); i++)
        m_data[i] = static_cast<std::uint8_t>(i_other) >> (i * 8);
    return *this;
}

template <typename T>
BigEndian<T>& BigEndian<T>::operator=(const std::array<std::uint8_t, sizeof(T)>& i_other) {
    m_data = i_other;
    return *this;
}

template <>
inline BigEndian<std::uint16_t>::operator std::uint16_t() const {
    return __builtin_bswap16(*reinterpret_cast<const std::uint16_t*>(m_data.data()));
}

template <>
inline BigEndian<std::uint32_t>::operator std::uint32_t() const {
    return __builtin_bswap32(*reinterpret_cast<const std::uint32_t*>(m_data.data()));
}

template <>
inline BigEndian<std::uint64_t>::operator std::uint64_t() const {
    return __builtin_bswap64(*reinterpret_cast<const std::uint64_t*>(m_data.data()));
}

#pragma pack(pop)

} // namespace BE

// class Uint16 {
// private:
//     std::array<std::uint8_t, 2> m_data;

// public:
//     Uint16() = default;

//     Uint16& operator=(const std::uint16_t& other);
//     Uint16& operator=(const std::array<std::uint8_t, 2>& other);

//     std::uint8_t operator[](int index) const;
//     operator std::uint16_t() const;
// };

// std::uint8_t Uint16::operator[](int i_index) const {
//     return m_data.at(i_index);
// }

// Uint16::operator std::uint16_t() const {
//     return __builtin_bswap16(*reinterpret_cast<const std::uint16_t*>(m_data.data()));
// }

// Uint16& Uint16::operator=(const std::uint16_t& i_other) {
//     m_data[0] = static_cast<std::uint8_t>(i_other);
//     m_data[1] = static_cast<std::uint8_t>(i_other) >> 8;
//     return *this;
// }

// Uint16& Uint16::operator=(const std::array<std::uint8_t, 2>& i_other) {
//     m_data = i_other;
//     return *this;
// }
