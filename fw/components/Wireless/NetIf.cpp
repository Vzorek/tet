#include "NetIf.hpp"

#include "Exception.hpp"

#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "esp_netif_ppp.h"

#include <atomic>
#include <stdexcept>

NetIf::Dispatcher NetIf::s_dispatcher = NetIf::Dispatcher();

void NetIf::trampoline(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) {
    ESP_LOGI(s_tag, "NetIf::trampoline: event_id=%ld", event_id);

    switch (event_id) {
    case IP_EVENT_STA_GOT_IP:
        s_dispatcher.dispatch(event_id, static_cast<const ip_event_got_ip_t*>(event_data));
        break;
    case IP_EVENT_STA_LOST_IP:
        s_dispatcher.dispatch(event_id);
        break;
    case IP_EVENT_AP_STAIPASSIGNED:
        s_dispatcher.dispatch(event_id, static_cast<const ip_event_ap_staipassigned_t*>(event_data));
        break;
    case IP_EVENT_GOT_IP6:
        s_dispatcher.dispatch(event_id, static_cast<const ip_event_got_ip6_t*>(event_data));
        break;
    case IP_EVENT_ETH_GOT_IP:
        s_dispatcher.dispatch(event_id, static_cast<const ip_event_got_ip_t*>(event_data));
        break;
    case IP_EVENT_ETH_LOST_IP:
        s_dispatcher.dispatch(event_id);
        break;
    case IP_EVENT_PPP_GOT_IP:
        s_dispatcher.dispatch(event_id, static_cast<const ip_event_got_ip_t*>(event_data));
        break;
    case IP_EVENT_PPP_LOST_IP:
        s_dispatcher.dispatch(event_id);
        break;
    }
}

void NetIf::init() {
    esp_err_t err;

    err = esp_netif_init();
    if (err != ESP_OK)
        throw IDFException(err);
    err = esp_event_loop_create_default();
    if (err != ESP_OK)
        throw IDFException(err);
    err = esp_event_handler_register(IP_EVENT, ESP_EVENT_ANY_ID, &trampoline, nullptr);
    if (err != ESP_OK)
        throw IDFException(err);
}

NetIf::NetIf(const esp_netif_config_t& config) {
    m_netif = esp_netif_new(&config);
    if (!m_netif)
        throw std::runtime_error("esp_netif_new failed");
}

NetIf::NetIf(esp_netif_t* netif)
    : m_netif(netif) {
    if (!m_netif)
        throw std::invalid_argument("The argument cannot be nullptr");
}
