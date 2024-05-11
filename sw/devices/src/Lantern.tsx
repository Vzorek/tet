import React, { useState } from 'react';
import * as t from 'io-ts';
import { Renderer, makeDeviceType } from './typeUtils.js';

import { Rgb } from './common.js';
import { TypeOfMap, fixedSizeArray, integerInRange } from '@tet/core';
import { isLeft } from 'fp-ts/lib/Either.js';

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
    doors: [true, true, true, true],
    top: defaultTop,
    side: defaultSide,
};

type DoorProps = {
    open: boolean,
    onClick: (index: number) => void,
    index: 0 | 1 | 2 | 3,
};

const Door = ({ open, onClick, index }: DoorProps) => {
    const [isClicked, setIsClicked] = React.useState(false);

    const handleClick = () => {
        onClick(index);
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 100);
    };

    const actOpen = open && !isClicked;

    const openWidth = 5;
    const closedWidth = 2;
    const closedOffset = openWidth - closedWidth;

    const thickness = actOpen ? openWidth : closedWidth;
    const fill = actOpen ? 'gray' : 'darkgray';

    const values = [
        { x: 5, y: actOpen ? 0 : closedOffset, width: 90, height: thickness },
        { x: 95, y: 5, width: thickness, height: 90 },
        { x: 5, y: 95, width: 90, height: thickness },
        { x: actOpen ? 0 : closedOffset, y: 5, width: thickness, height: 90 },
    ];

    return (
        <rect
            fill={fill}
            onClick={handleClick}
            style={{
                cursor: open ? 'pointer' : 'not-allowed',
                transition: 'fill 0.1s',
            }}
            {...values[index]}
        />
    );
};

export const render: Renderer<State, TypeOfMap<Events>> = (state, onEvent) => {
    const [topButtonClicked, setTopButtonClicked] = useState(false); // eslint-disable-line react-hooks/rules-of-hooks

    if (isLeft(stateCodec.decode(state)))
        return (<text>Invalid state: {JSON.stringify(state)}</text>);

    const handleTopButtonClick = () => {
        onEvent('topButtonPressed', null);
        setTopButtonClicked(true);
        setTimeout(() => setTopButtonClicked(false), 100); // Reset animation after 300ms
    };

    return (
        <svg width='100%' height='100%' viewBox='0 0 100 100'>
            <g>

                {/* Background */}
                <rect x='6' y='6' width='88' height='88' fill='black' />

                {/* Doors */}

                {state.doors.map((open, i) => (
                    <Door key={i} open={open} onClick={(index: number) => onEvent('doorPressed', { number: index })} index={i as 0 | 1 | 2 | 3} />
                ))}

                {/* Side LEDs */}

                {state.side.map((color, i) => {
                    const radius = 40;
                    const angle = i * 360 / state.side.length;
                    const x = 50 + radius * Math.cos(angle * Math.PI / 180);
                    const y = 50 + radius * Math.sin(angle * Math.PI / 180);
                    return (
                        <circle key={i} cx={x} cy={y} r='2' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                    );
                })}

                {/* Top LEDs */}
                {state.top.map((color, i) => {
                    const radius = 35;
                    const angle = i * 360 / state.top.length;
                    const x = 50 + radius * Math.cos(angle * Math.PI / 180);
                    const y = 50 + radius * Math.sin(angle * Math.PI / 180);
                    return (
                        <circle key={i} cx={x} cy={y} r='1.5' fill={`rgb(${color.r}, ${color.g}, ${color.b})`} />
                    );
                })}

                {/* Top touchpad */}

                <circle
                    cx='50'
                    cy='50'
                    r='30'
                    fill={topButtonClicked ? 'darkgrey' : 'gray'}
                    onClick={handleTopButtonClick}
                    style={{
                        cursor: 'pointer',
                        transition: 'fill 0.1s',
                    }}
                />

            </g>
        </svg>
    );
};

export const Lantern = makeDeviceType('Lantern_v1.0.0#0.0.0', stateCodec, initialState, events, render);

export default Lantern;
