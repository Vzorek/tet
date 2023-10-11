cmake_minimum_required(VERSION 3.16)

FILE(GLOB_RECURSE app_sources *.*)

idf_component_register(
    SRCS ${app_sources}
    INCLUDE_DIRS "include"
    REQUIRES mqtt
    )
