import { TypedEventEmitter } from '../../utils/TypedEventEmitter.js';
import { type Event, type Hello, type Message } from '../definitions.js';
import { type RawMessage } from '../definitions.js';

export type ControllerEventCallbacks = {
    connect: () => void;
    disconnect: () => void;
    rawMessage: (msg: RawMessage) => void;
    message: (msg: Message) => void;
    hello: (msg: Hello) => void;
    event: (msg: Event) => void;
};

export type IController = TypedEventEmitter<ControllerEventCallbacks> & {
    connect(): void;
    disconnect(): void;
    sendCommand(deviceId: string, command: string, data: unknown): void;
    isConnected(): boolean;
};
