import React from 'react';
import * as t from 'io-ts';
import { makeDeviceType } from './typeUtils';

import { Rgb } from './common';
import { TypeOfMap, fixedSizeArray, integerInRange } from '@tet/core';

export const stateCodec = t.type({
    doors: fixedSizeArray(t.boolean, 4),
    top: fixedSizeArray(Rgb, 60),
    side: fixedSizeArray(Rgb, 54),
});

export type State = t.TypeOf<typeof stateCodec>;

export const events: Record<string, t.Mixed> = {
    topButtonPressed: t.null,
    doorPressed: t.type({
        number: integerInRange(0, 3),
    }),
};

export type Events = TypeOfMap<typeof events>;

const defaultTop = (new Array<Rgb>(60)).fill({ r: 255, g: 0, b: 0 });
const defaultSide = (new Array<Rgb>(54)).fill({ r: 0, g: 255, b: 0 });

if (!stateCodec.props.top.is(defaultTop))
    throw new Error('Invalid default top');

if (!stateCodec.props.side.is(defaultSide))
    throw new Error('Invalid default side');

export const initialState: State = {
    doors: [false, false, false, false],
    top: defaultTop,
    side: defaultSide,
};

export const render = (state: State) => {
    return (
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
            <g>
                <rect x='0' y='0' width='100' height='100' fill='black' />
                {state.doors.map((door, i) => (
                    <rect key={i} x={i * 25} y='0' width='25' height='100' fill={door ? 'green' : 'red'} />
                ))}
                {state.top.map((color, i) => (
                    <rect key={i} x={i * 1.6666} y='0' width='1.6666' height='100' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                ))}
                {state.side.map((color, i) => (
                    <rect key={i} x='0' y={i * 1.8518} width='100' height='1.8518' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                ))}
            </g>
        </svg>
    );
};

export const Lantern = makeDeviceType('Lantern_v1.0.0#0.0.0', stateCodec, initialState, events, render);

export default Lantern;
