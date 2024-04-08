import { type RawMessage } from '../definitions.js';
import { TypedEventEmitter } from '../../utils/TypedEventEmitter.js';

export type ConnectionEventCallbacks = {

    /**
     * @brief The connection has been established
     */
    connect: () => void;

    /**
     * @brief The connection has been lost
     */
    disconnect: () => void;

    /**
     * @brief A raw message has been received
     */
    message: (msg: RawMessage) => void;
};

export interface IConnection extends TypedEventEmitter<ConnectionEventCallbacks> {

    /**
     * @brief Send a message to a topic
     *
     * @param topic - The topic to send the message to
     * @param payload - The message to send
     *
     * @async
     */
    send(topic: string, payload: string): Promise<void>;

    /**
     * @brief Connect to the broker
     * @async
     */
    connect(): Promise<void>;

    /**
     * @brief Disconnect from the broker
     * @async
     */
    disconnect(): Promise<void>;

    /**
     * @brief Check if the connection is active
     *
     * @return true if the connection is active, false otherwise
     *
     * @async
     */
    isConnected(): boolean;

    /**
     * @brief Subscribe to a topic
     *
     * @param topic - The topic to subscribe to
     *
     * @async
     */
    subscribe(topic: string): Promise<void>;
}
