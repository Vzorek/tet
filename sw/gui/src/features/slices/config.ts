import { createSlice } from '@reduxjs/toolkit';
import * as t from 'io-ts';
import * as f from  'fp-ts';
import { Transform } from './utils';

export type Actions = {
    setConnectionType: 'mock' | 'mqtt';
    setUrl: string;
    setUser: string;
    setPassword: string;
};

const State = t.type({
    currentType: t.union([t.literal('mock'), t.literal('mqtt')]),
    mqtt: t.type({
        url: t.union([t.string, t.undefined]),
        username: t.union([t.string, t.undefined]),
        password: t.union([t.string, t.undefined]),
    }),
    mock: t.undefined,
});

type State = t.TypeOf<typeof State>;

export type Action = Transform<Actions, 'config'>;
export type ActionType = Action['type'];

export type SetConnectionType = Actions['setConnectionType'];
export type SetUrl = Actions['setUrl'];
export type SetUser = Actions['setUser'];
export type SetPassword = Actions['setPassword'];

const defaultState: State = {
    currentType: 'mock',
    mqtt: {
        url: undefined,
        username: undefined,
        password: undefined,

    },
    mock: undefined,
};

export function saveConfig(state: State): void {
    localStorage.setItem('config', JSON.stringify(state));
}

function loadConfig(): State {
    const state = localStorage.getItem('config');
    if (state === null)
        return defaultState;

    const parsed = State.decode(JSON.parse(state));
    if (f.either.isRight(parsed))
        return parsed.right;
    saveConfig(defaultState);
    return defaultState;
}

const configSlice = createSlice({
    name: 'config',
    initialState: loadConfig(),
    reducers: {
        setConnectionType(state, action) {
            state.currentType = action.payload;
        },
        setUrl(state, action) {
            if (state.currentType !== 'mqtt')
                throw new Error('Cannot set URL for non-MQTT connection');
            state.mqtt.url = action.payload;
        },
        setUser(state, action) {
            if (state.currentType !== 'mqtt')
                throw new Error('Cannot set user for non-MQTT connection');
            state.mqtt.username = action.payload;
        },
        setPassword(state, action) {
            if (state.currentType !== 'mqtt')
                throw new Error('Cannot set password for non-MQTT connection');
            state.mqtt.password = action.payload;
        },
    },
});

export default configSlice;
