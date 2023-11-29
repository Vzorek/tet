#pragma once

#include "tet/util.hpp"

#include <tuple>
#include <cstdint>

namespace tet {

template <std::size_t t_typeSize, std::size_t t_nameSize,
    std::size_t t_descriptionSize>
struct ArgumentBase {
    fixed_string<t_typeSize> type;
    fixed_string<t_nameSize> name;
    fixed_string<t_descriptionSize> description;
    bool required;

    consteval ArgumentBase(const char (&type)[t_typeSize + 1],
        const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required)
        : type(type)
        , name(name)
        , description(description)
        , required(required) {};
    
    template<std::size_t t_indent = 0>
    consteval auto encode() const noexcept {
        return
            indent<t_indent> + "\"" + name + "\": {\n" +
            indent<t_indent + 1> + "\"type\": \"" + type + "\",\n" +
            indent<t_indent + 1> + "\"description\": \"" + description + "\",\n" +
            indent<t_indent + 1> + "\"required\": " + (required ? " true" : "false") + "\n" +
            indent<t_indent> + "}";
    }
};

template <std::size_t t_typeSize, std::size_t t_nameSize,
    std::size_t t_descriptionSize>
ArgumentBase(const char (&type)[t_typeSize], const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required)
    -> ArgumentBase<t_typeSize - 1, t_nameSize - 1, t_descriptionSize - 1>;

template<typename T, std::size_t typeSize, std::size_t nameSize, std::size_t t_descriptionSize>
concept Argument = std::derived_from<T, ArgumentBase<typeSize, nameSize, t_descriptionSize>>;

// String
template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename Base = ArgumentBase<sizeof("string") - 1, t_nameSize, t_descriptionSize>>
struct String : Base {
    consteval String(const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required) noexcept
        : Base("string", name, description, required) {};
    
    using Base::encode;
};

template <std::size_t t_nameSize, std::size_t t_descriptionSize>
String(const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required)
    -> String<t_nameSize - 1, t_descriptionSize - 1>;

// Number
template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename Base = ArgumentBase<sizeof("number") - 1, t_nameSize, t_descriptionSize>>
struct Number : Base {
    consteval Number(const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required) noexcept
        : Base("number", name, description, required) {};

    using Base::encode;
};

template <std::size_t t_nameSize, std::size_t t_descriptionSize>
Number(const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required)
    -> Number<t_nameSize - 1, t_descriptionSize - 1>;

// Boolean
template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename Base = ArgumentBase<sizeof("boolean") - 1, t_nameSize,
        t_descriptionSize>>
struct Boolean : Base {
    consteval Boolean(const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required) noexcept
        : Base("boolean", name, description, required) {};

    using Base::encode;
};

template <std::size_t t_nameSize, std::size_t t_descriptionSize>
Boolean(const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required)
    -> Boolean<t_nameSize - 1, t_descriptionSize - 1>;

// Array
template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename Base = ArgumentBase<sizeof("boolean") - 1, t_nameSize,
        t_descriptionSize>>
struct Array : Base {
    consteval Array(const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required) noexcept
        : Base("boolean", name, description, required) {};
        
    using Base::encode;
};

template <std::size_t t_nameSize, std::size_t t_descriptionSize>
Array(const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required)
    -> Array<t_nameSize - 1, t_descriptionSize - 1>;

template <std::size_t t_nameSize, std::size_t t_descriptionSize>
using ObjectBase = ArgumentBase<sizeof("object") - 1, t_nameSize, t_descriptionSize>;

template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename... Properties>
struct Object : ObjectBase<t_nameSize, t_descriptionSize> {
    consteval Object(const char (&name)[t_nameSize + 1],
        const char (&description)[t_descriptionSize + 1],
        bool required, std::tuple<Properties...> properties) noexcept
        : ObjectBase<t_nameSize, t_descriptionSize>("object", name, description,
            required)
        , properties(properties) {};

    std::tuple<Properties...> properties;

    using ObjectBase<t_nameSize, t_descriptionSize>::name;
    using ObjectBase<t_nameSize, t_descriptionSize>::type;
    using ObjectBase<t_nameSize, t_descriptionSize>::description;
    using ObjectBase<t_nameSize, t_descriptionSize>::required;

    template<std::size_t t_indent = 0>
    consteval auto encode() const noexcept {
        return
            indent<t_indent> + "\"" + name + "\": {\n" +
            indent<t_indent + 1> + "\"type\": \"" + type + "\",\n" +
            indent<t_indent + 1> + "\"description\": \"" + description + "\",\n" +
            indent<t_indent + 1> + "\"required\": " + (required ? " true" : "false") + "\n" +
            indent<t_indent + 1> + "\"properties\": {\n" +
            encodeMultiple<t_indent + 1, 0>(properties) +
            indent<t_indent + 1> + "}\n" +
            indent<t_indent> + "}";
    }
};

template <std::size_t t_nameSize, std::size_t t_descriptionSize,
    typename... Properties>
Object(const char (&name)[t_nameSize],
    const char (&description)[t_descriptionSize], bool required,
    std::tuple<Properties...> properties)
    -> Object<t_nameSize - 1, t_descriptionSize - 1, Properties...>;

} // namespace tet