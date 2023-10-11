# This component demonstrates how to add an existing third-party library as a component
# to ESP-IDF build system.
#
# Since we are wrapping the library inside a component,
# the component has to be registered first:
cmake_minimum_required(VERSION 3.16)

idf_component_register()

include(FetchContent)

FetchContent_Declare(magic_enum URL https://github.com/Neargye/magic_enum/archive/refs/heads/master.zip)
FetchContent_MakeAvailable(magic_enum)

target_include_directories(${COMPONENT_LIB} INTERFACE "${magic_enum_SOURCE_DIR}/include")
target_link_libraries(${COMPONENT_LIB} INTERFACE magic_enum::magic_enum)
