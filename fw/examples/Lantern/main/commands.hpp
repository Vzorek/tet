#pragma once

#include "HW.hpp"

#include "tet/Command.hpp"
#include "tet/Argument.hpp"

#include <nlohmann/json.hpp>
#include <Color.h>

#include "esp_log.h"

#include <tuple>
#include <vector>

namespace Commands {

static const char* TAG = "commands";

constexpr tet::Number red("r", "Red", true);
constexpr tet::Number green("g", "Green", true);
constexpr tet::Number blue("b", "Blue", true);

constexpr tet::Number index("index", "Index", true);

constexpr tet::Object color("color", "Color", true, std::make_tuple(red, green, blue));
constexpr tet::Array colorsTop("colors", "Colors", true, color, 60, 60);
constexpr tet::Array colorsPerim("colors", "Colors", true, color, 52, 52);

static inline Rgb parseColor(const nlohmann::json& args) {
    ESP_LOGI(TAG, "%s", args.dump().c_str());
    return Rgb(args["r"].get<int>(), args["g"].get<int>(), args["b"].get<int>());
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

constexpr tet::Command openDoor("openDoor", "Open Door", std::make_tuple(index), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    int index = parseIndex(args);
    ESP_LOGI(TAG, "openDoor: %i", index);
    BlackBox::Manager::singleton().door(index).open();
    newState.doors[index] = true;
    return newState;
}));

constexpr tet::Command closeDoor("closeDoor", "Close Door", std::make_tuple(index), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    int index = parseIndex(args);
    ESP_LOGI(TAG, "closeDoor: %i", index);
    BlackBox::Manager::singleton().door(index).close();
    newState.doors[index] = false;
    return newState;
}));

constexpr tet::Command fillTop("fillTop", "Fill Top", std::make_tuple(color), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    Rgb color = parseColor(args["color"]);
    BlackBox::Manager::singleton().beacon().top().fill(color);
    BlackBox::Manager::singleton().beacon().show();
    for (auto& led : newState.top) {
        led = color;
    }
    return newState;
}));

constexpr tet::Command fillPerimeter("fillPerimeter", "Fill Perimeter", std::make_tuple(color), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    Rgb color = parseColor(args["color"]);
    BlackBox::Manager::singleton().beacon().perimeter().fill(color);
    BlackBox::Manager::singleton().beacon().show();
    for (auto& led : newState.perim) {
        led = color;
    }
    return newState;
}));

constexpr tet::Command fillAll("fillAll", "Fill All", std::make_tuple(color), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    Rgb color = parseColor(args["color"]);
    BlackBox::Manager::singleton().beacon().fill(color);
    BlackBox::Manager::singleton().beacon().show();
    for (auto& led : newState.top) {
        led = color;
    }
    for (auto& led : newState.perim) {
        led = color;
    }
    return newState;
}));

constexpr tet::Command showTop("showTop", "Show Top", std::make_tuple(colorsTop), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    auto colors = parseColors(args);
    for (std::size_t i = 0; i < colors.size(); i++) {
        newState.top[i] = colors[i];
    }
    return newState;
}));

constexpr tet::Command showPerimeter("showPerimeter", "Show Perimeter", std::make_tuple(colorsPerim), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    auto colors = parseColors(args);
    for (std::size_t i = 0; i < colors.size(); i++) {
        newState.perim[i] = colors[i];
    }
    return newState;
}));

constexpr tet::Command shutdown("shutdown", "Shutdown", std::make_tuple(), tet::Callback<State>(+[](const State& state, const nlohmann::json& args) {
    State newState = state;
    BlackBox::Manager::singleton().power().turnOff();
    newState.shutdown = true;
    return newState;
}));

constexpr auto all = std::make_tuple(openDoor, closeDoor, fillTop, fillPerimeter, fillAll, showTop, showPerimeter, shutdown);

} // namespace Commands
