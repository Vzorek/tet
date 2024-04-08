import { Runtime } from '../runtime/index.js';
// import { Logger } from '../log/index.js';
import { onMessageFromParent, postMessageToParent } from '../worker/index.js';
import { ServerMessage } from './ServerMessage.js';
import { Game } from '../game/index.js';
import { LogicError } from '../errors/index.js';
import * as E from 'fp-ts/lib/Either.js';
import * as GameTypes from '../game/Type.js';
import { createLogger } from '../log/index.js';

const logger = createLogger('WorkerScript');
await Runtime.init();
const runtime = new Runtime();

// const game = runtime.arena.sync(new Game());
const game = new Game();
const lockedDownGame = {
    defineDeviceClass: game.defineDeviceClass.bind(game),
    getDeviceClass: game.getDeviceClass.bind(game),
    getDevice: game.getDevice.bind(game),
    updateDeviceState: game.updateDeviceState.bind(game),
};

runtime.arena.expose({ console, game: lockedDownGame, Types: GameTypes });

onMessageFromParent(message => {
    const msg = message as ServerMessage;
    switch (msg.type) {
    case 'start':
        logger.debug('Received start message');
        break;
    case 'pause':
        logger.debug('Received pause message');
        break;
    case 'reset':
        logger.debug('Received reset message');
        break;
    case 'runScript':
        logger.debug('Received scriptExecution message');
        const res = runtime.evalCode(msg.script);
        if (E.isLeft(res)) {
            const error = new Error(res.left.message);

            // The returned error is a proxy, passing it directly to the parent will cause an error
            if (res.left.cause)
                error.cause = res.left.cause;
            if (res.left.stack)
                error.stack = res.left.stack;
            if (res.left.name)
                error.name = res.left.name;
            if (res.left.message)
                error.message = res.left.message;

            postMessageToParent(error);
        }
        break;
    case 'event':
        game.receiveEvent(msg.event);
        break;
    default:
        throw new LogicError('Unknown message type');
    }
});

postMessageToParent('ready');
logger.info('Worker script started');
