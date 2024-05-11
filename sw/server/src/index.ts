import { Client, createLogger, Server, delay, MQTTConnection, MockConnection } from '@tet/core';
import { deviceTypes } from '@tet/devices';

const logger = createLogger('WorkerScript');

logger.info(`Host: ${process.env.HOST}`);

logger.info('Starting application');

const connection = new MQTTConnection('ws://127.0.0.1:9001', {
    // username: 'tom',
    // password: 'defense-trout-gratitude-crispness2-galleria-rubbed-treadmill',
});

// const connection = new MockConnection();

logger.info('Application started');

const client = new Client(connection);

const server = new Server(client);
await server.init();

await delay(1000);

const tag = 'MockButton_v0.0.0#0.0.0';

// await client.sendCommand(Server.ServerId, 'uploadGameCode', `
// "use strict";
// try {
//     const state = Types.type({
//         led: Types.type({
//             r: Types.number,
//             g: Types.number,
//             b: Types.number,
//         }, 'Led'),
//     }, 'State');

//     const Test = game.defineDeviceClass(${tag}, state, {
//         buttonPressed: {
//         },
//     });
//     Test.on("buttonPressed", (source, data, state) => {
//         console.log("Button pressed", source, data, state);
//         game.updateDeviceState(${tag}, source, {
//             led: {
//                 r: 255,
//                 g: 0,
//                 b: 0,
//             },
//         });
//     });
//     const test = game.createDevice(${tag}, "test");

// } catch (e) {
//     console.log(e);
// }
// `);

// await delay(1000);

// await client.sendHello('test', deviceTypes['MockButton_v0.0.0#0.0.0'].definition);

// await delay(1000);

// await client.sendCommand(Server.ServerId, 'startGame', null);

// await delay(2000);

// await client.sendEvent('test', 'buttonPressed', null);
