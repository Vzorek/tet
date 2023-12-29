#pragma once

#include "coll/basic_fixed_string.h"
#include "coll/basic_string.h"

#include <tuple>
#include <cstdint>

namespace tet {

template <std::size_t N>
using fixed_string = coll::basic_fixed_string<char, N>;

template <std::size_t M, std::size_t N>
consteval fixed_string<N * M> multiply(const fixed_string<N>& str) {
    if constexpr (M == 0)
        return "";
    else
        return str + multiply<M - 1>(str);
}

template <std::size_t N>
constexpr fixed_string<N * 2> indent = indent<N - 1> + "  ";

template <>
constexpr fixed_string<0> indent<0>("");

template<std::size_t t_indent, std::size_t t_idx, typename ...Properties>
consteval auto encodeMultiple(const std::tuple<Properties...>& properties) noexcept {
    constexpr std::size_t size = std::tuple_size_v<std::decay_t<decltype(properties)>>;
    if constexpr (size == 0)
        return fixed_string<0>("");
    else if constexpr(t_idx == size - 1)
        return std::get<t_idx>(properties).template encode<t_indent + 1>() + "\n";
    else {
        return std::get<t_idx>(properties).template encode<t_indent + 1>() + ",\n" + encodeMultiple<t_indent, t_idx + 1>(properties);
    }
}

template <std::size_t N>
consteval fixed_string<N> to_string(int value) {
    if (value < 0)
        return "-" + to_string<N - 1>(-value);
    
    if (value < 10)
        return fixed_string<1>(1, '0' + value);

    return to_string<N - 1>(value / 10) + fixed_string<N>(1, '0' + value % 10);
}

} // namespace tet