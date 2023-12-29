#pragma once

#include "esp_log.h"

#include <format>

enum class LogLevel {
    None = ESP_LOG_NONE,
    Error = ESP_LOG_ERROR,
    Warn = ESP_LOG_WARN,
    Info = ESP_LOG_INFO,
    Debug = ESP_LOG_DEBUG,
    Verbose = ESP_LOG_VERBOSE,
};

auto operator<=>(LogLevel lhs, LogLevel rhs) {
    return static_cast<int>(lhs) <=> static_cast<int>(rhs);
}

auto operator==(LogLevel lhs, LogLevel rhs) {
    return static_cast<int>(lhs) == static_cast<int>(rhs);
}

template<class T>
concept TagConcept = requires {
    requires std::same_as<decltype(T::name), const std::string_view>;
    requires std::same_as<decltype(T::maxLevel), const LogLevel>;
};

template <TagConcept Tag>
class Log {
public:
    Log() = delete;

    template <LogLevel t_level, typename... Args>
    static void log(std::format_string<Args...> format, Args&&... args) {
        if constexpr (t_level <= Tag::maxLevel) {
            std::string out = std::format(format, std::forward<Args>(args)...);
            ESP_LOG_LEVEL_LOCAL(static_cast<int>(t_level), Tag::name.data(), "%s", out.c_str());
        }
    }

    template <typename... Args>
    static void error(std::format_string<Args...> format, Args&&... args) {
        log<LogLevel::Error>(format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    static void warn(std::format_string<Args...> format, Args&&... args) {
        log<LogLevel::Warn>(format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    static void info(std::format_string<Args...> format, Args&&... args) {
        log<LogLevel::Info>(format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    static void debug(std::format_string<Args...> format, Args&&... args) {
        log<LogLevel::Debug>(format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    static void verbose(std::format_string<Args...> format, Args&&... args) {
        log<LogLevel::Verbose>(format, std::forward<Args>(args)...);
    }
};

/*
example usage:

struct MainTag {
    static constexpr std::string_view name = "Main";
    static constexpr LogLevel maxLevel = LogLevel::Debug;
};

Log<MainTag>::error("Error: {}", 1);

using LocalLog = Log<MainTag>;
LocalLog::error("Error: {}", 1);

*/