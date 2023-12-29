#pragma once

#include "HW.hpp"

#include "tet/Command.hpp"
#include "tet/Argument.hpp"

#include <nlohmann/json.hpp>
#include <Color.h>

#include <tuple>
#include <vector>

namespace Commands {

constexpr tet::Number red("r", "Red", true);
constexpr tet::Number green("g", "Green", true);
constexpr tet::Number blue("b", "Blue", true);

constexpr tet::Number index("index", "Index", true);

constexpr tet::Object color("color", "Color", true, std::make_tuple(red, green, blue));
constexpr tet::Array colors("colors", "Colors", true, color, 5, 5);

static inline Rgb parseColor(const nlohmann::json& args) {
    return Rgb(args["r"].get<std::uint8_t>(), args["g"].get<std::uint8_t>(), args["b"].get<std::uint8_t>());
}

static inline int parseIndex(const nlohmann::json& args) {
    return args["index"].get<int>();
}

static inline std::vector<Rgb> parseColors(const nlohmann::json& args) {
    std::vector<Rgb> colors;
    for (const auto& color : args) {
        colors.push_back(parseColor(color));
    }
    return colors;
}

constexpr tet::Command showLeds("showLeds", "Show LEDs", std::make_tuple(colors), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    std::vector<Rgb> colors = parseColors(args["colors"]);
    for (int i = 0; i < state.leds.size(); i++) {
        newState.leds[i] = colors[i];
    }
    return newState;
}));

constexpr tet::Command showLed("showLed", "Show LED", std::make_tuple(color, index), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    int index = parseIndex(args);
    Rgb color = parseColor(args["color"]);
    newState.leds[index] = color;
    return newState;
}));

constexpr auto all = std::make_tuple(showLeds, showLed);

} // namespace Commands