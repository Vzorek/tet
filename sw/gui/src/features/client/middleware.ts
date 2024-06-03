import { Server, Client, type Command, type Event, type Hello } from '@tet/core';
import { Action } from '../slices';
import { IDeviceType, deviceTypes as initialDeviceTypes } from '@tet/devices';
import { Dispatch, MiddlewareAPI } from '@reduxjs/toolkit';
import { IClientOptions } from 'async-mqtt';
import { DeviceState, DeviceStates } from '../slices/devices';
import { getLayout } from '../store';

const deviceTypes: Record<string, IDeviceType> = { ...initialDeviceTypes };

export function getDeviceType(tag: string): IDeviceType {
    const type = deviceTypes[tag];
    if (type === undefined)
        throw new Error(`Unknown device type: ${tag}`);
    return type;
}

export function getDeviceTypes(): Record<string, IDeviceType> {
    return deviceTypes;
}

class Context {
    client: Client | null;
    server: Server | null;
    api: MiddlewareAPI<Dispatch<Action>>;

    constructor(api: MiddlewareAPI<Dispatch<Action>>) {
        this.client = null;
        this.server = null;
        this.api = api;
    }

    async connectMQTT() {
        const { config } = this.api.getState();
        if (this.client !== null)
            throw new Error('Client is already connected');

        try {
            const clientState = structuredClone(config.mqtt);
            this.client = Client.createMqtt(clientState.url as string, clientState.options as IClientOptions);

            await this.client.connect();
            this.api.dispatch({ type: 'client/connectionSuccessMQTT' });
            await this.attachToClient();

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to connect to MQTT: ${message}`);
            this.api.dispatch({ type: 'client/connectionFailureMQTT', payload: { error: message } });
            this.client = null;
        }
    }

    private async attachToClient() {
        if (this.client === null)
            throw new Error('Client is not connected');

        this.client.on('command', (command: Command) => { this.api.dispatch({ type: 'client/receiveCommand', payload: command }); });
        this.client.on('event', (event: Event) => { this.api.dispatch({ type: 'client/receiveEvent', payload: event }); });
        this.client.on('hello', (hello: Hello) => {
            this.api.dispatch({
                type: 'devices/addDevice', payload: {
                    id: hello.sourceId,
                    typeTag: hello.definitions.typeTag,
                    state: hello.definitions.initialState,
                },
            });
            this.client?.subscribeToCommands(hello.sourceId);
        });
        this.client.subscribeToDevices();
        this.client.subscribeToEvents('__server__');
    }

    async disconnectMQTT() {
        if (this.client !== null) {
            await this.client.asyncDispose();
            this.client = null;
        }

        this.api.dispatch({ type: 'client/disconnectionSuccessMQTT' });
    };

    async connectMock() {
        if (this.client !== null)
            throw new Error('Client is already connected');

        this.client = Client.createMock();

        if (this.server === null)
            this.server = new Server(this.client);

        this.server = new Server(this.client);
        // This is necessary for some reason
        const url = import.meta.env.MODE === 'production'
            ? new URL('workerScript.js', import.meta.url)
            : new URL('@tet/core/dist/src/server/workerScript.js', import.meta.url);
        await this.server.init(url.href);
        await this.attachToClient();
    }

    async disconnectMock() {
        if (this.server !== null) {
            await this.server.asyncDispose();
            this.server = null;
        }
        if (this.client !== null) {
            await this.client.asyncDispose();
            this.client = null;
        }
    }

    async createDevice(id: string, tag: string) {
        if (this.client === null)
            throw new Error('Client is not connected');

        const Type = deviceTypes[tag];
        if (Type === undefined)
            throw new Error(`Unknown device type: ${tag}`);

        // Send hello message to the server as if from the device
        this.client.sendHello(id, Type.definition);
    }
}

const createConnectionMiddleware = (api: MiddlewareAPI<Dispatch<Action>>) => {
    const context = new Context(api);

    return (next: Dispatch<Action>) => async (action: Action) => {
        const { config } = api.getState();
        switch (action.type) {
        case 'client/connectMQTT':
            await context.connectMQTT();
            break;

        case 'config/setConnectionType':
            switch (config.currentType) {
            case 'mock':
                await context.disconnectMock();
                break;
            case 'mqtt':
                await context.disconnectMQTT();
                break;
            }

            switch (action.payload) {
            case 'mock':
                // Mock should connect automatically
                await context.connectMock();
                break;
            }
            break;

        case 'client/disconnectMQTT':
            context.disconnectMQTT();
            api.dispatch({ type: 'client/disconnectionSuccessMQTT' });
            break;

        case 'devices/createDevice':
            await context.createDevice(action.payload.id, action.payload.tag);
            break;

        case 'client/sendEvent': {
            const { sourceId, event, data } = action.payload;
            if (context.client !== null)
                context.client.sendEvent(sourceId, event, data);
            break;
        }

        case 'client/receiveEvent': {
            const { sourceId, event, data } = action.payload;
            if (sourceId !== '__server__')
                break;

            switch (event) {
            case 'gameDump':
                const getDeviceData = ([id, { position, hidden }]: [string, DeviceState]) => [id, { position, hidden }];
                const devices = Object.entries(api.getState().devices.devices as DeviceStates).map(getDeviceData);
                const wrappedData = {
                    serverData: data,
                    layoutData: {
                        devices: Object.fromEntries(devices),
                    },
                };
                const blob = new Blob([JSON.stringify(wrappedData)], { type: 'application/json' });
                const link = document.createElement('a');
                link.download = 'game.json';
                link.href = window.URL.createObjectURL(blob);
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                break;

            default:
                break;
            }
            break;
        }

        case 'client/sendCommand': {
            const { targetId, command, data } = action.payload;
            if (context.client !== null)
                context.client.sendCommand(targetId, command, data);
            break;
        }

        case 'client/receiveCommand': {
            const { targetId, command, data } = action.payload;
            switch (command) {
            case 'stateChange':
                api.dispatch({ type: 'devices/updateState', payload: { targetId, state: data as DeviceState } });
                break;
            }

            break;
        }

        default:
            break;
        }
        return next(action);
    };
};

export default createConnectionMiddleware;

