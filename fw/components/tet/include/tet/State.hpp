#pragma once

#include <chrono>
#include <concepts>

namespace HW {
template <class T>
concept State = requires(const T& a) {
    requires std::same_as<std::decay_t<decltype(a.time)>, std::chrono::steady_clock::time_point>;
};

template <class M, class S>
concept Manager = requires(const M& manager, const S& state) {
    requires State<S>;
    requires std::same_as<typename M::StateType, S>;
    { manager.get() } -> std::same_as<S>;
} && requires(M& manager, const S& state) {
    { manager.apply(state) } -> std::same_as<void>;
};
} // namespace HW
