import React, { useState } from 'react';

import * as t from 'io-ts';
import { makeDeviceType, Renderer } from './typeUtils.js';

import { Rgb } from './common.js';
import { TypeOfMap, fixedSizeArray } from '@tet/core';
import { isLeft } from 'fp-ts/lib/Either.js';

export const stateCodec = t.type({
    leds: fixedSizeArray(Rgb, 12),
});

export type State = t.TypeOf<typeof stateCodec>;

const events = {
    buttonPressed: t.union([t.literal('A'), t.literal('B'), t.literal('AB')]),
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
    const [leftButtonClicked, setLeftButtonClicked] = useState(false); // eslint-disable-line react-hooks/rules-of-hooks
    const [rightButtonClicked, setRightButtonClicked] = useState(false); // eslint-disable-line react-hooks/rules-of-hooks

    if (isLeft(stateCodec.decode(state)))
        return (<text>Invalid state: {JSON.stringify(state)}</text>);

    const centerOffsetX = 50;
    const centerOffsetY = 40;
    const radius = 37.5;

    const btnBgX = centerOffsetX - (radius * 0.75);
    const btnBgW = radius * 1.5;

    const btnMarginH = radius / 5;
    const btnMarginV = radius / 10;

    const btnW = (btnBgW - 3 * btnMarginH) / 2;
    const btnH = btnW;

    const handleLeftButtonClick = () => {
        onEvent('buttonPressed', 'A');
        setLeftButtonClicked(true);
        setTimeout(() => setLeftButtonClicked(false), 100); // Reset animation after 300ms
    };

    const handleRightButtonClick = () => {
        onEvent('buttonPressed', 'B');
        setRightButtonClicked(true);
        setTimeout(() => setRightButtonClicked(false), 100); // Reset animation after 300ms
    };

    return (
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
            <g>
                {/* Background */}
                <circle cx={centerOffsetX} cy={centerOffsetY} r={radius} fill='black' />
                <rect
                    x={btnBgX}
                    y={centerOffsetY}
                    width={btnBgW}
                    height={radius + btnH + btnMarginV}
                    fill='black'
                    rx='5'
                />

                {/* LEDs */}
                {state.leds.map((color, i) => {
                    const angle = i * 30;
                    const x = centerOffsetX + (radius - 6) * Math.cos(angle * Math.PI / 180);
                    const y = centerOffsetY + (radius - 6) * Math.sin(angle * Math.PI / 180);
                    return (
                        <circle key={i} cx={x} cy={y} r='4' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                    );
                })}

                {/* Buttons */}
                <rect
                    x={btnBgX + btnMarginH}
                    y={centerOffsetY + radius}
                    width={btnW}
                    height={btnH}
                    fill={leftButtonClicked ? 'darkgrey' : 'gray'}
                    onClick={handleLeftButtonClick}
                    rx='2'
                    style={{
                        cursor: 'pointer',
                        transition: 'fill 0.1s',
                    }}
                />
                <rect
                    x={btnBgX + 2 * btnMarginH + btnW}
                    y={centerOffsetY + radius}
                    width={btnW}
                    height={btnH}
                    fill={rightButtonClicked ? 'darkgrey' : 'gray'}
                    onClick={handleRightButtonClick}
                    rx='2'
                    style={{
                        cursor: 'pointer',
                        transition: 'fill 0.1s',
                    }}
                />
            </g>
        </svg>
    );
};

export const Semaphore = makeDeviceType('Semaphore_v2.0.0#0.0.0', stateCodec, initialState, events, render);

export default Semaphore;
