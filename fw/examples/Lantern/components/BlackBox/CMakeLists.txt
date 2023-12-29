cmake_minimum_required(VERSION 3.16)

FILE(GLOB_RECURSE app_sources src/*.*)

idf_component_register(SRCS ${app_sources}
                       INCLUDE_DIRS include
                       REQUIRES eventpp driver esp_timer SmartLeds esp_adc)
