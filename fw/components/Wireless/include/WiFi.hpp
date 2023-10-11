#pragma once

#include "eventpp/hetereventdispatcher.h"

#include "esp_netif.h"
#include "esp_wifi.h"

#include <memory>
#include <string>
#include <vector>

class WiFi {
public:
    using Callbacks = eventpp::HeterTuple<
        void(),
        void(const wifi_event_sta_scan_done_t*),
        void(const wifi_event_sta_connected_t*),
        void(const wifi_event_sta_disconnected_t*),
        void(const wifi_event_sta_authmode_change_t*),
        void(const wifi_event_sta_wps_er_pin_t*),
        void(const wifi_event_sta_wps_fail_reason_t*),
        void(const wifi_event_sta_wps_er_success_t*),
        void(const wifi_event_ap_staconnected_t*),
        void(const wifi_event_ap_stadisconnected_t*),
        void(const wifi_event_ap_probe_req_rx_t*),
        void(const wifi_event_bss_rssi_low_t*),
        void(const wifi_event_ftm_report_t*),
        void(const wifi_event_action_tx_status_t*),
        void(const wifi_event_roc_done_t*),
        void(const wifi_event_ap_wps_rg_pin_t*),
        void(const wifi_event_ap_wps_rg_fail_reason_t*),
        void(const wifi_event_ap_wps_rg_success_t*)>;
    using EventID = int32_t;
    using Dispatcher = eventpp::HeterEventDispatcher<EventID, Callbacks>;
    using Handle = Dispatcher::Handle;

private:
    static constexpr const char* s_tag = "WiFi";

    std::unique_ptr<esp_netif_t, void (*)(esp_netif_t*)> m_netif;

    enum Mode {
        Nothing,
        Connect,
        Create,
        Scan
    };

    std::atomic<Mode> m_mode = Nothing;

    Dispatcher m_dispatcher;

    std::atomic_bool m_connected = false;
    std::atomic_bool m_reconnect = false;

    void _stop();

    WiFi();
    ~WiFi();

    static void trampoline(void* handler_args, esp_event_base_t base, int32_t event_id, void* event_data);

    void startSTA(wifi_config_t config = {});

public:
    static WiFi& singleton();
    void init();

    void connect(std::string ssid, std::string password, bool reconnect = true);
    void createAP(std::string ssid, std::string password, std::uint8_t channel = 6);

    void reset();

    std::vector<wifi_ap_record_t> scan(uint16_t max = 30);
    void startScan();
    void startScan(std::function<void(const std::vector<wifi_ap_record_t>&)>&& cb);

    wifi_mode_t mode();

    bool connected() { return m_connected; }

    template <typename Callback>
    Handle on(EventID event, Callback callback) {
        return m_dispatcher.appendListener(event, callback);
    }

    bool removeListener(EventID event, Handle handle) {
        return m_dispatcher.removeListener(event, handle);
    }
};