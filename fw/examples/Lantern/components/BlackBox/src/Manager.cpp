#include "BlackBox/Manager.hpp"

#include "BlackBox/pinout.hpp"

namespace BlackBox {
Manager::Manager()
{
}

void Manager::init() {
#ifdef BB_LDC
    m_ldc.init();
#endif

#ifdef BB_LOCK
    m_lock.init();
#endif

#ifdef BB_POWER
    m_power.init();
#endif

#ifdef BB_RTC
    m_rtc.init();
#endif

#ifdef BB_TOUCHPAD
    m_touchpad.init(&m_ldc);
#endif

#ifdef BB_DOORS
for (auto& i : m_doors)
    i.init();
#endif
}

#ifdef BB_LDC
LDC& Manager::ldc() {
    return m_ldc;
}
#endif

#ifdef BB_LOCK
Lock& Manager::lock() {
    return m_lock;
}
#endif

#ifdef BB_POWER
Power& Manager::power() {
    return m_power;
}
#endif

#ifdef BB_RING
Ring& Manager::ring() {
    return m_ring;
}
#endif

#ifdef BB_BEACON
    Beacon<>& Manager::beacon() {
        return m_beacon;
    }
#endif

#ifdef BB_RTC
RTC& Manager::rtc() {
    return m_rtc;
}
#endif

#ifdef BB_TOUCHPAD
Touchpad& Manager::touchpad() {
    return m_touchpad;
}
#endif

#ifdef BB_DOORS
Door& Manager::door(int number) {
    return m_doors.at(number);
}

std::array<Door, 4>& Manager::doors() {
    return m_doors;
}
#endif

} // namespace BlackBox
