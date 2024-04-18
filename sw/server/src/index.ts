import { Client, createLogger, Server, delay, MQTTConnection, MockConnection } from '@tet/core';

const logger = createLogger('WorkerScript');

logger.info(`Host: ${process.env.HOST}`);

logger.info('Starting application');

// const connection = new MQTTConnection('wss://mqtt.gwenlian.eu:8083', {
//     username: 'tom',
//     password: 'defense-trout-gratitude-crispness2-galleria-rubbed-treadmill',
// });

const connection = new MockConnection();

logger.info('Application started');

const client = new Client(connection);

const server = new Server(client);
await server.init();

await delay(1000);

await client.sendCommand(Server.ServerId, 'uploadGameCode', `
"use strict";
// console.log("Empty:", game);
// console.log(GameTypes.number('test'));
const Test = game.defineDeviceClass("test", {}, {
    test_event: {
    },
});
// console.log("Device class defined: ", Test);
Test.on("test_event", (source, data) => {
    console.log("Event received: ", source, data);
});;
const test = new Test("test", {});
// console.log("Device created: ", game);
// console.log("getDeviceClass: ", game.getDeviceClass("test"));
// console.log("getDevice: ", game.getDevice("id"));
`);

await client.sendCommand(Server.ServerId, 'startGame', null);

await delay(1000);

await client.sendHello('test', {
    initialState: null,
    typeTag: 'test_v0.0.0#0.0.0',
    commands: {
        updateState: { type: 'null' },
        shutdown: { type: 'null' },
    },
    events: {
        test_event: { type: 'null' },
    },
});

await delay(1000);

await client.sendEvent('test', 'test_event', null);
