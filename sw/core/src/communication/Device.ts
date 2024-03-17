import * as t from 'io-ts';

const CommandDefinition = t.type({
    command: t.string,
    data: t.unknown,
}, 'CommandDefinition');

const EventDefinition = t.type({
    event: t.string,
    data: t.unknown,
}, 'EventDefinition');

export const DeviceDefinitions = t.type({
    stateDefinition: t.unknown,
    commands: t.array(CommandDefinition),
    events: t.array(EventDefinition),
}, 'DeviceDefinitions');

export type DeviceDefinitions = t.TypeOf<typeof DeviceDefinitions>;

export const IRawMessage = t.type({
    topic: t.string,
    payload: t.string,
}, 'IRawMessage');

export const IHello = t.type({
    type: t.literal('hello'),
    sourceId: t.string,
    definitions: DeviceDefinitions,
}, 'IHello');

export const ICommand = t.type({
    type: t.literal('command'),
    targetId: t.string,
    command: t.string,
    data: t.unknown,
}, 'ICommand');

export const CommandPayload = t.type({
    command: t.string,
    data: t.unknown,
}, 'CommandPayload');

export const IEvent = t.type({
    type: t.literal('event'),
    sourceId: t.string,
    event: t.string,
    data: t.unknown,
}, 'IEvent');

export const EventPayload = t.type({
    event: t.string,
    data: t.unknown,
}, 'EventPayload');

export type IRawMessage = t.TypeOf<typeof IRawMessage>;

export type IHello = t.TypeOf<typeof IHello>;
export type ICommand = t.TypeOf<typeof ICommand>;
export type IEvent = t.TypeOf<typeof IEvent>;

export type CommandPayload = t.TypeOf<typeof CommandPayload>;
export type EventPayload = t.TypeOf<typeof EventPayload>;

export const IMessage = t.union([IHello, ICommand, IEvent], 'IMessage');

export type IMessage = t.TypeOf<typeof IMessage>;
