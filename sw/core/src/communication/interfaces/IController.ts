import { TypedEventEmitter } from '../../utils/TypedEventEmitter.js';
import { IEvent, IHello, IMessage } from '../Device.js';
import { IRawMessage } from '../Device.js';

export type ControllerEventCallbacks = {
    connect: () => void;
    disconnect: () => void;
    rawMessage: (msg: IRawMessage) => void;
    message: (msg: IMessage) => void;
    hello: (msg: IHello) => void;
    event: (msg: IEvent) => void;
};

export type IController = TypedEventEmitter<ControllerEventCallbacks> & {
    connect(): void;
    disconnect(): void;
    sendCommand(deviceId: string, command: string, data: unknown): void;
    isConnected(): boolean;
};
