#include "Logger/Log.hpp"

struct Tag {
    static constexpr std::string_view name = "Tag";
    static constexpr LogLevel maxLevel = LogLevel::Debug;
};

extern "C" void app_main(void) {
    Log<Tag>::error("Error");
    Log<Tag>::warn("Warn");
    Log<Tag>::info("Info");
    Log<Tag>::debug("Debug");
    Log<Tag>::verbose("Verbose");
}
