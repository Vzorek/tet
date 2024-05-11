import React from 'react';
import * as t from 'io-ts';
import { NullSchema, TypeOfMap, codecToSchema, type DeviceDefinition, type EventsDefinition } from '@tet/core';

export type EventHandler<Events extends Record<string, unknown>> = (event: keyof Events, data: Events[typeof event]) => void;
export type Renderer<State, Events extends Record<string, unknown>> = (state: State, onEvent: EventHandler<Events>) => React.ReactNode;

export interface IDevice<State = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly state: State;
    readonly id: string;
    readonly typeTag: string;
}

export interface IDeviceType<State = any, Events extends Record<string, unknown> = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly tag: string;
    readonly initialState: State
    readonly definition: DeviceDefinition;
    readonly render: Renderer<State, Events>;
    readonly createDevice: (id: string) => IDevice<State>;
}

export function makeDeviceType<
    StateCodec extends t.Mixed,
    Events extends Record<string, t.Mixed> = Record<string, t.Mixed>,
>(
    tag: string,
    stateCodec: StateCodec,
    initialState: t.TypeOf<StateCodec>,
    events: Events,
    render: Renderer<t.TypeOf<StateCodec>, TypeOfMap<typeof events>>,
): IDeviceType<StateCodec, TypeOfMap<typeof events>> {
    if (!stateCodec.is(initialState))
        throw new Error('Invalid initial state');

    return {
        tag,
        initialState,
        definition: {
            typeTag: tag,
            initialState: initialState,
            commands: {
                updateState: codecToSchema(stateCodec as any), // eslint-disable-line @typescript-eslint/no-explicit-any
                shutdown: codecToSchema(t.null) as NullSchema,
            },
            events: Object.fromEntries(Object.entries(events).map(([key, value]) => [key, codecToSchema(value as any)])) as EventsDefinition, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        render,
        createDevice: (id: string): IDevice<t.TypeOf<StateCodec>> => {
            return {
                id,
                state: initialState,
                typeTag: tag,
            };
        },
    };
}
