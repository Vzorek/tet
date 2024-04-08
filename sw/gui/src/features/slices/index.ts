import Client, { Action as ClientAction } from './client';
import Config, { Action as ConfigAction } from './config';
import Devices, { Action as DevicesAction } from './devices';
import Messages, { Action as MessagesAction } from './messages';

export type Action = ClientAction | ConfigAction | DevicesAction | MessagesAction;

export {
    Client,
    Config,
    Devices,
    Messages,
};
