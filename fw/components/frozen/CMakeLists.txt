# This component demonstrates how to add an existing third-party library as a component
# to ESP-IDF build system.
#
# Since we are wrapping the library inside a component,
# the component has to be registered first:
cmake_minimum_required(VERSION 3.16)

idf_component_register()

include(FetchContent)

FetchContent_Declare(frozen URL https://github.com/serge-sans-paille/frozen/archive/refs/heads/master.zip )
FetchContent_MakeAvailable(frozen)

target_include_directories(${COMPONENT_LIB} INTERFACE "include")
target_link_libraries(${COMPONENT_LIB} INTERFACE frozen::frozen)
