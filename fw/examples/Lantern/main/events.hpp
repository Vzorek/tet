#pragma once

#include <tet/Event.hpp>
#include <tet/Argument.hpp>

#include <nlohmann/json.hpp>

#include <tuple>

namespace Events {

constexpr tet::String time = tet::String("time", "Time", true);
constexpr tet::String duration = tet::String("duration", "Duration", true);

constexpr std::tuple basicArgs = std::make_tuple();
constexpr std::tuple durationArgs = std::make_tuple(duration);

constexpr tet::Event btnPressed("btnPressed", "Button pressed", basicArgs);
constexpr tet::Event btnReleased("btnReleased", "Button released", basicArgs);

constexpr tet::Event btnClicked("btnClicked", "Button clicked", durationArgs);
constexpr tet::Event btnDoubleClicked("btnDoubleClicked", "Button double clicked", durationArgs);
constexpr tet::Event btnLongPressed("btnLongPressed", "Button long pressed", basicArgs);

constexpr auto all = std::make_tuple(btnPressed, btnReleased, btnClicked, btnDoubleClicked, btnLongPressed);

} // namespace Events
