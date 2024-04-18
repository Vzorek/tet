import { createSlice } from '@reduxjs/toolkit';

import { type Event, type Command, type Hello } from '@tet/core';
import { Transform } from './utils';

export type Actions = {
    connectMQTT: undefined;
    disconnectMQTT: undefined;

    connectionSuccessMQTT: undefined;
    connectionFailureMQTT: {
        error: unknown;
    };

    disconnectionSuccessMQTT: undefined;

    sendCommand: Command;
    sendEvent: Event;
    sendHello: Hello;

    receiveCommand: Command;
    receiveEvent: Event;
    receiveHello: Hello;
};

export type Action = Transform<Actions, 'client'>;
export type ActionType = Action['type'];

type ClientState = {
    state: 'connected' | 'disconnected' | 'error';
};

const initialState: ClientState = {
    state: 'disconnected',
};

const devicesSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        connectionSuccessMQTT(state) {
            return { ...state, state: 'connected' };
        },
        connectionFailureMQTT(state) {
            return { ...state, state: 'error' };
        },
        disconnectionSuccessMQTT(state) {
            return { ...state, state: 'disconnected' };
        },
    },
});

export default devicesSlice;
