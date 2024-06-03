import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { ConnectionEventCallbacks, IConnection } from './interfaces/IConnection.js';
import { createLogger } from '../log/index.js';
import { InvalidStateError } from '../errors/index.js';

const logger = createLogger('MockConnection');

function isTopicMatch(subscriptions: string[], topic: string): boolean {
    const escapeRegExp = (text: string) =>
        text.replace('#', '.*')
            .replace('+', '[^/]+')
            .replace('/', '\/');

    return subscriptions.some(subTopic => {
        const regex = new RegExp('^' + escapeRegExp(subTopic) + '$');
        return regex.test(topic);
    });
}

export class MockConnection extends TypedEventEmitter<ConnectionEventCallbacks> implements IConnection {
    private connected: boolean = false;
    private subscriptions: string[] = [];
    private cache: Map<string, string> = new Map();

    constructor() {
        super();
    }

    async connect(): Promise<void> {
        if (this.connected)
            throw new InvalidStateError('Already connected');
        logger.info('Connecting to mock connection');
        const promise = new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
        await promise;
        this.connected = true;
        this.emit('connect');
    }

    async disconnect(): Promise<void> {
        if (!this.connected)
            throw new InvalidStateError('Not connected');
        logger.info('Disconnecting from mock connection');
        const promise = new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
        await promise;
        this.connected = false;
        this.emit('disconnect');
    }

    isConnected(): boolean {
        return this.connected;
    }

    async send(topic: string, payload: string, retain: boolean = false): Promise<void> {
        retain;
        if (!this.connected)
            throw new InvalidStateError('Not connected');
        logger.debug(`Sending message to topic ${topic}: ${payload}`);
        this.cache.set(topic, payload);
        this.receive(topic, payload);
    }

    async subscribe(topic: string): Promise<void> {
        if (!this.connected)
            throw new InvalidStateError('Not connected');
        logger.debug(`Subscribing to topic ${topic}`);
        this.subscriptions.push(topic);
    }

    /**
     * Function to imitate receiving a message from the broker
     * @param topic
     * @param payload
     */
    receive(topic: string, payload: string): void {
        if (!this.connected)
            throw new InvalidStateError('Not connected');
        if (!isTopicMatch(this.subscriptions, topic)) {
            logger.verbose(`Received message from topic ${topic} but not subscribed to it`);
            return;
        }
        logger.debug(`Received message from topic ${topic}: ${payload}`);
        this.emit('message', {
            topic,
            payload,
        });
    }
};
