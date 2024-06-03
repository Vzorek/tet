import { createLogger } from '../log/index.js';
import { Client, DeviceDefinition, deviceDefinition, type Command, type Event, type Hello } from '../communication/index.js';
import { LogicError } from '../errors/index.js';
import { IWorker, createWorker } from '../worker/index.js';
import * as SM from './ServerMessage.js';
import { workerMessage } from './WorkerMessage.js';
import { isLeft } from 'fp-ts/lib/Either.js';
import reporter, { formatValidationErrors } from 'io-ts-reporters';
import * as t from 'io-ts';

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

function makeCommand<T extends string, C extends t.Mixed>(command: T, dataCodec: C) {
    return t.type({
        type: t.literal('command'),
        targetId: t.literal(Server.ServerId),
        command: t.literal(command),
        data: dataCodec,
    });
}

// type StartGame = t.TypeOf<typeof startGame>;
// type PauseGame = t.TypeOf<typeof pauseGame>;
// type ResetGame = t.TypeOf<typeof resetGame>;
// type UploadGameCode = t.TypeOf<typeof uploadGameCode>;
// type DumpGame = t.TypeOf<typeof dumpGame>;
// type LoadGame = t.TypeOf<typeof loadGame>;

// type ServerCommand = t.TypeOf<typeof serverCommand>;

type State = 'uninitialized' | 'connecting' | 'connected' | 'running' | 'paused';

const gameDump = t.type({
    gameData: SM.gameData,
    devices: t.record(t.string, deviceDefinition),
    gameCode: t.string,
});

type GameDump = t.TypeOf<typeof gameDump>;

export class Server {
    static readonly ServerId = '__server__';
    private _client: Client;
    private _state: State = 'uninitialized';

    private _devices: Map<string, DeviceDefinition> = new Map();

    private _gameCode: string | null = null;
    private _worker: IWorker | null = null;

    private _workerReadyResolve: (() => void) | null = null;
    private _workerReadyReject: ((error: Error) => void) | null = null;

    get paused(): boolean { return this._state === 'paused'; }
    get running(): boolean { return this._state === 'running'; }
    get gameInProgress(): boolean { return this.running || this.paused; }
    get connected(): boolean { return this._state !== 'uninitialized' && this._state !== 'connecting'; }

    constructor(client: Client) {
        this._client = client;
    }

    async init(workerScriptURL: string = './core/dist/src/server/workerScript.js'): Promise<void> {
        logger.info('Initializing server');
        if (this._state !== 'uninitialized')
            throw new LogicError('Server already initialized');

        this.registerEventHandlers();

        logger.debug('Connecting to broker');
        await this._client.connect();
        this._state = 'connected';

        await this._client.subscribeToDevices();
        await this._client.subscribeToCommands(Server.ServerId);

        logger.verbose('Creating worker');

        const readyPromise = new Promise<void>((resolve, reject) => {
            this._workerReadyResolve = resolve;
            this._workerReadyReject = reject;
        });

        this._worker = await createWorker(workerScriptURL);
        this._worker.onMessage(msg => this.handleWorkerMessage(msg));
        this._worker.onError(err => this.reportError(err));

        logger.debug('Worker created');

        await readyPromise;

        this._workerReadyReject = null;
        this._workerReadyResolve = null;
    }

    private handleWorkerMessage(msg: unknown): void {
        const _decoded = workerMessage.decode(msg);
        if (isLeft(_decoded)) {
            reporter.report(_decoded);
            return;
        }

        const decoded = _decoded.right;

        switch (decoded.type) {
        case 'error':
            if (this._workerReadyReject)
                this._workerReadyReject(decoded.error);

            this.reportError(decoded.error);
            break;

        case 'updateDeviceState':
            this._client.sendCommand(decoded.id, 'stateChange', decoded.state);
            break;

        case 'ready':
            if (this._workerReadyResolve)
                this._workerReadyResolve();
            logger.info('Worker ready');
            break;

        case 'dump':
            this._client.sendEvent(Server.ServerId, 'gameDump', this.wrapGameDump(decoded.data));
            break;
        }
    }

    async deinit(): Promise<void> {
        logger.info('Deinitializing server');

        switch (this._state) {

        case 'paused':
        case 'running':
            logger.debug('Resetting game');
            this.resetGame();

        case 'connected':
        case 'connecting':
            logger.debug('Disposing of worker');
            await this._worker?.asyncDispose();
            logger.debug('Disconnecting from broker');
            await this._client.disconnect();
            break;

        case 'uninitialized':
            throw new LogicError('Server not initialized');
        }
    }

