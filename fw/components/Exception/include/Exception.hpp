#pragma once

#include "esp_err.h"

#include <exception>
#include <string>
#include <source_location>

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
    const char* what() const noexcept override {
        return m_msg.c_str();
    }
};

class IDFException : public Exception {
protected:
    esp_err_t m_err;
    const char* m_expr;
    std::source_location m_location;

public:
    explicit IDFException(esp_err_t code, const char* expr = nullptr, std::source_location location = std::source_location::current())
        : Exception(
            std::string("IDF error: ") + esp_err_to_name(code) + " (" + std::to_string(code) + ")"
            + (expr ? std::string(" in ") + expr : "")
            + " at " + location.file_name() + ":" + std::to_string(location.line()) + ":" + std::to_string(location.column())
        )
        , m_err(code)
        , m_expr(expr)
        , m_location(location) {}

    virtual esp_err_t code() const noexcept { return m_err; }
    virtual std::source_location location() const noexcept { return m_location; }
};

#define CHECK_IDF_ERROR(x) \
    do { \
        esp_err_t __err = (x); \
        if (unlikely(__err != ESP_OK)) { \
            throw IDFException(__err, #x); \
        } \
    } while (0)
