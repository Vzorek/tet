import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { type DeviceClassEventMap, type IDevice, type IDeviceClass } from './DeviceClass.js';
import * as util from 'util';
import * as t from 'io-ts';
import { makeDefaultState } from '../utils/io-tsUtils.js';
import { isLeft } from 'fp-ts/lib/Either.js';
import { GameEvent } from 'server/ServerMessage.js';

type GameEvents = {
    deviceStateChange: (data: { id: string, state: unknown }) => void;
};

class DeviceClass<State,
    Events extends DeviceClassEventMap,
    StateC extends t.Type<State>,
> implements TypedEventEmitter<Events>, IDeviceClass<StateC, Events> {
    readonly parent;
    readonly name;
    readonly _state;
    readonly _events;
    readonly _eventEmitter = new TypedEventEmitter<Events>();

    constructor(parent: Game, name: string, state: StateC, events: Events) {
        this.parent = parent;
        this.name = name;
        this._state = state;
        this._events = events;
    }

    addListener<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.addListener(event, listener);
        return this;
    }

    on<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.on(event, listener);
        return this;
    }

    once<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.once(event, listener);
        return this;
    }

    prependListener<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.prependListener(event, listener);
        return this;
    }

    prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.prependOnceListener(event, listener);
        return this;
    }

    off<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.off(event, listener);
        return this;
    }

    removeAllListeners<E extends keyof Events>(event?: E): this {
        this._eventEmitter.removeAllListeners(event);
        return this;
    }

    removeListener<E extends keyof Events>(event: E, listener: Events[E]): this {
        this._eventEmitter.removeListener(event, listener);
        return this;
    }

    emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean {
        return this._eventEmitter.emit(event, ...args);
    }

    eventNames(): (keyof Events | string | symbol)[] {
        return this._eventEmitter.eventNames();
    }

    rawListeners<E extends keyof Events>(event: E): Events[E][] {
        return this._eventEmitter.rawListeners(event);
    }

    listeners<E extends keyof Events>(event: E): Events[E][] {
        return this._eventEmitter.listeners(event);
    }

    listenerCount<E extends keyof Events>(event: E): number {
        return this._eventEmitter.listenerCount(event);
    }

    getMaxListeners(): number {
        return this._eventEmitter.getMaxListeners();
    }

    setMaxListeners(maxListeners: number): this {
        this._eventEmitter.setMaxListeners(maxListeners);
        return this;
    }
};

export class Game extends TypedEventEmitter<GameEvents> {
    #deviceClasses: Map<string, IDeviceClass> = new Map();
    #devices: Map<string, IDevice> = new Map();
    #links: Map<string, string> = new Map();

    registerDeviceClass(deviceClass: IDeviceClass) {
        this.#deviceClasses.set(deviceClass.name, deviceClass);
    }

    createDevice(deviceClass: string, id: string, initialState?: unknown): IDevice {
        const deviceClassDef = this.#deviceClasses.get(deviceClass);
        if (!deviceClassDef) {
            console.log(`Device classes: ${JSON.stringify(Array.from(this.#deviceClasses.keys()))}`);
            throw new Error(`Device class with name "${deviceClass}" does not exist`);
        }

        const _initialStateAny = initialState ? JSON.parse(JSON.stringify(initialState)) : undefined;
        const _initialState = initialState ? deviceClassDef._state.decode(_initialStateAny) : undefined;
        if (_initialState && isLeft(_initialState))
            throw new Error(`Invalid initial state for device "${id}": ${JSON.stringify(_initialStateAny)}`);

        const state = _initialState ? _initialState.right : makeDefaultState(deviceClassDef._state);

        console.log(`Creating device with state: ${util.inspect(state)}`);

        const device: IDevice = {
            id,
            deviceClass: deviceClassDef,
            state: state,
        };

        this.#devices.set(device.id, device);
        return device;
    }

    linkDeviceType(deviceClass: string, tag: string) {
        const deviceClassDef = this.#deviceClasses.get(deviceClass);
        if (!deviceClassDef)
            throw new Error(`Device class with name "${deviceClass}" does not exist`);

        this.#links.set(tag, deviceClass);
    }

    addDevice(tag: string, id: string): IDevice {
        const deviceClass = this.#links.get(tag);
        if (!deviceClass)
            throw new Error(`No device class linked to tag "${tag}"`);

        return this.createDevice(deviceClass, id);
    }

    updateDeviceState<State>(deviceClass: string, id: string, newState: State) {
        const device = this.#devices.get(id);
        if (!device || device.deviceClass.name !== deviceClass)
            throw new Error(`Device with id "${id}" does not exist`);

        console.log(`Updating device state: ${util.inspect(newState)}`);

        // We probably get a proxy here, so we need to clone the state
        const copy = JSON.parse(JSON.stringify(newState));

        device.state = copy;
        // TODO: Calc diff of state and emit only the diff
        this.emit('deviceStateChange', {
            id,
            state: copy,
        });
    }

    getDeviceClass(name: string): IDeviceClass | undefined {
        return this.#deviceClasses.get(name);
    }

    getDevice(id: string): IDevice | undefined {
        return this.#devices.get(id);
    }

    getDevices(): IDevice[] {
        return Array.from(this.#devices.values());
    }

    getDeviceClasses(): IDeviceClass[] {
        return Array.from(this.#deviceClasses.values());
    }

    getDevicesByClass(name: string): IDevice[] {
        return Array.from(this.#devices.values()).filter(device => device.deviceClass.name === name);
    }

    getLinks(): Map<string, string> {
        return this.#links;
    }

    defineDeviceClass<State,
        Events extends DeviceClassEventMap,
        StateC extends t.Type<State>,
    >(
        name: string,
        state: StateC,
        events: Events,
    ): IDeviceClass<StateC, Events> {
        const out = new DeviceClass<State, Events, StateC>(this, name, state, events);

        this.registerDeviceClass(out); // Register the device class with the active game

        return out;
    }

    /**
     * @brief Resolves a device from a source object.
     *
     * If device already exists, it is returned.
     * Otherwise, if a device class is linked to the tag, a new device is created.
     *
     * @param identification - The source object
     * @returns The device
     */
    resolveDevice({ id, tag }: { id: string, tag: string }): IDevice {
        return this.#devices.get(id) || this.addDevice(tag, id);
    }

    receiveEvent(event: GameEvent) {
        try {
            const device = this.resolveDevice(event.source);

            // We need to clone the state here, because the device class might modify it, which is not allowed
            const state = structuredClone(device.state);

            device.deviceClass.emit(event.event.event, event.source.id, event.event.data, state);

        } catch (e) {
            console.error('Error while handling event:', e);
        }
    }
};
