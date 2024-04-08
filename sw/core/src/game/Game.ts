import { type Event } from '../communication/index.js';
import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { DeviceClassEventMap, IDevice, IDeviceClass } from './DeviceClass.js';
import { Type } from './Type.js';

type GameEvents = {
    deviceStateChange: () => void;
};

export class Game extends TypedEventEmitter<GameEvents> {
    #deviceClasses: Map<string, IDeviceClass> = new Map();
    #devices: Map<string, IDevice> = new Map();

    registerDeviceClass(deviceClass: IDeviceClass) {
        this.#deviceClasses.set(deviceClass.name, deviceClass);
    }

    registerDevice(device: IDevice) {
        this.#devices.set(device.id, device);
    }

    updateDeviceState<State>(deviceClass: string, id: string, newState: State) {
        deviceClass;
        id;
        newState;
    }

    getDeviceClass(name: string): IDeviceClass | undefined {
        return this.#deviceClasses.get(name);
    }

    getDevice(id: string): IDevice | undefined {
        return this.#devices.get(id);
    }

    defineDeviceClass<State, Events extends DeviceClassEventMap>(name: string, state: Type<State>, events: Type<Events>): IDeviceClass<State, Events> {
        const parent = this; // eslint-disable-line @typescript-eslint/no-this-alias

        const out = class Device implements IDevice<State> {
            static readonly parent = parent;
            static readonly name = name;
            static readonly _state = state;
            static readonly _events = events;
            static #eventEmitter = new TypedEventEmitter<Events>();

            readonly deviceClass = Device;
            readonly id!: string;
            state: State;

            constructor(id: string, initialState?: State) {
                if (Device.parent.getDevice(id))
                    throw new Error(`Device with id "${id}" already exists`);

                Object.defineProperty(this, 'id', { value: id, writable: false });
                this.state = initialState || state.createDefault();

                Device.parent.registerDevice(this); // Register the device with the active game
            }

            static addListener<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.addListener(event, listener);
                return Device;
            }

            static on<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.on(event, listener);
                return Device;
            }

            static once<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.once(event, listener);
                return Device;
            }

            static prependListener<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.prependListener(event, listener);
                return Device;
            }

            static prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.prependOnceListener(event, listener);
                return Device;
            }

            static off<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.off(event, listener);
                return Device;
            }

            static removeAllListeners<E extends keyof Events>(event?: E): typeof Device {
                Device.#eventEmitter.removeAllListeners(event);
                return Device;
            }

            static removeListener<E extends keyof Events>(event: E, listener: Events[E]): typeof Device {
                Device.#eventEmitter.removeListener(event, listener);
                return Device;
            }

            static emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean {
                return Device.#eventEmitter.emit(event, ...args);
            }

            static eventNames(): (keyof Events | string | symbol)[] {
                return Device.#eventEmitter.eventNames();
            }

            static rawListeners<E extends keyof Events>(event: E): Events[E][] {
                return Device.#eventEmitter.rawListeners(event);
            }

            static listeners<E extends keyof Events>(event: E): Events[E][] {
                return Device.#eventEmitter.listeners(event);
            }

            static listenerCount<E extends keyof Events>(event: E): number {
                return Device.#eventEmitter.listenerCount(event);
            }

            static getMaxListeners(): number {
                return Device.#eventEmitter.getMaxListeners();
            }

            static setMaxListeners(maxListeners: number): typeof Device {
                Device.#eventEmitter.setMaxListeners(maxListeners);
                return Device;
            }
        };

        this.registerDeviceClass(out); // Register the device class with the active game

        return out;
    }

    receiveEvent(event: Event) {
        this.#devices.get(event.sourceId)?.deviceClass.emit(event.event, event.sourceId, event.data);
    }
};
