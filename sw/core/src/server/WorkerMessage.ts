import * as t from 'io-ts';
import { gameData } from './ServerMessage.js';

export const error = t.type({
    type: t.literal('error'),
    error: t.any,
});

export const ready = t.type({
    type: t.literal('ready'),
});

export const updateDeviceState = t.type({
    type: t.literal('updateDeviceState'),
    id: t.string,
    state: t.any,
});

export const dump = t.type({
    type: t.literal('dump'),
    data: gameData,
});

export const workerMessage = t.union([
    error,
    ready,
    updateDeviceState,
    dump,
]);

export type Error = t.TypeOf<typeof error>;
export type Ready = t.TypeOf<typeof ready>;
export type UpdateDeviceState = t.TypeOf<typeof updateDeviceState>;
export type Dump = t.TypeOf<typeof dump>;

export type WorkerMessage = t.TypeOf<typeof workerMessage>;
