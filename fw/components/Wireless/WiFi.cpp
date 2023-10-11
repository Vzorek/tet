#include "WiFi.hpp"

#include "NetIf.hpp"
#include "Exception.hpp"

#include "esp_log.h"
#include "esp_netif.h"
#include "esp_wifi.h"

#include <algorithm>
#include <memory>
#include <string>
#include <vector>

WiFi::WiFi()
    : m_netif(nullptr, esp_netif_destroy) {}

WiFi::~WiFi() {
}

WiFi& WiFi::singleton() {
    static WiFi instance;
    return instance;
}

void WiFi::init() {
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    cfg.nvs_enable = 0;
    cfg.nano_enable = 1;
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_wifi_set_storage(WIFI_STORAGE_RAM));

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &trampoline, this, nullptr));

    m_dispatcher.appendListener(WIFI_EVENT_STA_START, [this]() {
        ESP_LOGI(s_tag, "WIFI_EVENT_STA_START");
        if (m_mode == Connect) {
            ESP_ERROR_CHECK(esp_wifi_connect());
            ESP_LOGI(s_tag, "Connecting...");
        }
    });

    m_dispatcher.appendListener(WIFI_EVENT_STA_CONNECTED, [this](const wifi_event_sta_connected_t* event) {
        ESP_LOGI(s_tag, "WIFI_EVENT_STA_CONNECTED");
        ESP_LOGI(s_tag, "SSID: %s", event->ssid);
        ESP_LOGI(s_tag, "Channel: %d", event->channel);
        ESP_LOGI(s_tag, "Authmode: %d", event->authmode);

        m_connected = true;
    });

    m_dispatcher.appendListener(WIFI_EVENT_STA_DISCONNECTED, [this](const wifi_event_sta_disconnected_t* event) {
        ESP_LOGI(s_tag, "WIFI_EVENT_STA_DISCONNECTED");
        ESP_LOGI(s_tag, "Reason: %u", event->reason);

        m_connected = false;

        if (!m_reconnect)
            return;

        ESP_LOGI(s_tag, "Reconnecting...");
        auto err = esp_wifi_connect();
        if (err != ESP_OK) {
            throw IDFException(err);
        }
    });
}

void WiFi::trampoline(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) {
    WiFi* self = static_cast<WiFi*>(arg);

    ESP_LOGI(WiFi::s_tag, "WiFi event! %d", (int)event_id);

    switch (event_id) {
    case WIFI_EVENT_SCAN_DONE:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_scan_done_t*>(event_data));
        break;
    case WIFI_EVENT_STA_CONNECTED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_connected_t*>(event_data));
        break;
    case WIFI_EVENT_STA_DISCONNECTED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_disconnected_t*>(event_data));
        break;
    case WIFI_EVENT_STA_AUTHMODE_CHANGE:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_authmode_change_t*>(event_data));
        break;
    case WIFI_EVENT_STA_WPS_ER_SUCCESS:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_wps_er_success_t*>(event_data));
        break;
    case WIFI_EVENT_STA_WPS_ER_FAILED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_wps_fail_reason_t*>(event_data));
        break;
    case WIFI_EVENT_STA_WPS_ER_PIN:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_sta_wps_er_pin_t*>(event_data));
        break;
    case WIFI_EVENT_AP_STACONNECTED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_staconnected_t*>(event_data));
        break;
    case WIFI_EVENT_AP_STADISCONNECTED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_stadisconnected_t*>(event_data));
        break;
    case WIFI_EVENT_AP_PROBEREQRECVED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_probe_req_rx_t*>(event_data));
        break;
    case WIFI_EVENT_FTM_REPORT:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ftm_report_t*>(event_data));
        break;
    case WIFI_EVENT_STA_BSS_RSSI_LOW:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_bss_rssi_low_t*>(event_data));
        break;
    case WIFI_EVENT_ACTION_TX_STATUS:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_action_tx_status_t*>(event_data));
        break;
    case WIFI_EVENT_ROC_DONE:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_roc_done_t*>(event_data));
        break;
    case WIFI_EVENT_AP_WPS_RG_SUCCESS:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_wps_rg_success_t*>(event_data));
        break;
    case WIFI_EVENT_AP_WPS_RG_FAILED:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_wps_rg_fail_reason_t*>(event_data));
        break;
    case WIFI_EVENT_AP_WPS_RG_PIN:
        self->m_dispatcher.dispatch(event_id, static_cast<wifi_event_ap_wps_rg_pin_t*>(event_data));
        break;
    default:
        self->m_dispatcher.dispatch(event_id);
    }
}

