import { Command } from 'commander';
import { Client, createLogger, Server, delay, MQTTConnection, MockConnection, type IClientOptions } from '@tet/core';

const program = new Command();

program
    .option('--host <type>', 'MQTT host', 'ws://127.0.0.1:9001')
    .option('--mock', 'Use MockConnection instead of MQTTConnection', false)
    .option('--username <type>', 'Username for MQTT connection')
    .option('--password <type>', 'Password for MQTT connection')
    .parse(process.argv);

const options = program.opts();

const logger = createLogger('WorkerScript');

logger.info(`Host: ${options.host}`);
logger.info('Starting application');

let connection;
if (options.mock) {
    connection = new MockConnection();
} else {
    const connectionOptions: IClientOptions = {};
    if (options.username) connectionOptions.username = options.username;
    if (options.password) connectionOptions.password = options.password;
    connection = new MQTTConnection(options.host, connectionOptions);
}

logger.info('Application started');

const client = new Client(connection);

const server = new Server(client);
await server.init();

await delay(1000);

logger.info('Server initialized');
