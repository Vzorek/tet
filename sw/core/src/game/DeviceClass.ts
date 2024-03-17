import { EventMap, ITypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { Type } from './Type.js';

export interface IDevice<State = unknown> {
    readonly id: string;
    state: State;
    readonly deviceClass: IDeviceClass<State>;
}

export interface IDeviceClass<State = unknown, Events extends EventMap = EventMap> extends ITypedEventEmitter<Events> {
    new(id: string): IDevice<State>;
    readonly name: string;
    readonly _state: Type<State>;
    readonly _events: Type<Events>;
}

export type DeviceClassEventMap = {
    [key: string]: (id: string, ...args: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type State<T extends IDeviceClass> = T['_state'];
export type Events<T extends IDeviceClass> = T['_events'];
