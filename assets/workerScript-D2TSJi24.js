import { Runtime } from '../runtime/index.js';
// import { Logger } from '../log/index.js';
import { onMessageFromParent, postMessageToParent as _postMessageToParent } from '../worker/index.js';
import { Game } from '../game/index.js';
import { LogicError } from '../errors/index.js';
import * as E from 'fp-ts/lib/Either.js';
import * as t from 'io-ts';
import * as tUtils from '../utils/io-tsUtils.js';
import { createLogger } from '../log/index.js';
const postMessageToParent = (msg) => _postMessageToParent(msg);
const logger = createLogger('WorkerScript');
await Runtime.init();
const runtime = new Runtime();
// const game = runtime.arena.sync(new Game());
const game = new Game();
const lockedDownGame = {
    defineDeviceClass: game.defineDeviceClass.bind(game),
    getDeviceClass: game.getDeviceClass.bind(game),
    getDevice: game.getDevice.bind(game),
    getDevicesByClass: game.getDevicesByClass.bind(game),
    updateDeviceState: game.updateDeviceState.bind(game),
    createDevice: game.createDevice.bind(game),
    linkDeviceType: game.linkDeviceType.bind(game),
};
game.on('deviceStateChange', data => {
    postMessageToParent({
        type: 'updateDeviceState',
        id: data.id,
        state: data.state,
    });
});
runtime.arena.expose({ console, game: lockedDownGame, Types: { ...t, ...tUtils } });
onMessageFromParent(message => {
    try {
        const msg = message;
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
                    if (Object.keys(res.left).length == 0)
                        error.message = 'Unknown error';
                    postMessageToParent({
                        type: 'error',
                        error,
                    });
                }
                break;
            case 'event':
                game.receiveEvent(msg);
                break;
            case 'addDevice':
                game.addDevice(msg.definition.typeTag, msg.id);
                break;
            default:
                throw new LogicError(`Unknown message type: ${msg.type}`); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    }
    catch (e) {
        logger.error('Error processing message', e);
        postMessageToParent({
            type: 'error',
            error: e,
        });
    }
});
postMessageToParent({ type: 'ready' });
logger.info('Worker script started');
//# sourceMappingURL=workerScript.js.map