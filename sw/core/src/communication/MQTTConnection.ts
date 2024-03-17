import { InvalidStateError } from '../errors/index.js';
import { TypedEventEmitter } from '../utils/TypedEventEmitter.js';
import { createLogger } from '../log/index.js';
import { ConnectionEventCallbacks, IConnection } from './interfaces/IConnection.js';
import MQTT from 'async-mqtt';

const logger = createLogger('MQTTConnection');

export class MQTTConnection extends TypedEventEmitter<ConnectionEventCallbacks> implements IConnection {
    private client: MQTT.AsyncClient | null = null;
    private host: string;

    constructor(host: string) {
        super();
        this.host = host;
    }

    async connect(): Promise<void> {
        if (this.client)
            throw new InvalidStateError('Already connected');

        logger.info('Connecting to MQTT broker');

        this.client = await MQTT.connectAsync(this.host);
        this.client.on('connect', () => {
            this.emit('connect');
            logger.info('Connected to MQTT broker');
        });

        this.client.on('message', (topic, payload) => {
            const payloadString = payload.toString('utf8');
            logger.debug(`Received message on topic ${topic}: ${payloadString}`);
            this.emit('message', {
                topic,
                payload: payloadString,
            });
        });

        this.client.on('close', () => {
            logger.info('Disconnected from MQTT broker');
            this.client = null;
            this.emit('disconnect');
        });
    }

    async disconnect(): Promise<void> {
        if (!this.client)
            throw new InvalidStateError('Not connected');

        logger.info('Disconnecting from MQTT broker');
        await this.client.end();
    }

    isConnected(): boolean {
        return !!this.client && this.client.connected;
    }

    async send(topic: string, payload: string): Promise<void> {
        if (!this.client)
            throw new InvalidStateError('Not connected');

        logger.debug(`Sending message to topic ${topic}: ${payload}`);
        await this.client.publish(topic, payload);
    }

    async subscribe(topic: string): Promise<void> {
        if (!this.client)
            throw new InvalidStateError('Not connected');

        logger.debug(`Subscribing to topic ${topic}`);
        await this.client.subscribe(topic);
    }
};
