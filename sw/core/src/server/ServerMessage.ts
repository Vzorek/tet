import { event, deviceDefinition } from '../communication/index.js';
import * as t from 'io-ts';

export const start = t.type({
    type: t.literal('start'),
});

export const pause = t.type({
    type: t.literal('pause'),
});

export const reset = t.type({
    type: t.literal('reset'),
});

export const runScript = t.type({
    type: t.literal('runScript'),
    script: t.string,
});

export const gameEvent = t.type({
    type: t.literal('event'),
    source: t.type({
        id: t.string,
        tag: t.string,
    }),
    event: event,
});

export const addDevice = t.type({
    type: t.literal('addDevice'),
    definition: deviceDefinition,
    id: t.string,
});

export const serverMessage = t.union([
    start,
    pause,
    reset,
    runScript,
    gameEvent,
    addDevice,
]);

export type Start = t.TypeOf<typeof start>;
export type Pause = t.TypeOf<typeof pause>;
export type Reset = t.TypeOf<typeof reset>;
export type RunScript = t.TypeOf<typeof runScript>;
export type GameEvent = t.TypeOf<typeof gameEvent>;
export type AddDevice = t.TypeOf<typeof addDevice>;

export type ServerMessage = t.TypeOf<typeof serverMessage>;
