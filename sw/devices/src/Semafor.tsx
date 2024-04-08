import * as t from 'io-ts';
import { makeDeviceType, Renderer } from './typeUtils.js';

import { Rgb } from './common.js';
import React from 'react';
import { TypeOfMap, fixedSizeArray } from '@tet/core/src/utils/io-tsUtils';

export const stateCodec = t.type({
    leds: fixedSizeArray(Rgb, 12),
});

export type State = t.TypeOf<typeof stateCodec>;

const events: Record<string, t.Mixed> = {
    leftButtonPressed: t.null,
    rightButtonPressed: t.null,
};

type Events = typeof events;

const initialLeds = (new Array<Rgb>(12)).fill({ r: 255, g: 0, b: 0 });
if (!stateCodec.props.leds.is(initialLeds))
    throw new Error('Invalid default leds');

export const initialState: State = {
    leds: initialLeds,
};

// Circle of 12 LEDs with two buttons bellow them
export const render: Renderer<State, TypeOfMap<Events>> = (state, onEvent) => {
    return (
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
            <g>
                <circle cx='50' cy='50' r='40' fill='black' />
                {state.leds.map((color, i) => {
                    const angle = i * 30;
                    const x = 50 + 40 * Math.cos(angle * Math.PI / 180);
                    const y = 50 + 40 * Math.sin(angle * Math.PI / 180);
                    return (
                        <circle key={i} cx={x} cy={y} r='2' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                    );
                })}
                <rect x='40' y='80' width='20' height='10' fill='gray' onClick={() => { onEvent('leftButtonPressed', null ); }} />
                <rect x='40' y='90' width='20' height='10' fill='gray' onClick={() => { onEvent('rightButtonPressed', null ); }} />
            </g>
        </svg>
    );
};

export const Semaphore = makeDeviceType('Semaphore_v2.0.0#0.0.0', stateCodec, initialState, events, render);

export default Semaphore;
