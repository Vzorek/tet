#pragma once

#include "tet/util.hpp"

#include <cstdint>

namespace tet {

template <std::size_t identifierSize, std::size_t descriptionSize>
struct Event {
    fixed_string<identifierSize> identifier;
    fixed_string<descriptionSize> description;

    constexpr Event(const char (&identifier)[identifierSize], const char (&description)[descriptionSize])
        : identifier(identifier)
        , description(description) {}

    template <std::size_t t_indent = 0>
    constexpr auto encode() const noexcept {
        return
            indent<t_indent> + "\"" + identifier + "\": {\n" +
            indent<t_indent + 1> + "\"description\": \"" + description + "\"\n" +
            indent<t_indent> + "}";
    }
};

template <std::size_t identifierSize, std::size_t descriptionSize>
Event(const char (&identifier)[identifierSize], const char (&description)[descriptionSize])
    -> Event<identifierSize - 1, descriptionSize - 1>;

} // namespace tet