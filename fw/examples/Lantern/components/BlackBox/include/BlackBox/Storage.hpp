#pragma once

#include <map>
#include <mutex>

namespace BlackBox {

template <class HardwareStorage>
class CachedStorage {
public:
    using Key = typename HardwareStorage::Key;
    using Value = typename HardwareStorage::Value;

private:
    mutable std::recursive_mutex m_mutex;
    HardwareStorage m_hardStore;

    std::map<Key, Value> m_cache;

    bool m_dirty = false;
    bool m_initialized = false;

public:
    CachedStorage(HardwareStorage&& storage);
    Value get(const Key&) const;
    Value get(const Key&, Value fallback) const;
    void set(const Key& key, const Value& value);

    void flush();
    void update();
    void load();
};

template <class HardwareStorage>
CachedStorage<HardwareStorage>::CachedStorage(HardwareStorage&& storage)
    : m_hardStore(std::move(storage)) {
}

template <class HardwareStorage>
void CachedStorage<HardwareStorage>::update() {
    std::scoped_lock lock(m_mutex);
    for (auto&& kv : m_cache)
        m_cache[kv.first] = m_hardStore.get(kv.first, kv.second);
}

template <class HardwareStorage>
void CachedStorage<HardwareStorage>::flush() {
    std::scoped_lock lock(m_mutex);
    for (auto&& kv : m_cache)
        m_hardStore.set(kv.first, kv.second);
    m_dirty = false;
}

template <class HardwareStorage>
void CachedStorage<HardwareStorage>::set(const Key& key, const Value& value) {
    std::scoped_lock lock(m_mutex);
    m_cache[key] = value;
}

template <class HardwareStorage>
typename CachedStorage<HardwareStorage>::Value CachedStorage<HardwareStorage>::get(const Key& key, Value fallback) const {
    std::scoped_lock lock(m_mutex);
    auto it = m_cache.find(key);
    return it != m_cache.end() ? it->second : fallback;
}

template <class HardwareStorage>
typename CachedStorage<HardwareStorage>::Value CachedStorage<HardwareStorage>::get(const Key& key) const {
    std::scoped_lock lock(m_mutex);
    return m_cache.at(key);
}

} // namespace BlackBox
