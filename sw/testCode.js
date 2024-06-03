'use strict';

const tag = 'MockButton_v0.0.0#0.0.0';

const rgb = Types.type({
    r: Types.integerInRange(0, 255),
    g: Types.integerInRange(0, 255),
    b: Types.integerInRange(0, 255),
}, 'Rgb');

const state = Types.type({
    leds: Types.fixedSizeArray(rgb, 12),
}, 'State');

const Test = game.defineDeviceClass('testClass', state, {
    buttonPressed: {
    },
});
Test.on('buttonPressed', (source, data, state) => {
    console.log('Button pressed', source, data, state);
    console.log('state', state);
    const states = [
        {
            led: {
                r: 255,
                g: 0,
                b: 0,
            },
        },
        {
            led: {
                r: 0,
                g: 255,
                b: 0,
            },
        },
        {
            led: {
                r: 0,
                g: 0,
                b: 255,
            },
        },
    ];

    let newState;
    if (state.leds[0].r === 255) {
        newState = {
            leds: new Array(12).fill(states[1].led),
        }
    } else if (state.leds[0].g === 255) {
        newState = {
            leds: new Array(12).fill(states[2].led),
        }
    } else {
        newState = {
            leds: new Array(12).fill(states[0].led),
        }
    }


    game.updateDeviceState('testClass', source, newState);
});

game.linkDeviceType('testClass', 'Semaphore_v2.0.0#0.0.0');

