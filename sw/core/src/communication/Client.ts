import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { IConnection } from './interfaces/IConnection.js';
import { DeviceDefinitions, ICommand, IEvent, IHello, IMessage, IRawMessage } from './Device.js';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as E from 'fp-ts/lib/Either.js';
import { ClientEventCallbacks, IClient } from './interfaces/IClient.js';
import { createLogger } from '../log/index.js';

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
    return pipe(
        decoder.decode(input),
        E.mapLeft(errors => new Error(PathReporter.report(E.left(errors)).join('\n'))),
    );
}

function parseMessage(msg: IRawMessage): E.Either<Error, IMessage> {
    return pipe(
        parseTopic(msg.topic),
        E.chain((topicInfo): E.Either<Error, IMessage> => {
            let payload;
            try {
                payload = JSON.parse(msg.payload);
            } catch (error) {
                return E.left(new Error('Invalid JSON payload'));
            }

            switch (topicInfo.type) {
            case 'device':
                return decodePayload(IHello, { ...payload, type: 'hello', sourceId: topicInfo.id });
            case 'command':
                return decodePayload(ICommand, { ...payload, type: 'command', targetId: topicInfo.id });
            case 'event':
                return decodePayload(IEvent, { ...payload, type: 'event', sourceId: topicInfo.id });
            default:
                return E.left(new Error(`Unknown message type: ${topicInfo.type}`));
            }
        }),
    );
}

export class Client<Connection extends IConnection> extends TypedEventEmitter<ClientEventCallbacks> implements IClient {
    private connection: Connection;

    private static getDeviceTopic(deviceId: string) { return `tet/devices/${deviceId}`; }
    private static getCommandTopic(deviceId: string) { return `${this.getDeviceTopic(deviceId)}/commands`; }
    private static getEventTopic(deviceId: string) { return `${this.getDeviceTopic(deviceId)}/events`; }

    private onMessage(msg: IRawMessage) {
        logger.debug(`Received message: ${msg.topic}: ${msg.payload}`);
        this.emit('rawMessage', msg);

        const parsed = parseMessage(msg);

        if (E.isLeft(parsed)) {
            logger.error(parsed.left);
            return;
        }

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
    }

    public constructor(connection: Connection) {
        super();
        this.connection = connection;

        this.connection.on('connect', () => { this.emit('connect'); });
        this.connection.on('disconnect', () => { this.emit('disconnect'); });
        this.connection.on('message', this.onMessage.bind(this));
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
        await this.connection.send(Client.getCommandTopic(targetId), JSON.stringify(msg));
    }

    async sendEvent(sourceId: string, event: string, data: unknown): Promise<void> {
        const msg = {
            event,
            data,
        };
        await this.connection.send(Client.getEventTopic(sourceId), JSON.stringify(msg));
    }

    async sendHello(sourceId: string, definitions: DeviceDefinitions): Promise<void> {
        const msg = {
            definitions,
        };
        await this.connection.send(Client.getDeviceTopic(sourceId), JSON.stringify(msg));
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
}
