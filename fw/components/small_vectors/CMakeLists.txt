# This component demonstrates how to add an existing third-party library as a component
# to ESP-IDF build system.
#
# Since we are wrapping the library inside a component,
# the component has to be registered first:
cmake_minimum_required(VERSION 3.16)

idf_component_register()

include(FetchContent)

FetchContent_Declare(small_vectors URL https://github.com/arturbac/small_vectors/archive/refs/heads/master.zip)
FetchContent_Populate(small_vectors)
# FetchContent_MakeAvailable(small_vectors)

target_include_directories(${COMPONENT_LIB} INTERFACE "${small_vectors_SOURCE_DIR}/include")
