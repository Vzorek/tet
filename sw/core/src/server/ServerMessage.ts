import { IEvent } from '../communication/index.js';

export type Start = {
    type: 'start',
};

export type Pause = {
    type: 'pause',
};

export type Reset = {
    type: 'reset',
};

export type RunScript = {
    type: 'runScript',
    script: string,
};

export type GameEvent = {
    type: 'event',
    event: IEvent,
};

export type ServerMessage = Start | Pause | Reset | RunScript | GameEvent;

export function isStart(msg: ServerMessage): msg is Start { return msg.type === 'start'; }
export function isPause(msg: ServerMessage): msg is Pause { return msg.type === 'pause'; }
export function isReset(msg: ServerMessage): msg is Reset { return msg.type === 'reset'; }
export function isRunScript(msg: ServerMessage): msg is RunScript { return msg.type === 'runScript'; }
export function isGameEvent(msg: ServerMessage): msg is GameEvent { return msg.type === 'event'; }
