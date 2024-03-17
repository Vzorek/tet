import { TypedEventEmitter } from '../../utils/TypedEventEmitter.js';
import { ICommand, IMessage } from '../Device.js';
import { IRawMessage } from '../Device.js';

export type PeripheralEventCallbacks = {
    connect: () => void;
    disconnect: () => void;
    rawMessage: (msg: IRawMessage) => void;
    message: (msg: IMessage) => void;
    command: (msg: ICommand) => void;
};

export type IPeripheral = TypedEventEmitter<PeripheralEventCallbacks> & {
    connect(): void;
    disconnect(): void;
    isConnected(): boolean;
    sendEvent(deviceId: string, event: string, data: unknown): void;
    sendCommand(deviceId: string, command: string, data: unknown): void;
};
