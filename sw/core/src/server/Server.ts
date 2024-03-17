import { createLogger } from '../log/index.js';
import { Client, DeviceDefinitions, ICommand, IConnection, IEvent, IHello } from '../communication/index.js';
import { LogicError, NotImplementedError } from '../errors/index.js';
import { IWorker, createWorker } from '../worker/index.js';
import * as SM from './ServerMessage.js';

const logger = createLogger('Server');

// Server device definitions:
// - Commands:
//     1. startGame
//     2. pauseGame
//     3. resetGame
//     4. uploadGameCode
// - Events:
// - State: {
//     running: boolean,
//     time: number,
// }

interface StartGame extends ICommand {
    command: 'startGame',
    data: null,
};

interface PauseGame extends ICommand {
    command: 'pauseGame',
    data: null,
};

interface ResetGame extends ICommand {
    command: 'resetGame',
    data: null,
};

interface UploadGameCode extends ICommand {
    command: 'uploadGameCode',
    data: string,
};

type ServerCommand = StartGame | PauseGame | ResetGame | UploadGameCode;

function isServerCommand(command: ICommand): command is ServerCommand {
    return command.targetId === Server.ServerId;
}

enum State {
    Unititialized = 'unititialized',
    Connecting = 'connecting',
    Connected = 'connected',
    GameRunning = 'running',
    GamePaused = 'paused',
}

export class Server<Connection extends IConnection> {
    static readonly ServerId = '__server__';
    private _client: Client<Connection>;
    private _state: State = State.Unititialized;

    private _devices: Map<string, DeviceDefinitions> = new Map();

    private _gameCode: string | null = null;
    private _worker: IWorker | null = null;

    get paused(): boolean { return this._state === State.GamePaused; }
    get running(): boolean { return this._state === State.GameRunning; }
    get gameInProgress(): boolean { return this.running || this.paused; }
    get connected(): boolean { return this._state !== State.Unititialized && this._state !== State.Connecting; }

    constructor(client: Client<Connection>) {
        this._client = client;
    }

    async init(): Promise<void> {
        logger.info('Initializing server');
        if (this._state !== State.Unititialized)
            throw new LogicError('Server already initialized');

        this.registerEventHandlers();

        logger.debug('Connecting to broker');
        await this._client.connect();
        this._state = State.Connected;

        await this._client.subscribeToDevices();
        await this._client.subscribeToCommands(Server.ServerId);

        logger.verbose('Creating worker');
        this._worker = await createWorker('./core/dist/src/server/workerScript.js');
        this._worker.onMessage(msg => this.handleWorkerMessage(msg));
        this._worker.onError(err => this.reportError(err));

        logger.debug('Worker created');
    }

    private handleWorkerMessage(msg: unknown): void {
        if (msg instanceof Error)
            this.reportError(msg);
        else
            console.log('Received message from worker:', msg);
    }

    async deinit(): Promise<void> {
        logger.info('Deinitializing server');

        switch (this._state) {

        case State.GamePaused:
        case State.GameRunning:
            logger.debug('Resetting game');
            this.resetGame();

        case State.Connected:
        case State.Connecting:
            logger.debug('Disposing of worker');
            await this._worker?.asyncDispose();
            logger.debug('Disconnecting from broker');
            await this._client.disconnect();
            break;

        case State.Unititialized:
            throw new LogicError('Server not initialized');
        }
    }

    startGame(): void {
        if (!this.connected)
            throw new LogicError('Server not connected');

        if (this._gameCode === null)
            throw new LogicError('No game code uploaded');

        this._worker?.postMessage({
            type: 'start',
            data: this._gameCode,
        });

        this._state = State.GameRunning;
    }

    pauseGame(): void {
        if (!this.running)
            throw new LogicError('Server not running');

        this._state = State.GamePaused;
        this._worker?.postMessage({
            type: 'pause',
        });
    }

    resetGame(): void {
        if (!this.gameInProgress)
            throw new LogicError('Game not in progress');

        this._worker?.postMessage({
            type: 'reset',
        });
    }

    private registerEventHandlers(): void {
        logger.debug('Registering event handlers');
        this._client.on('connect', () => {
            logger.info('Connected');
            if (this._state === State.Connecting)
                this._state = State.Connected;
        });

        this._client.on('disconnect', () => {
            logger.info('Disconnected');
            throw new NotImplementedError('Handling disconnect');
        });

        this._client.on('hello', msg => this.handleHello(msg));
        this._client.on('command', msg => this.handleCommand(msg));
        this._client.on('event', msg => this.handleEvent(msg));
    }

    private handleCommand(msg: ICommand): void {
        logger.debug(`Received command: ${msg}`);
        if (!isServerCommand(msg))
            throw new LogicError(`Received command for unknown target: ${msg.targetId}`);

        switch (msg.command) {
        case 'startGame':
            this.startGame();
            break;

        case 'pauseGame':
            this.pauseGame();
            break;

        case 'resetGame':
            this.resetGame();
            break;

        case 'uploadGameCode':
            this.uploadGameCode(msg.data);
            break;
        }
    }

    uploadGameCode(code: string) {
        this._gameCode = code;
        this._worker?.postMessage({ type: 'runScript', script: code });
    }

    private handleEvent(msg: IEvent): void {
        logger.debug(`Received event: ${msg}`);
        if (!this.running)
            return; // Ignore events when not running

        // Only handle events from known devices
        const device = this._devices.get(msg.sourceId);
        if (!device)
            throw new LogicError(`Received event from unknown device: ${msg.sourceId}`);

        // Only handle known events
        const def = device.events.find(e => e.event === msg.event);
        if (!def)
            throw new LogicError(`Received unknown event: ${msg.event}`);

        // Pass event to game runtime
        this._worker?.postMessage({
            type: 'event',
            event: msg,
        } as SM.GameEvent);
    }

    /**
     * Upon receiving a hello message, the server registers the device and subscribes to its events.
     */
    private handleHello(msg: IHello): void {
        logger.debug(`Received hello: ${msg}`);
        this._devices.set(msg.sourceId, msg.definitions);
        this._client.subscribeToEvents(msg.sourceId);
    }

    reportError(error: Error): void {
        logger.error(error);
        this._client.sendEvent(Server.ServerId, 'error', error);
    }
}
