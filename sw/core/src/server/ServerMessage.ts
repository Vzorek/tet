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

export const dumpGame = t.type({
    type: t.literal('dump'),
});

export const gameData = t.type({
    devices: t.array(t.type({
        id: t.string,
        state: t.any,
        deviceClass: t.string,
    })),
    links: t.record(t.string, t.string),
});

export const loadGame = t.type({
    type: t.literal('load'),
    data: gameData,
});

export const serverMessage = t.union([
    start,
    pause,
    reset,
    runScript,
    gameEvent,
    addDevice,
    dumpGame,
    loadGame,
]);

export type GameData = t.TypeOf<typeof gameData>;

export type Start = t.TypeOf<typeof start>;
export type Pause = t.TypeOf<typeof pause>;
export type Reset = t.TypeOf<typeof reset>;
export type RunScript = t.TypeOf<typeof runScript>;
export type GameEvent = t.TypeOf<typeof gameEvent>;
export type AddDevice = t.TypeOf<typeof addDevice>;
export type DumpGame = t.TypeOf<typeof dumpGame>;
export type LoadGame = t.TypeOf<typeof loadGame>;

export type ServerMessage = t.TypeOf<typeof serverMessage>;
