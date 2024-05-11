import * as t from 'io-ts';
import { tinyJSONSchema, tinyJSONSchemaNull } from '../utils/TinyJSONSchema.js';

const commandData = tinyJSONSchema; // will be sent as command.data

// type Version = string;
// function isVersion(v: string): v is Version {
//     return /^\d+\.\d+\.\d+$/.test(v);
// }

// const version = t.refinement(t.string, isVersion, 'Version');

type TypeTag = string;
// type tag takes form of ${deviceType}#${hwVersion}, where hwVersion is a semver version
function isTypeTag(v: string): v is TypeTag {
    return /^[^#]+#\d+\.\d+\.\d+$/.test(v);
}

const typeTag = t.refinement(t.string, isTypeTag, 'TypeTag');

// type HWVersionOf = string;
// const isHWVersionOf = (typeName: string) => (v: string): v is HWVersionOf => v.startsWith(typeName) && isTypeTag(v);
// const hwVersionOf = (typeName: string) => t.refinement(t.string, isHWVersionOf(typeName), `HWVersionOf<${typeName}>`);

// Require updateState and shutdown commands but allow any other commands
export const commandsDefinition = t.intersection([
    t.record(t.string, commandData),
    t.type({
        updateState: tinyJSONSchema,
        shutdown: tinyJSONSchemaNull, // shutdown command has no data
    }),
], 'CommandsDefinition');

export type CommandsDefinition = t.TypeOf<typeof commandsDefinition>;

export type CommandsDefinitionTransform<Definitions extends Record<string, t.Mixed>> = {
    [K in keyof Definitions]: {
        command: K;
        data: t.TypeOf<Definitions[K]>;
    }
}[keyof Definitions];

const eventData = tinyJSONSchema;

export const eventsDefinition = t.record(t.string, eventData); // will be expected as event.data

export type EventsDefinition = t.TypeOf<typeof eventsDefinition>;

export type EventDefinitionsTransform<Definitions extends Record<string, t.Mixed>> = {
    [K in keyof Definitions]: {
        event: K;
        data: t.TypeOf<Definitions[K]>;
    }
}[keyof Definitions];

export const deviceDefinition = t.type({
    typeTag: typeTag,
    initialState: t.unknown, // This will be validated based on state definition from `updateState` command
    commands: commandsDefinition,
    events: eventsDefinition,
}, 'DeviceDefinition');

export type DeviceDefinition = t.TypeOf<typeof deviceDefinition>;

export const rawMessage = t.type({
    topic: t.string,
    payload: t.string,
}, 'RawMessage');

export const hello = t.type({
    type: t.literal('hello'),
    sourceId: t.string,
    definitions: deviceDefinition,
}, 'Hello');

export const command = t.type({
    type: t.literal('command'),
    targetId: t.string,
    command: t.string,
    data: t.unknown,
}, 'Command');

export const commandPayload = t.type({
    command: t.string,
    data: t.unknown,
}, 'CommandPayload');

export const event = t.type({
    type: t.literal('event'),
    sourceId: t.string,
    event: t.string,
    data: t.unknown,
}, 'Event');

export const eventPayload = t.type({
    event: t.string,
    data: t.unknown,
}, 'EventPayload');

export type RawMessage = t.TypeOf<typeof rawMessage>;

export type Hello = t.TypeOf<typeof hello>;
export type Command = t.TypeOf<typeof command>;
export type Event = t.TypeOf<typeof event>;
export type EventWithTag = Event & { tag: TypeTag };

export type CommandPayload = t.TypeOf<typeof commandPayload>;
export type EventPayload = t.TypeOf<typeof eventPayload>;

export const message = t.union([hello, command, event], 'Message');

export type Message = t.TypeOf<typeof message>;
