#pragma once

#include "IP.hpp"

#include <esp_log.h>
#include <esp_system.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <mdns.h>

#include <array>
#include <string>
#include <string_view>
#include <optional>

#define MDNS_SERVICE_NAME "tet-controller"
#define MDNS_SERVICE_TYPE "_http._tcp"

namespace mDNS {

class Device {
private:
    static constexpr const char* s_tag = "mDNS::Device";

    std::string m_hostname;
    std::string m_instance_name;

public:
    struct ServiceResult {
        std::string hostname;
        std::string instance_name;
        std::string service;
        std::string protocol;
        int port;
        IP ip;

        ServiceResult() = default;
        ServiceResult(const mdns_result_t& result)
            : hostname(result.hostname)
            , instance_name(result.instance_name)
            , service(result.service_type)
            , protocol(result.proto)
            , port(result.port)
            , ip(result.addr->addr) {
        }
    };

    Device(std::string_view hostname, std::string_view instance_name = "")
        : m_hostname(hostname)
        , m_instance_name(instance_name) {
        ESP_ERROR_CHECK(mdns_init());
        ESP_ERROR_CHECK(mdns_hostname_set(m_hostname.c_str()));
        if (!m_instance_name.empty()) {
            ESP_ERROR_CHECK(mdns_instance_name_set(m_instance_name.c_str()));
        }
    }

    Device(const Device&) = delete;
    Device(Device&&) = delete;

    Device& operator=(const Device&) = delete;
    Device& operator=(Device&&) = delete;

    ~Device() {
        mdns_free();
    }

    esp_ip4_addr_t queryHost(const std::string& hostname) {
        esp_ip4_addr_t addr = {
            .addr = 0,
        };
        ESP_ERROR_CHECK(mdns_query_a(hostname.c_str(), 3000, &addr));
        return addr;
    }

    std::optional<ServiceResult> queryService(std::string serviceName, std::string protocol) {
        ESP_LOGI(s_tag, "Query PTR: %s.%s.local", serviceName.c_str(), protocol.c_str());

        mdns_result_t* results = nullptr;
        ESP_ERROR_CHECK(mdns_query_ptr(serviceName.c_str(), protocol.c_str(), 3000, 20, &results));

        if (!results) {
            ESP_LOGW(s_tag, "No results found!");
            return std::nullopt;
        }

        ServiceResult result(*results);
        mdns_query_results_free(results);
        return result;
    }
};

} // namespace mDNS
