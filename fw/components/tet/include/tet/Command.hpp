#pragma once

#include "tet/Argument.hpp"
#include "tet/State.hpp"
#include "tet/StaticFunction.hpp"
#include "tet/util.hpp"

#include <nlohmann/json.hpp>

#include <cstddef>
#include <tuple>

namespace tet {

template <HW::State State>
using Callback = StaticFunction<State(const State&, const nlohmann::json&)>;

template <HW::State State, std::size_t t_identifierSize, std::size_t t_descriptionSize, typename... Args>
struct Command {
    fixed_string<t_identifierSize> identifier;
    fixed_string<t_descriptionSize> description;
    std::tuple<Args...> arguments;
    Callback<State> callback;

    consteval Command(
        const char (&identifier)[t_identifierSize + 1],
        const char (&description)[t_descriptionSize + 1],
        const std::tuple<Args...>& args,
        Callback<State> callback)
        : identifier(identifier)
        , description(description)
        , arguments(args)
        , callback(callback) {}

    template <std::size_t t_indent = 0>
    consteval auto encode() const noexcept {
        return
            indent<t_indent> + "\"" + identifier + "\": {\n" +
            indent<t_indent + 1> + "\"description\": \"" + description + "\",\n" +
            indent<t_indent + 1> + "\"arguments\": {\n" +
            encodeMultiple<t_indent + 2, 0>(arguments) +
            indent<t_indent + 1> + "}\n" +
            indent<t_indent> + "}";
    }
};

template <HW::State State, std::size_t t_identifierSize, std::size_t t_descriptionSize, typename... Args>
Command(
    const char (&identifier)[t_identifierSize],
    const char (&description)[t_descriptionSize],
    const std::tuple<Args...>& args,
    Callback<State> callback)
    -> Command<State, t_identifierSize - 1, t_descriptionSize - 1, Args...>;

} // namespace tet