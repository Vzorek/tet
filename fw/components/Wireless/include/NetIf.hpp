#pragma once

#include "Exception.hpp"

#include "eventpp/hetereventdispatcher.h"

#include "esp_event.h"
#include "esp_netif.h"
#include "esp_netif_ppp.h"
#include "esp_netif_types.h"

#include <memory>

class NetIf {
public:
    using Callbacks = eventpp::HeterTuple<
        void(const ip_event_got_ip_t*),
        void(const ip_event_got_ip6_t*),
        void(const ip_event_add_ip6_t*),
        void(const ip_event_ap_staipassigned_t*),
        void()>;
    using EventID = std::int32_t;
    using Dispatcher = eventpp::HeterEventDispatcher<EventID, Callbacks>;
    using Handle = Dispatcher::Handle;

private:
    static constexpr const char* s_tag = "NetIf";

    static void trampoline(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data);
    static Dispatcher s_dispatcher;
    esp_netif_t* m_netif;

public:
    NetIf(const esp_netif_config_t& config);
    NetIf(esp_netif_t* netif);

    esp_netif_t* get() { return m_netif; }
    const esp_netif_t* get() const { return m_netif; }

    operator esp_netif_t*() { return m_netif; }

    static void destroy(NetIf& netif) {
        esp_netif_destroy(netif.get());
        netif.m_netif = nullptr;
    }

    void destroy() { destroy(*this); }

    static NetIf createDefaultWifi() { return { ESP_NETIF_DEFAULT_WIFI_STA() }; }
#ifdef CONFIG_PPP_SUPPORT
    static NetIf createDefaultPPP() { return { ESP_NETIF_DEFAULT_PPP() }; }
#endif // CONFIG_PPP_SUPPORT
    static NetIf createDefaultEth() { return { ESP_NETIF_DEFAULT_ETH() }; }

    static void init();

    template <typename Callback>
    static Handle on(EventID event, Callback callback) {
        return s_dispatcher.appendListener(event, callback);
    }

    static bool removeListener(EventID event, Handle handle) {
        return s_dispatcher.removeListener(event, handle);
    }

    static void setDefault(NetIf& netif) {
        CHECK_IDF_ERROR(esp_netif_set_default_netif(netif.get()));
    }

    void setDefault() { setDefault(*this); }
    static NetIf getDefault() { return { esp_netif_get_default_netif() }; }

    void joinIP6MulticastGroup(const esp_ip6_addr_t* addr) {
        CHECK_IDF_ERROR(esp_netif_join_ip6_multicast_group(m_netif, addr));
    }

    void leaveIP6MulticastGroup(const esp_ip6_addr_t* addr) {
        CHECK_IDF_ERROR(esp_netif_leave_ip6_multicast_group(m_netif, addr));
    }

    using MAC = std::array<uint8_t, 4>;

    void setMAC(MAC& mac) {
        CHECK_IDF_ERROR(esp_netif_set_mac(m_netif, mac.data()));
    }

    MAC getMAC() {
        MAC data;
        CHECK_IDF_ERROR(esp_netif_get_mac(m_netif, data.data()));
        return data;
    }

    void setHostname(const char* hostname) {
        CHECK_IDF_ERROR(esp_netif_set_hostname(m_netif, hostname));
    }

    const char* getHostname() {
        const char* hostname;
        CHECK_IDF_ERROR(esp_netif_get_hostname(m_netif, &hostname));
        return hostname;
    }

    bool isUp() { return esp_netif_is_netif_up(m_netif); }

    esp_netif_ip_info_t getIPInfo() {
        esp_netif_ip_info_t info;
        CHECK_IDF_ERROR(esp_netif_get_ip_info(m_netif, &info));
        return info;
    }

    esp_netif_ip_info_t getOldIPInfo() {
        esp_netif_ip_info_t info;
        CHECK_IDF_ERROR(esp_netif_get_old_ip_info(m_netif, &info));
        return info;
    }

    void setIPInfo(const esp_netif_ip_info_t& info) {
        CHECK_IDF_ERROR(esp_netif_set_ip_info(m_netif, &info));
    }

};