void WiFi::createAP(std::string ssid, std::string password, std::uint8_t channel) {
    if (ssid.size() > 31) {
        throw std::invalid_argument("SSID must be less than 32 characters");
    }
    if (password.size() > 63) {
        throw std::invalid_argument("Password must be less than 64 characters");
    }

    reset();

    m_mode = Create;

    m_netif = std::unique_ptr<esp_netif_t, void (*)(esp_netif_t*)>(esp_netif_create_default_wifi_ap(), esp_netif_destroy);
    if (m_netif == nullptr) {
        throw std::runtime_error("Failed to create AP netif");
    }

    auto err = esp_wifi_set_mode(WIFI_MODE_AP);
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    wifi_config_t wifi_config = {};

    if (password.size() >= 8) {
        std::copy_n(password.data(), password.size(), wifi_config.ap.password);
        wifi_config.ap.authmode = WIFI_AUTH_WPA_WPA2_PSK;
    } else {
        wifi_config.ap.authmode = WIFI_AUTH_OPEN;
    }

    std::copy_n(ssid.data(), ssid.size(), wifi_config.ap.ssid);

    wifi_config.ap.channel = channel;
    wifi_config.ap.beacon_interval = 400;
    wifi_config.ap.max_connection = 2;

    err = esp_wifi_set_config(WIFI_IF_AP, &wifi_config);
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    err = esp_wifi_start();
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    esp_wifi_set_bandwidth(WIFI_IF_AP, WIFI_BW_HT20);
}

void WiFi::startSTA(wifi_config_t config) {
    _stop();
    m_connected = false;

    m_netif = std::unique_ptr<esp_netif_t, void (*)(esp_netif_t*)>(esp_netif_create_default_wifi_sta(), esp_netif_destroy);
    if (!m_netif) {
        throw std::runtime_error("Failed to create STA netif");
    }

    auto err = esp_wifi_set_mode(WIFI_MODE_STA);
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    err = esp_wifi_set_config(WIFI_IF_STA, &config);
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    err = esp_wifi_start();
    if (err != ESP_OK) {
        throw IDFException(err);
    }
}

void WiFi::connect(std::string ssid, std::string password, bool reconnect) {
    if (ssid.size() > MAX_SSID_LEN) {
        throw std::invalid_argument("SSID must be less than 32 characters");
    }
    if (password.size() > MAX_PASSPHRASE_LEN) {
        throw std::invalid_argument("Password must be less than 64 characters");
    }

    m_reconnect = reconnect;

    wifi_config_t wifi_config = {};
    // std::copy_n(ssid.data(), ssid.size() + 1, wifi_config.sta.ssid);
    // std::copy_n(password.data(), password.size() + 1, wifi_config.sta.password);

    // wifi_config.sta.ssid = ssid.data();
    // wifi_config.sta.ssid = password.data();

    snprintf((char*)wifi_config.sta.ssid, 32, "%s", ssid.c_str());
    snprintf((char*)wifi_config.sta.password, 64, "%s", password.c_str());

    ESP_LOGI(s_tag, "Connecting to %s with password %s", wifi_config.sta.ssid, wifi_config.sta.password);

    m_mode = Connect;
    startSTA(wifi_config);
}

std::vector<wifi_ap_record_t> WiFi::scan(uint16_t max) {
    if (m_connected) {
        throw std::runtime_error("Cannot scan while connected");
    }

    m_mode = Scan;
    startSTA();

    std::vector<wifi_ap_record_t> out(max);

    auto err = esp_wifi_scan_start(nullptr, true);
    if (err != ESP_OK)
        throw IDFException(err);

    err = esp_wifi_scan_get_ap_records(&max, out.data());
    if (err != ESP_OK)
        throw IDFException(err);

    out.resize(max);
    return out;
}

void WiFi::startScan() {
    if (m_connected) {
        throw std::runtime_error("Cannot scan while connected");
    }

    m_mode = Scan;
    startSTA();

    auto err = esp_wifi_scan_start(nullptr, false);
    if (err != ESP_OK)
        throw IDFException(err);
}

void WiFi::startScan(std::function<void(const std::vector<wifi_ap_record_t>&)>&& cb) {
    if (m_connected) {
        throw std::logic_error("Cannot scan while connected");
    }

    Dispatcher::Handle handle {};

    handle = m_dispatcher.appendListener(WIFI_EVENT_SCAN_DONE, [=, this](const wifi_event_sta_scan_done_t* data) {
        std::vector<wifi_ap_record_t> out(data->number);
        uint16_t max = data->number;
        auto err = esp_wifi_scan_get_ap_records(&max, out.data());
        if (err != ESP_OK)
            throw IDFException(err);
        cb(out);
        this->m_dispatcher.removeListener(WIFI_EVENT_SCAN_DONE, handle);
    });

    startScan();
}

// bool WiFi::tryConnect(std::string ssid, std::string password, TickType_t timeout) {
//     Dispatcher::Handle handle {};

//     handle = m_dispatcher.appendListener(WIFI_EVENT_STA_DISCONNECTED, [=, this](const wifi_event_sta_scan_done_t* data) {
//         std::vector<wifi_ap_record_t> out(data->number);
//         uint16_t max = data->number;
//         auto err = esp_wifi_scan_get_ap_records(&max, out.data());
//         if (err != ESP_OK)
//             throw IDFException(err);
//         cb(out);
//         this->m_dispatcher.removeListener(WIFI_EVENT_STA_CONNECTED, handle);
//     });
// }

void WiFi::_stop() {
    auto err = esp_wifi_stop();
    if (err != ESP_OK) {
        throw IDFException(err);
    }

    m_netif.reset();
}

void WiFi::reset() {
    _stop();
    m_reconnect = false;
    m_connected = false;
    m_mode = Nothing;
}
