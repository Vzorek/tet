import { createSlice } from '@reduxjs/toolkit';
import { IDevice, IDeviceType } from '@tet/devices';

type Serializable = string | number | boolean | Serializable[] | { [key: string]: Serializable };

type SerializableProperties<T> = {
    [P in keyof T]: T[P] extends Serializable ? P : never;
}[keyof T];

type PickSerializable<T> = Pick<T, SerializableProperties<T>>;

export interface DeviceState extends IDevice {
    hidden: boolean;
    position: [number, number];
}

export type DeviceType = PickSerializable<IDeviceType>;

export type DeviceStates = Record<string, DeviceState>;
export type DeviceTypes = Record<string, DeviceType>;

interface DevicesState {
    devices: DeviceStates;
    types: DeviceTypes;
}

const initialState: DevicesState = {
    devices: {},
    types: {},
};

export type Actions = {
    createDevice: {
        type: 'devices/createDevice';
        payload: {
            id: string;
            tag: string;
            initial?: Record<string, unknown>;
        };
    },
    addDevice: {
        type: 'devices/addDevice';
        payload: IDevice;
    },
    addDeviceType: {
        type: 'devices/addDeviceType';
        payload: DeviceType;
    },
    toggleVisibility: {
        type: 'devices/toggleVisibility';
        payload: string;
    },
    setDevicePosition: {
        type: 'devices/setDevicePosition';
        payload: {
            id: string;
            position: [number, number];
        };
    },
};

type UnionOfMembers<T> = T[keyof T];
export type Action = UnionOfMembers<Actions>;

const devicesSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        addDevice(state, { payload }) {
            if (state.devices[payload.id])
                throw new Error(`Device already exists: ${payload.id}`);

            state.devices[payload.id] = {
                ...payload,
                hidden: false,
                position: [0, 0],
            };
        },
        addDeviceType(state, { payload }) {
            if (state.types[payload.tag])
                throw new Error(`Device type already exists: ${payload.tag}`);

            state.types[payload.tag] = payload;
        },
        toggleVisibility(state, action) {
            const device = state.devices[action.payload];
            if (!device)
                throw new Error(`Device not found: ${action.payload}`);

            device.hidden = !device.hidden;
        },
        setDevicePosition(state, action) {
            const device = state.devices[action.payload.id];
            if (!device)
                throw new Error(`Device not found: ${action.payload.id}`);

            device.position = action.payload.position;
        },
    },
});

export default devicesSlice;
