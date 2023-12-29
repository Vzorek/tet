#pragma once

#include "tet/util.hpp"

#include <cstdint>

namespace tet {

template <std::size_t t_identifierSize, std::size_t t_descriptionSize, typename... Args>
struct Event {
    fixed_string<t_identifierSize> identifier;
    fixed_string<t_descriptionSize> description;
    std::tuple<Args...> arguments;

    consteval Event(
        const char (&identifier)[t_identifierSize + 1],
        const char (&description)[t_descriptionSize + 1],
        const std::tuple<Args...>& args)
        : identifier(identifier)
        , description(description)
        , arguments(args) {}

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

template <std::size_t t_identifierSize, std::size_t t_descriptionSize, typename... Args>
Event(
    const char (&identifier)[t_identifierSize],
    const char (&description)[t_descriptionSize],
    const std::tuple<Args...>& args)
    -> Event<t_identifierSize - 1, t_descriptionSize - 1, Args...>;

} // namespace tet