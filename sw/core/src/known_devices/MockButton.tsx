import * as t from 'io-ts';
import { EventHandler, makeDeviceType } from './typeUtils';

import { Rgb } from '../../../devices/src/common';
import React from 'react';
import { isLeft } from 'fp-ts/lib/Either';
import { TypeOfMap } from '@tet/core';

export const stateCodec = t.type({
    led: Rgb,
});

export type State = t.TypeOf<typeof stateCodec>;

export const events: Record<string, t.Mixed> = {
    buttonPressed: t.null,
};

export const initialState: State = {
    led: { r: 0, g: 0, b: 0 },
};

export type Events = TypeOfMap<typeof events>;

// One led with a button bellow it
export const render = (state: State, onEvent: EventHandler<Events>) => {
    if (isLeft(stateCodec.decode(state)))
        return (<text>Invalid state: {JSON.stringify(state)}</text>);
    return (
        <svg viewBox='0 0 100 100'>
            <circle cx='50' cy='50' r='40' fill='black' />
            <circle cx='50' cy='50' r='30' fill={`rgb(${state.led.r}, ${state.led.g}, ${state.led.b})`} />
            <rect x='40' y='40' width='20' height='20' fill='red' onClick={() => { onEvent('buttonPressed', null); }} cursor='pointer' />
        </svg>
    );
};

export const MockButton = makeDeviceType('MockButton_v0.0.0', '0.0.0', stateCodec, initialState, events, render);

export default MockButton;
