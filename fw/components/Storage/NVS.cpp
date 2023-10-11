#include "NVS.hpp"

#include "Exception.hpp"

#include "esp_log.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "nvs_handle.hpp"

#include <cstdint>
#include <exception>
#include <iostream>
#include <map>
#include <memory>
#include <set>
#include <string>
#include <system_error>
#include <type_traits>
#include <variant>
#include <vector>

using Key = NVS::Key;
using Value = NVS::Value;

std::recursive_mutex NVS::s_mutex {};
std::string NVS::s_partition = "nvs";
std::set<std::string> NVS::s_namespaces {};
bool NVS::s_initialized = false;

void NVS::dump(const std::string& part, const std::string& name, nvs_type_t type, std::ostream& out) {
    if (part.size() == 0)
        throw std::invalid_argument("Partition name must be non-empty");
    nvs_iterator_t it = nullptr;
    esp_err_t err = nvs_entry_find(part.c_str(), name.size() ? name.c_str() : NULL, type, &it);
    if (err != ESP_OK)
        throw IDFException(err);
    while (it != NULL) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        out << "Found item type: " << info.key << " of type " << static_cast<unsigned>(info.type);
        if ((err = nvs_entry_next(&it)) != ESP_OK)
            throw IDFException(err);
    }
    nvs_release_iterator(it);
}

std::ostream& operator<<(std::ostream& stream, const NVS& nvs) {
    nvs.dump(stream);
    return stream;
}

NVS::NVS(std::string name, std::string partition)
    : m_name(name) {
    init(partition);
    m_handle = openFlash(name);
}

NVS::NVS(NVS&& other) {
    std::scoped_lock lock(other.m_mutex, m_mutex);
    m_dirty = (other.m_dirty);
    m_name = (other.m_name);
    s_partition = (other.s_partition);
    m_handle = (std::move(other.m_handle));
}

void NVS::changePartition(std::string newPartition) {
    std::scoped_lock lock(s_mutex);
    ESP_LOGI(s_tag, "Changing partition from %s to %s", s_partition.c_str(), newPartition.c_str());

    if (s_partition != newPartition) {
        ESP_LOGW(s_tag, "Partition %s is already active", newPartition.c_str());
        return;
    }

    if (s_initialized)
        deinitFlash(s_partition);

    s_partition = newPartition;
    initFlash(newPartition);
}

void NVS::initFlash(std::string partition) {
    ESP_LOGI(s_tag, "Initializing NVS from partition %s", partition.c_str());
    std::scoped_lock lock(s_mutex);

    if (partition.empty())
        partition = s_partition;

    else if (s_partition != partition) {
        changePartition(partition);
        return;
    }

    CHECK_IDF_ERROR(nvs_flash_init_partition(s_partition.c_str()));

    s_initialized = true;
}

NVS::Handle NVS::openFlash(std::string name, std::string partition) {
    std::scoped_lock lock(s_mutex);

    if (partition.empty())
        partition = s_partition;

    else if (s_partition != partition) {
        changePartition(partition);
    }

    if (s_namespaces.contains(name))
        throw std::logic_error("Namespace " + name + " is already open");

    ESP_LOGI(s_tag, "Opening namespace %s in partition %s", name.c_str(), s_partition.c_str());
    esp_err_t err;
    auto out = nvs::open_nvs_handle_from_partition(s_partition.c_str(),
        name.c_str(),
        NVS_READWRITE,
        &err);

    CHECK_IDF_ERROR(err);

    ESP_LOGV(s_tag, "Successfully opened namespace %s in partition %s", name.c_str(), s_partition.c_str());
    
    s_namespaces.insert(name);

    return out;
}

void NVS::eraseFlash(std::string partition) {
    std::scoped_lock lock(s_mutex);
    ESP_LOGI(s_tag, "Erasing partition %s", s_partition.c_str());
    CHECK_IDF_ERROR(nvs_flash_erase_partition(partition.empty() ? s_partition.c_str() : partition.c_str()));
}

void NVS::init(std::string partition) {
    std::scoped_lock lock(s_mutex);
    ESP_LOGI(s_tag, "Initializing");
    try {
        initFlash(partition);
    } catch (const IDFException& e) {
        if (e.code() == ESP_ERR_NVS_NO_FREE_PAGES
            || e.code() == ESP_ERR_NVS_NEW_VERSION_FOUND) {

            eraseFlash();
            initFlash();

        } else
            throw;
    }
}

void NVS::deinitFlash(std::string partition) {
    std::scoped_lock lock(s_mutex);
    ESP_LOGI(s_tag, "Deinitializing NVS from partition %s", partition.c_str());

    if (!s_initialized) {
        ESP_LOGW(s_tag, "Deinitializing NVS when it has not been initialized");
        return;
    }

    if (partition.empty())
        partition = s_partition;
    else if (s_partition != partition)
        throw std::logic_error("Cannot deinit partition that has not been initialized.");

    if (!s_namespaces.empty())
        throw std::logic_error("Cannot deinit partition with open namespaces");

    CHECK_IDF_ERROR(nvs_flash_deinit_partition(partition.c_str()));

    s_initialized = false;
}

void NVS::commit() {
    std::scoped_lock lock(m_mutex);
    ESP_LOGI(s_tag, "Committing to namespace %s in partition %s", m_name.c_str(), s_partition.c_str());
    CHECK_IDF_ERROR(m_handle->commit());

    m_dirty = false;
}

