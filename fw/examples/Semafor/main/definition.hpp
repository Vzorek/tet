#pragma once

#include <string_view>

constexpr std::string_view definition = R"({"definitions":{"typeTag":"Semaphore_v2.0.0#0.0.0","initialState":{"leds":[{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0},{"r":0,"g":0,"b":0}]},"commands":{"updateState":{"type":"object","properties":{"leds":{"type":"array","items":{"type":"object","properties":{"r":{"type":"number"},"g":{"type":"number"},"b":{"type":"number"}}},"minItems":12,"maxItems":12}}},"shutdown":{"type":"null"}},"events":{"buttonPressed":{"type":"string","enum":["A","B","AB"]}}}})";