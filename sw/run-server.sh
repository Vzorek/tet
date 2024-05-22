#!/bin/bash

cd server

# Ports to check
MOSQUITTO_PORT1=1883
MOSQUITTO_PORT2=9001

# Function to check if a port is available
check_port() {
  local PORT=$1
  if lsof -i:$PORT >/dev/null; then
    echo "Port $PORT is already in use."
    return 1
  else
    echo "Port $PORT is available."
    return 0
  fi
}

# Check ports
check_port $MOSQUITTO_PORT1 || exit 1
check_port $MOSQUITTO_PORT2 || exit 1

# Run Docker Compose
echo "All required ports are available. Starting Docker Compose..."
docker-compose up --build
