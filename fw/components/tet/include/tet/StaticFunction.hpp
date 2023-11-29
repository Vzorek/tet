#pragma once

#include <tuple>

namespace tet {

template <typename Signature>
class StaticFunction;

template <typename Result, typename... Args>
class StaticFunction<Result(Args...)> {
public:
    using ResultType = Result;
    using ArgumentType = std::tuple<Args...>;
    using FunctionPtr = Result (*)(Args...);

private:
    FunctionPtr m_function;

public:
    constexpr StaticFunction(FunctionPtr function) : m_function(function) {}

    constexpr ResultType operator() (Args... args) const { return m_function(args...); }
    constexpr ResultType call(Args... args) const { return m_function(args...); }

    constexpr operator FunctionPtr() const { return m_function; }
};

// deduction guide
template <typename Result, typename... Args>
StaticFunction (Result(*)(Args...)) -> StaticFunction<Result(Args...)>;

} // namespace tet