    startGame(): void {
        if (!this.connected)
            throw new LogicError('Server not connected');

        this._worker?.postMessage({
            type: 'start',
            data: this._gameCode,
        });

        this._state = 'running';
    }

    pauseGame(): void {
        if (!this.running)
            throw new LogicError('Server not running');

        this._state = 'paused';
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
            if (this._state === 'connecting')
                this._state = 'connected';
        });

        this._client.on('disconnect', () => {
            logger.info('Disconnected');
            // throw new NotImplementedError('Handling disconnect');
        });

        this._client.on('hello', msg => this.handleHello(msg));
        this._client.on('command', msg => this.handleCommand(msg));
        this._client.on('event', msg => this.handleEvent(msg));
    }

    private handleCommand(msg: Command): void {
        if (msg.targetId !== Server.ServerId)
            return; // Ignore commands not meant for this server
        logger.debug(`Received command: ${msg}`);
        const decoded = serverCommand.decode(msg);
        if (isLeft(decoded)) {
            const error = new LogicError(formatValidationErrors(decoded.left).join('\n'));
            this.reportError(error);
            return;
        }

        const _msg = decoded.right;

        try {
            switch (_msg.command) {
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
                this.uploadGameCode(_msg.data);
                break;

            case 'dumpGame':
                this.requestGameDump();
                break;

            case 'loadGame':
                this.loadGame(_msg.data);
                break;

            }
        } catch (error) {
            this.reportError(error as Error);
        }

    }

    private requestGameDump() {
        this._worker?.postMessage({
            type: 'dump',
        });
    }

    private wrapGameDump(gameData: SM.GameData): GameDump {
        return {
            gameData,
            devices: Object.fromEntries(this._devices.entries()),
            gameCode: this._gameCode ?? '',
        };
    }

    private loadGame(data: GameDump) {

        this.uploadGameCode(data.gameCode);

        Object.entries(data.devices).forEach(([id, definition]) => {
            this._client.sendHello(id, definition);
        });

        this._worker?.postMessage({
            type: 'load',
            data: data.gameData,
        });
    }

    uploadGameCode(code: string) {
        logger.debug('Uploading game code');
        this._gameCode = code;
        this._worker?.postMessage({ type: 'runScript', script: code });
    }

    private handleEvent(msg: Event): void {
        if (msg.sourceId === Server.ServerId)
            return; // Ignore events from self
        console.log('Received event:', msg);
        logger.debug(`Received event: ${msg}`);
        if (!this.running) {
            logger.debug('Ignoring event, game not running');
            return; // Ignore events when not running
        }

        // Only handle events from known devices
        const device = this._devices.get(msg.sourceId);
        if (!device)
            throw new LogicError(`Received event from unknown device: ${msg.sourceId}`);

        logger.debug(`Received event from device: ${device.typeTag}`);

        // Only handle known events
        const def = device.events[msg.event];
        if (!def)
            throw new LogicError(`Received unknown event: ${msg.event}`);

        // Pass event to game runtime
        this._worker?.postMessage({
            type: 'event',
            source: {
                id: msg.sourceId,
                tag: device.typeTag,
            },
            event: msg,
        } as SM.GameEvent);
    }

    /**
     * Upon receiving a hello message, the server registers the device and subscribes to its events.
     */
    private handleHello(msg: Hello): void {
        logger.debug(`Received hello: ${msg}`);
        this.addDevice(msg.sourceId, msg.definitions);
    }

    private addDevice(id: string, definition: DeviceDefinition): void {
        this._devices.set(id, definition);
        this._client.subscribeToEvents(id);

        // this._worker?.postMessage({
        //     type: 'addDevice',
        //     device: msg.sourceId,
        //     definition: msg.definitions,
        // } as SM.AddDevice);
    }

    reportError(error: Error): void {
        if (Object.keys(error).length === 0)
            error = new Error('Unknown error');
        logger.error(error);
        this._client.sendEvent(Server.ServerId, 'error', error);
    }

    async asyncDispose(): Promise<void> {
        try {
            await this.deinit();
        } catch (error) {
        }
    }

    [Symbol.asyncDispose](): Promise<void> {
        return this.asyncDispose();
    }
}

const startGame = makeCommand('startGame', t.null);
const pauseGame = makeCommand('pauseGame', t.null);
const resetGame = makeCommand('resetGame', t.null);
const uploadGameCode = makeCommand('uploadGameCode', t.string);
const dumpGame = makeCommand('dumpGame', t.null);
const loadGame = makeCommand('loadGame', gameDump);

const serverCommand = t.union([startGame, pauseGame, resetGame, uploadGameCode, dumpGame, loadGame]);
