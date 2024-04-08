import * as t from 'io-ts';

export const Rgb = t.type({
    r: t.number,
    g: t.number,
    b: t.number,
});

export type Rgb = t.TypeOf<typeof Rgb>;
