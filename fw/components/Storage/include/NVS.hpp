#pragma once

#include "nvs.h"
#include "nvs_flash.h"
#include "nvs_handle.hpp"

#include <cstdint>
#include <iostream>
#include <map>
#include <memory>
#include <mutex>
#include <set>
#include <string>
#include <variant>
#include <vector>

using Blob = std::vector<std::uint8_t>;

static inline const std::string s_defaultPartition = "nvs";

class NVS {
    friend std::ostream& operator<<(std::ostream& stream, const NVS& nvs);

private:
    using Handle = std::unique_ptr<nvs::NVSHandle>;

    static constexpr const char* s_tag = "NVS";

    static std::recursive_mutex s_mutex;
    static std::string s_partition;
    static std::set<std::string> s_namespaces;
    static bool s_initialized;

    mutable std::recursive_mutex m_mutex;
    std::string m_name;
    bool m_dirty = false;
    Handle m_handle;

    static void initFlash(std::string partition = "");
    static void deinitFlash(std::string partition = "");
    static void changePartition(std::string newPartition);
    static void eraseFlash(std::string partition = "");
    static Handle openFlash(std::string name, std::string partition = "");

public:
    using Key = std::string;
    using Value = std::variant<
        std::uint8_t,
        std::int8_t,
        std::uint16_t,
        std::int16_t,
        std::uint32_t,
        std::int32_t,
        std::uint64_t,
        std::int64_t,
        std::string,
        Blob>;

    NVS(std::string name, std::string partition = s_defaultPartition);
    NVS(NVS&&);

    NVS(NVS&) = delete;
    NVS& operator=(NVS&) = delete;

    static void init(std::string partition = "");
    void commit();
    void eraseAll();

    nvs::ItemType type(Key);
    Value get(Key);
    Value get(Key, Value fallback);
    Value getOrSet(Key key, Value fallback);

    template <typename T>
    T get(Key key, T fallback) { return std::get<T>(get(key)); }

    template <typename T>
    T getOrSet(Key key, T fallback) { 
        std::scoped_lock lock(m_mutex);
        if (contains(key)) {
            return std::get<T>(get(key));
        } else {
            set(key, fallback);
            return fallback;
        }
    }

    void set(Key, Value);
    void erase(Key);

    std::map<Key, nvs::ItemType> types();

    static void dump(const std::string& part, const std::string& name, nvs_type_t type, std::ostream& out = std::cout);
    void dump(nvs_type_t type = NVS_TYPE_ANY, std::ostream& out = std::cout) const;
    void dump(std::ostream& out) const;

    bool contains(Key);

    ~NVS();
};
