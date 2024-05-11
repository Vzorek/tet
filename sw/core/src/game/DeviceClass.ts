import { EventMap, ITypedEventEmitter } from '../utils/TypedEventEmitter.js';
import * as t from 'io-ts';

export interface IDevice<State = unknown> {
    readonly id: string;
    state: State;
    readonly deviceClass: IDeviceClass<State>;
}

export interface IDeviceClass<
    State = unknown,
    Events extends EventMap = EventMap,
    StateC extends t.Type<State> = t.Mixed,
> extends ITypedEventEmitter<Events> {
    readonly name: string;
    readonly _state: StateC;
    readonly _events: Events;
}

export type DeviceClassEventMap = {
    [key: string]: (id: string, ...args: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type State<T extends IDeviceClass> = T['_state'];
export type Events<T extends IDeviceClass> = T['_events'];
