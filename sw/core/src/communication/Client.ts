import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { IConnection } from './interfaces/IConnection.js';
import { type DeviceDefinition, command, event, hello, type Message, type RawMessage } from './definitions.js';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as E from 'fp-ts/lib/Either.js';
import { ClientEventCallbacks, IClient } from './interfaces/IClient.js';
import { createLogger } from '../log/index.js';
import { MockConnection } from './MockConnection.js';
import { MQTTConnection } from './MQTTConnection.js';
import { IClientOptions } from 'async-mqtt';

const logger = createLogger('Client');

function parseTopic(topic: string): E.Either<Error, { id: string, type: 'device' | 'command' | 'event' }> {
    const parts = topic.split('/');
    if (parts.length === 3) return E.right({ id: parts[2], type: 'device' }); // tet/devices/<id>
    if (parts.length === 4) {
        switch (parts[3]) {
        case 'commands': return E.right({ id: parts[2], type: 'command' }); // tet/devices/<id>/commands
        case 'events': return E.right({ id: parts[2], type: 'event' }); // tet/devices/<id>/events
        }
    }
    return E.left(new Error(`Invalid topic: ${topic}`));
}

function decodePayload<T, O, I>(decoder: t.Type<T, O, I>, input: I): E.Either<Error, T> {
    logger.info(input);
    return pipe(
        decoder.decode(input),
        E.mapLeft(errors => new Error(PathReporter.report(E.left(errors)).join('\n'))),
    );
}

function parseMessage(msg: RawMessage): E.Either<Error, Message> {
    return pipe(
        parseTopic(msg.topic),
        E.chain((topicInfo): E.Either<Error, Message> => {
            let payload;
            try {
                payload = JSON.parse(msg.payload);
            } catch (error) {
                return E.left(new Error('Invalid JSON payload'));
            }

            switch (topicInfo.type) {
            case 'device':
                return decodePayload(hello, { ...payload, type: 'hello', sourceId: topicInfo.id });
            case 'command':
                return decodePayload(command, { ...payload, type: 'command', targetId: topicInfo.id });
            case 'event':
                return decodePayload(event, { ...payload, type: 'event', sourceId: topicInfo.id });
            default:
                return E.left(new Error(`Unknown message type: ${topicInfo.type}`));
            }
        }),
    );
}

export class Client extends TypedEventEmitter<ClientEventCallbacks> implements IClient {
    private connection: IConnection;

    private static getDeviceTopic(deviceId: string) { return `tet/devices/${deviceId}`; }
    private static getCommandTopic(deviceId: string) { return `${this.getDeviceTopic(deviceId)}/commands`; }
    private static getEventTopic(deviceId: string) { return `${this.getDeviceTopic(deviceId)}/events`; }

    private onMessage(msg: RawMessage) {
        logger.debug(`Received message: ${msg.topic}: ${msg.payload}`);
        this.emit('rawMessage', msg);

        const parsed = parseMessage(msg);

        if (E.isLeft(parsed)) {
            logger.error(parsed.left);
            return;
        }

        try {
            this.emit('message', parsed.right);

            switch (parsed.right.type) {
            case 'hello':
                this.emit('hello', parsed.right);
                break;
            case 'command':
                this.emit('command', parsed.right);
                break;
            case 'event':
                this.emit('event', parsed.right);
                break;
            }
        } catch (error) {
            logger.error(error);
        }
    }

    constructor(connection: IConnection) {
        super();
        this.connection = connection;

        this.connection.on('connect', () => { this.emit('connect'); });
        this.connection.on('disconnect', () => { this.emit('disconnect'); });
        this.connection.on('message', this.onMessage.bind(this));
    }

    static createMock(): Client {
        return new Client(new MockConnection());
    }

    static createMqtt(url: string, options?: IClientOptions): Client {
        return new Client(new MQTTConnection(url, options));
    }

    async connect(): Promise<void> {
        await this.connection.connect();
    }

    async disconnect(): Promise<void> {
        this.connection.disconnect();
    }

    isConnected(): boolean {
        return this.connection.isConnected();
    }

    async sendCommand(targetId: string, command: string, data: unknown): Promise<void> {
        const msg = {
            command,
            data,
        };
        await this.connection.send(Client.getCommandTopic(targetId), JSON.stringify(msg), true);
    }

    async sendEvent(sourceId: string, event: string, data: unknown): Promise<void> {
        const msg = {
            event,
            data,
        };
        await this.connection.send(Client.getEventTopic(sourceId), JSON.stringify(msg));
    }

    async sendHello(sourceId: string, definitions: DeviceDefinition): Promise<void> {
        const msg = {
            definitions,
        };
        await this.connection.send(Client.getDeviceTopic(sourceId), JSON.stringify(msg), true);
    }

    async subscribeToDevices(): Promise<void> {
        await this.connection.subscribe(Client.getDeviceTopic('+')); // Subscribe to all devices
    }

    async subscribeToCommands(deviceId: string): Promise<void> {
        this.connection.subscribe(Client.getCommandTopic(deviceId));
    }

    async subscribeToEvents(deviceId: string): Promise<void> {
        this.connection.subscribe(Client.getEventTopic(deviceId));
    }

    async asyncDispose() {
        try {
            await this.connection.disconnect();
        } catch {
        }
    }

    [Symbol.asyncDispose]() {
        return this.asyncDispose();
    }
}