void NVS::eraseAll() {
    std::scoped_lock lock(m_mutex);
    CHECK_IDF_ERROR(m_handle->erase_all());
}

nvs::ItemType NVS::type(Key key) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");
    auto _types = types();
    auto type = _types.find(key);
    if (type == _types.end())
        throw std::out_of_range("Key [ " + key + " ] does not exist in namespace [ " + m_name + " ]");

    return type->second;
}

template <typename T>
static Value getItem(nvs::NVSHandle* handle, Key key) {
    T val;
    CHECK_IDF_ERROR(handle->get_item(key.c_str(), val));

    return Value(val);
}

Value NVS::get(Key key) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");

    auto type = this->type(key);
    ESP_LOGI(s_tag, "Getting key %s of type %u from namespace %s in partition %s", key.c_str(), static_cast<unsigned>(type), m_name.c_str(), s_partition.c_str());

    switch (type) {
    case nvs::ItemType::U8:
        return getItem<std::uint8_t>(m_handle.get(), key);

    case nvs::ItemType::I8:
        return getItem<std::int8_t>(m_handle.get(), key);

    case nvs::ItemType::U16:
        return getItem<std::uint16_t>(m_handle.get(), key);

    case nvs::ItemType::I16:
        return getItem<std::int16_t>(m_handle.get(), key);

    case nvs::ItemType::U32:
        return getItem<std::uint32_t>(m_handle.get(), key);

    case nvs::ItemType::I32:
        return getItem<std::int32_t>(m_handle.get(), key);

    case nvs::ItemType::U64:
        return getItem<std::uint64_t>(m_handle.get(), key);

    case nvs::ItemType::I64:
        return getItem<std::int64_t>(m_handle.get(), key);

    case nvs::ItemType::SZ: {
        std::size_t len;
        CHECK_IDF_ERROR(m_handle->get_item_size(type, key.c_str(), len));

        std::vector<char> res(len, '\0');
        CHECK_IDF_ERROR(m_handle->get_string(key.c_str(), res.data(), len));

        return Value(std::string(res.data()));
    }
    case nvs::ItemType::BLOB_DATA: {
        std::size_t len;
        CHECK_IDF_ERROR(m_handle->get_item_size(nvs::ItemType::BLOB, key.c_str(), len));

        std::vector<std::uint8_t> res(len, 0);
        CHECK_IDF_ERROR(m_handle->get_blob(key.c_str(), res.data(), len));

        return Value(res);
    }
    default:
        throw std::logic_error("Unknown item type");
    }
}

Value NVS::get(Key key, Value fallback) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");

    auto _types = this->types();
    auto it = _types.find(key);
    if (it == _types.end())
        return fallback;
    return get(key);
}

Value NVS::getOrSet(Key key, Value fallback) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");

    auto _types = this->types();
    auto it = _types.find(key);
    if (it == _types.end()) {
        set(key, fallback);
        return fallback;
    }
    return get(key);
}

template <typename T>
static void setItem(nvs::NVSHandle* handle, Key key, T value) {
    CHECK_IDF_ERROR(handle->set_item(key.c_str(), value));
}

void NVS::set(Key key, Value value) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");

    std::visit([&](auto&& val) {
        using T = std::decay_t<decltype(val)>;
        if constexpr (std::is_same_v<T, std::string>) {
            m_handle->set_string(key.c_str(), val.c_str());
        } else if constexpr (std::is_same_v<T, Blob>) {
            m_handle->set_blob(key.c_str(), val.data(), val.size());
        } else
            setItem(m_handle.get(), key, val);
    },
        value);
    m_dirty = true;
}

void NVS::erase(Key key) {
    std::scoped_lock lock(m_mutex);
    CHECK_IDF_ERROR(m_handle->erase_item(key.c_str()));
}

std::map<Key, nvs::ItemType> NVS::types() {
    std::scoped_lock lock(m_mutex);
    std::map<Key, nvs::ItemType> out;

    nvs_iterator_t it = nullptr;

    try {
        CHECK_IDF_ERROR(nvs_entry_find(s_partition.c_str(), m_name.c_str(), NVS_TYPE_ANY, &it));
    } catch (IDFException& e) {
        if (e.code() != ESP_ERR_NVS_NOT_FOUND)
            throw;
    }

    while (it != nullptr) {
        nvs_entry_info_t info;
        nvs_entry_info(it, &info);
        out.emplace(info.key, static_cast<nvs::ItemType>(info.type));
        try {
            CHECK_IDF_ERROR(nvs_entry_next(&it));
        } catch (IDFException& e) {
            if (e.code() != ESP_ERR_NVS_NOT_FOUND)
                throw;
        }
    }

    nvs_release_iterator(it);
    return out;
}

void NVS::dump(nvs_type_t type, std::ostream& out) const {
    std::scoped_lock lock(m_mutex);
    dump(s_partition, m_name, type, out);
};

void NVS::dump(std::ostream& out) const {
    std::scoped_lock lock(m_mutex);
    dump(NVS_TYPE_ANY, out);
}

NVS::~NVS() {
    std::scoped_lock lock(m_mutex);
    std::scoped_lock slock(s_mutex);
    if (m_dirty)
        commit();
    s_namespaces.erase(m_name);
}

bool NVS::contains(Key key) {
    std::scoped_lock lock(m_mutex);
    if (key.size() >= NVS_KEY_NAME_MAX_SIZE)
        throw std::invalid_argument("Key is too long.");

    auto _types = types();
    return _types.find(key) != _types.end();
}
