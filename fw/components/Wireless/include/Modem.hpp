#pragma once

#include "Exception.hpp"
#include "NetIf.hpp"

#include "eventpp/eventdispatcher.h"

#include "cxx_include/esp_modem_api.hpp"
#include "cxx_include/esp_modem_dte.hpp"
#include "esp_modem_config.h"
#include "esp_netif_ppp.h"

#include <memory>
#include <stdexcept>

class Modem {
public:
    using EventID = std::int32_t;
    using Dispatcher = eventpp::EventDispatcher<EventID, void(NetIf)>;
    using Callback = Dispatcher::Callback;

private:
    static constexpr const char* s_tag = "Modem";

    static void trampoline(void* handler_args, esp_event_base_t base, int32_t event_id, void* event_data) {
        ESP_LOGI(s_tag, "Received event: %s:%li", base, event_id);
        Modem* modem = static_cast<Modem*>(handler_args);
        modem->m_dispatcher.dispatch(event_id, {static_cast<esp_netif_t*>(event_data)});
    }

    NetIf m_netif;
    std::shared_ptr<esp_modem::DTE> m_dte;
    std::unique_ptr<esp_modem::DCE> m_dce;
    Dispatcher m_dispatcher;

    Modem(std::unique_ptr<esp_modem::DCE> dce,
        std::shared_ptr<esp_modem::DTE> dte,
        NetIf netif)
        : m_netif(std::move(netif))
        , m_dte(std::move(dte))
        , m_dce(std::move(dce)) {
        if (!m_dte)
            throw std::invalid_argument("dte cannot be null");

        if (!m_dce)
            throw std::invalid_argument("dce cannot be null");

        CHECK_IDF_ERROR(
            esp_event_handler_register(NETIF_PPP_STATUS,
                ESP_EVENT_ANY_ID,
                trampoline,
                this));
    }

public:
    static Modem SIM800(
        esp_modem_dte_config_t dte_config = ESP_MODEM_DTE_DEFAULT_CONFIG(),
        esp_modem_dce_config_t dce_config = ESP_MODEM_DCE_DEFAULT_CONFIG("internet"),
        NetIf netif = NetIf::createDefaultPPP()) {
        auto dte = esp_modem::create_uart_dte(&dte_config);
        if (!dte)
            throw std::runtime_error("Failed to create DTE");

        std::unique_ptr<esp_modem::DCE> dce = esp_modem::create_SIM800_dce(&dce_config, dte, netif);
        if (!dce)
            throw std::runtime_error("Failed to create DCE");

        return { std::move(dce), std::move(dte), std::move(netif) };
    }

    Modem(const Modem&) = delete;
    Modem(Modem&&) = default;

    Modem& operator=(const Modem&) = delete;
    Modem& operator=(Modem&&) = default;

    ~Modem() {
        esp_event_handler_unregister(NETIF_PPP_STATUS, ESP_EVENT_ANY_ID, trampoline);
        m_netif.destroy();
    }

    void on(EventID event, Callback callback) {
        m_dispatcher.appendListener(event, callback);
    }

    NetIf& netif() { return m_netif; }
    const NetIf& netif() const { return m_netif; }

    esp_modem::DCE& dce() { return *m_dce; }
    const esp_modem::DCE& dce() const { return *m_dce; }

    esp_modem::DCE* operator->() { return m_dce.get(); }
    const esp_modem::DCE* operator->() const { return m_dce.get(); }
};
