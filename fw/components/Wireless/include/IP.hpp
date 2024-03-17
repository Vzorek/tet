#pragma once

#include <esp_netif_ip_addr.h>

#include <array>
#include <cstdint>
#include <ostream>
#include <string>
#include <variant>

class IP {
    friend std::ostream& operator<<(std::ostream& os, const IP& ip);

private:
    using V6 = std::array<std::uint8_t, 16>;
    using V4 = std::array<std::uint8_t, 4>;

    std::variant<V4, V6> m_addr;

public:
    IP(const V4& addr)
        : m_addr(addr) {}
    IP(const V6& addr)
        : m_addr(addr) {}
    IP(const esp_ip_addr_t& addr) {
        if (addr.type == ESP_IPADDR_TYPE_V4) {
            for (std::size_t i = 0; i < 4; ++i) {
                std::get<0>(m_addr)[i] = addr.u_addr.ip4.addr >> (i * 8);
            }
        } else {
            for (std::size_t i = 0; i < 16; ++i) {
                std::get<1>(m_addr)[i] = addr.u_addr.ip6.addr[i];
            }
        }
    }

    std::string toString() {
        std::string result;
        if (m_addr.index() == 0) {
            const auto& v4 = std::get<0>(m_addr);
            result = std::to_string(v4[0]) + '.' + std::to_string(v4[1]) + '.' + std::to_string(v4[2]) + '.' + std::to_string(v4[3]);
        } else {
            const auto& v6 = std::get<1>(m_addr);
            result = std::to_string(v6[0]) + std::to_string(v6[1]) + ':' + std::to_string(v6[2]) + std::to_string(v6[3]) + ':' +
                     std::to_string(v6[4]) + std::to_string(v6[5]) + ':' + std::to_string(v6[6]) + std::to_string(v6[7]) + ':' +
                     std::to_string(v6[8]) + std::to_string(v6[9]) + ':' + std::to_string(v6[10]) + std::to_string(v6[11]) + ':' +
                     std::to_string(v6[12]) + std::to_string(v6[13]) + ':' + std::to_string(v6[14]) + std::to_string(v6[15]);
        }
        return result;
    }

    operator esp_ip_addr_t() const {
        esp_ip_addr_t addr;
        if (m_addr.index() == 0) {
            addr.type = ESP_IPADDR_TYPE_V4;
            addr.u_addr.ip4.addr = 0;
            for (std::size_t i = 0; i < 4; ++i) {
                addr.u_addr.ip4.addr |= std::get<0>(m_addr)[i] << (i * 8);
            }
        } else {
            addr.type = ESP_IPADDR_TYPE_V6;
            for (std::size_t i = 0; i < 16; ++i) {
                addr.u_addr.ip6.addr[i] = std::get<1>(m_addr)[i];
            }
        }
        return addr;
    }
};

std::ostream& operator<<(std::ostream& os, const IP& ip) {
    std::ios_base::fmtflags originalFlags = os.flags();

    if (ip.m_addr.index() == 0) {
        const auto& v4 = std::get<0>(ip.m_addr);
        os << static_cast<int>(v4[0]) << '.'
           << static_cast<int>(v4[1]) << '.'
           << static_cast<int>(v4[2]) << '.'
           << static_cast<int>(v4[3]);
    } else {
        const auto& v6 = std::get<1>(ip.m_addr);
        os << static_cast<int>(v6[0]) << ':'
           << static_cast<int>(v6[1]) << ':'
           << static_cast<int>(v6[2]) << ':'
           << static_cast<int>(v6[3]) << ':'
           << static_cast<int>(v6[4]) << ':'
           << static_cast<int>(v6[5]) << ':'
           << static_cast<int>(v6[6]) << ':'
           << static_cast<int>(v6[7]) << ':'
           << static_cast<int>(v6[8]) << ':'
           << static_cast<int>(v6[9]) << ':'
           << static_cast<int>(v6[10]) << ':'
           << static_cast<int>(v6[11]) << ':'
           << static_cast<int>(v6[12]) << ':'
           << static_cast<int>(v6[13]) << ':'
           << static_cast<int>(v6[14]) << ':'
           << static_cast<int>(v6[15]);
    }

    os.flags(originalFlags);

    return os;
}