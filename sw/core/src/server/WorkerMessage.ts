import * as t from 'io-ts';

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

export const workerMessage = t.union([
    error,
    ready,
    updateDeviceState,
]);

export type Error = t.TypeOf<typeof error>;
export type Ready = t.TypeOf<typeof ready>;
export type UpdateDeviceState = t.TypeOf<typeof updateDeviceState>;

export type WorkerMessage = t.TypeOf<typeof workerMessage>;
