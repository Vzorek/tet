import { TypedEventEmitter } from '../../utils/TypedEventEmitter.js';
import { type Command, type Message } from '../definitions.js';
import { type RawMessage } from '../definitions.js';

export type PeripheralEventCallbacks = {
    connect: () => void;
    disconnect: () => void;
    rawMessage: (msg: RawMessage) => void;
    message: (msg: Message) => void;
    command: (msg: Command) => void;
};

export type IPeripheral = TypedEventEmitter<PeripheralEventCallbacks> & {
    connect(): void;
    disconnect(): void;
    isConnected(): boolean;
    sendEvent(deviceId: string, event: string, data: unknown): void;
    sendCommand(deviceId: string, command: string, data: unknown): void;
};
