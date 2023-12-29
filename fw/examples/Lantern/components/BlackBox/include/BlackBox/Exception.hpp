#pragma once

#include "esp_err.h"

#include <exception>
#include <string>

namespace BlackBox {
class Exception : public std::exception {
protected:
    /** Error message.
     */
    std::string m_msg;

public:
    /** Constructor (C strings).
     *  @param message C-style string error message.
     *                 The string contents are copied upon construction.
     *                 Hence, responsibility for deleting the char* lies
     *                 with the caller. 
     */
    explicit Exception(const char* message)
        : m_msg(message) {}

    /** Constructor (C++ STL strings).
     *  @param message The error message.
     */
    explicit Exception(const std::string& message)
        : m_msg(message) {}

    /** Destructor.
     * Virtual to allow for subclassing.
     */
    virtual ~Exception() noexcept {}

    /** Returns a pointer to the (constant) error description.
     *  @return A pointer to a const char*. The underlying memory
     *          is in posession of the Exception object. Callers must
     *          not attempt to free the memory.
     */
    virtual const char* what() const noexcept {
        return m_msg.c_str();
    }
};

class IDFException : protected Exception {
protected:
    esp_err_t m_err;

public:
    explicit IDFException(esp_err_t code)
        : Exception(esp_err_to_name(code))
        , m_err(code) {}

    virtual esp_err_t code() const noexcept { return m_err; }
};
} // namespace BlackBox
