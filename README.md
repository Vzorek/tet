# BlackBox (Tet)

## Devices

Currently supported devices:
- [x] BlackBox
- [x] Lucerna
- [x] Maják
- [x] Semafor
- [x] Artefakt
- [ ] Semi-semafor
- [ ] BT-reproduktor

## Communication

- Devices connect to broker running on central server with mqtts with double sided certificates.
- All messages are to be send with qos 2 with small session keepalive time

### Glossary:
- `device_id`
    + unique id of the device

- `command_topic`
    + device specific mqtt topic used for controlling the device
    + "devices/`<device_id>`/commands"

- `state_topic`
    + device specific mqtt topic used for reporting connection status of device and announcing capabilites
    + "devices/`<device_id>`"

- `event_topic`
    + device specific mqtt topic used for reporting events that occured on the device
    + "devices/`<device_id>`/events"

### Connection

After connection each device:

1. subscribes to `command_topic`
2. sets last_will to disconnect message in `state_topic`
3. publishes its capabilities to `state_topic`

### Disconnect

If a device disconnects:

The main server may choose to send commands to achieve expected state of the device with retain flag to `command_topic`

### Capabilities

Capabilities are sent to `state_topic` as json object.
Capabilities include:
+ commands
+ events
+ state object definition

#### Commands

Commands are sent to `command_topic` as json object.
Commands must be stateless and idempotent.
Commands are in form of:
```json
{
    "command": "command_name",
    "args": {
        "arg1": "value1",
        "arg2": "value2"
    }
}
```

Sending multiple commands at once is also supported using json array:
```json
[
    {
        "command": "command_name",
        "args": {
            "arg1": "value1",
            "arg2": "value2"
        }
    },
    {
        "command": "command_name2",
        "args": {
            "arg1": "value1",
            "arg2": "value2"
        }
    }
]
```

#### Events

Events are sent to `event_topic` as json object.
Events are in form of:
```json
{
    "event": "event_name",
    "args": {
        "arg1": "value1",
        "arg2": "value2"
    }
}
```

### Extensions

#### Configuration

- `configuration_topic`
    + device specific mqtt topic used for sending configuration to the device
    + "devices/`<device_id>`/config"

There might be a need to set persistent configuration on the device.
Specifically for devices that are expected to be offline for long periods of time.

Configuration is sent to `configuration_topic` as json object.
Following configuration options are to be supported:
- Adding/modifying context variables
- Registering handlers for events

Configuration commands have the same as normal commands.

##### Context variables
Commands:
1. `set` (name, value)
    - sets context variable
2. `unset` (name)
    - unsets context variable

##### Event handlers
Commands:
1. `register` (event, handler)
    - registers handler for event
    - handler is a piece of JS code to be evaluated with access to:
        + immutable state object
        + context variables
        + commands in form of JS functions with same name and arguments as commands

2. `unregister` (event)
    - unregisters handler for event

Special case of configuration-only event handling is event `on_start` which is called when device starts.
