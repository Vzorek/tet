import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either.js';

export const optional = <T extends t.Mixed>(type: T) => t.union([type, t.undefined]);

export class IntegerType extends t.Type<number, number, unknown> {
    readonly _tag = 'IntegerType' as const;

    constructor(
        name: string,
        is: IntegerType['is'],
        validate: IntegerType['validate'],
        encode: IntegerType['encode'],
    ) {
        super(name, is, validate, encode);
    }
}

export interface IntegerC extends IntegerType { }

export function integer(name: string = 'Integer'): IntegerC {
    return new IntegerType(
        name,
        (u): u is number => typeof u === 'number' && Number.isInteger(u),
        (u, c) => {
            if (typeof u !== 'number' || !Number.isInteger(u))
                return t.failure(u, c);

            return t.success(u);
        },
        a => a,
    );
}

// Taken from https://stackoverflow.com/a/60762482/15552613
type Shift<A extends Array<any>> = // eslint-disable-line @typescript-eslint/no-explicit-any
    ((...args: A) => void) extends ((...args: [A[0], ...infer R]) => void) ? R : never;

type GrowExpRev<A extends any[], N extends number, P extends any[][]> = // eslint-disable-line @typescript-eslint/no-explicit-any
    A['length'] extends N ? A : [...A, ...P[0]][N] extends undefined ? GrowExpRev<[...A, ...P[0]], N, P> : GrowExpRev<A, N, Shift<P>>;

type GrowExp<A extends any[], N extends number, P extends any[][], L extends number = A['length']> = // eslint-disable-line @typescript-eslint/no-explicit-any
    L extends N ? A : L extends 8192 ? any[] : [...A, ...A][N] extends undefined ? GrowExp<[...A, ...A], N, [A, ...P]> : GrowExpRev<A, N, P>; // eslint-disable-line @typescript-eslint/no-explicit-any

type MapItemType<T, I> = { [K in keyof T]: I };
// End of used code

export type FixedSizeArray<T, N extends number> =
    N extends 0 ? [] : MapItemType<GrowExp<[0], N, []>, T>;

export class FixedSizeArrayType<
    C extends t.Any,
    N extends number,
    A = any, // eslint-disable-line @typescript-eslint/no-explicit-any
    O = A,
    I = unknown> extends
    t.Type<A, O, I> {
    readonly _tag = 'FixedSizeArrayType' as const;

    constructor(
        name: string,
        is: FixedSizeArrayType<C, N, A, O, I>['is'],
        validate: FixedSizeArrayType<C, N, A, O, I>['validate'],
        encode: FixedSizeArrayType<C, N, A, O, I>['encode'],
        readonly type: C,
        readonly size: N,
    ) {
        super(name, is, validate, encode);
    }
}

export interface FixedSizeArrayC<C extends t.Any, N extends number> extends FixedSizeArrayType<C, N, FixedSizeArray<t.TypeOf<C>, N>, FixedSizeArray<t.TypeOf<C>, N>, unknown> { }

export function fixedSizeArray<C extends t.Any, N extends number>(
    item: C,
    size: N,
    name: string = `FixedSizeArray<${item.name}, ${size}>`): FixedSizeArrayC<C, N> {
    return new FixedSizeArrayType<C, N>(
        name,
        (u): u is FixedSizeArray<t.TypeOf<C>, N> => {
            return t.UnknownArray.is(u) && u.length === size && u.every(item.is);
        },
        (u, c) => {
            let e = t.UnknownArray.validate(u, c);
            if (isLeft(e))
                return e;

            if (e.right.length !== size)
                return t.failure(u, c);

            const ArrayCodec = t.array(item);
            e = ArrayCodec.validate(e.right, c);
            if (isLeft(e))
                return e;

            return t.success(e.right as FixedSizeArray<t.TypeOf<C>, N>);
        },
        a => a.map(item.encode),
        item,
        size,
    );
}

export class NumberInRangeType extends t.Type<number, number, unknown> {
    readonly _tag = 'NumberInRangeType' as const;

    constructor(
        name: string,
        is: NumberInRangeType['is'],
        validate: NumberInRangeType['validate'],
        encode: NumberInRangeType['encode'],
        readonly min: number,
        readonly max: number,
    ) {
        super(name, is, validate, encode);
    }
}

export interface NumberInRangeC extends NumberInRangeType { }

export function numberInRange(min: number, max: number, name: string = `NumberInRange[${min}, ${max}]`): NumberInRangeC {
    return new NumberInRangeType(
        name,
        (u): u is number => typeof u === 'number' && u >= min && u <= max,
        (u, c) => {
            if (typeof u !== 'number')
                return t.failure(u, c);

            if (u < min || u > max)
                return t.failure(u, c);

            return t.success(u);
        },
        a => a,
        min,
        max,
    );
}

export class IntegerInRangeType extends t.Type<number, number, unknown> {
    readonly _tag = 'IntegerInRangeType' as const;

    constructor(
        name: string,
        is: IntegerInRangeType['is'],
        validate: IntegerInRangeType['validate'],
        encode: IntegerInRangeType['encode'],
        readonly min: number,
        readonly max: number,
    ) {
        super(name, is, validate, encode);
    }
}

export interface IntegerInRangeC extends IntegerInRangeType { }

export function integerInRange(min: number, max: number, name: string = `IntegerInRange[${min}, ${max}]`): IntegerInRangeC {
    return new IntegerInRangeType(
        name,
        (u): u is number => typeof u === 'number' && Number.isInteger(u) && u >= min && u <= max,
        (u, c) => {
            if (typeof u !== 'number' || !Number.isInteger(u))
                return t.failure(u, c);

            if (u < min || u > max)
                return t.failure(u, c);

            return t.success(u);
        },
        a => a,
        min,
        max,
    );
}

export type TypeOfMap<T extends Record<string, t.Mixed>> = {
    [K in keyof T]: t.TypeOf<T[K]>;
};

type SupportedCodec =
    t.StringType |
    t.LiteralType<string> |
    t.NumberType |
    NumberInRangeType |
    IntegerType |
    IntegerInRangeType |
    t.BooleanType |
    t.NullType |
    t.InterfaceType<t.AnyProps> |
    t.ArrayType<t.UnknownType> |
    FixedSizeArrayType<t.Any, number>;

type TaggedCodec = t.Mixed & { _tag: string };

function isTaggedCodec(codec: t.Mixed): codec is TaggedCodec {
    return (codec as any)._tag !== undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function makeDefaultState(codec: t.Mixed): t.TypeOf<typeof codec> {
    if (!isTaggedCodec(codec))
        throw new Error(`Codec does not have a _tag: ${codec}`);

    const _codec = codec as SupportedCodec;

    switch (_codec._tag) {
    case 'StringType':
        return '';

    case 'LiteralType':
        return _codec.value;

    case 'NumberType':
        return 0;

    case 'IntegerType':
        return 0;

    case 'NumberInRangeType':
    case 'IntegerInRangeType':
        return _codec.min;

    case 'BooleanType':
        return false;

    case 'NullType':
        return null;

    case 'InterfaceType':
        return Object.fromEntries(Object.entries(_codec.props).map(([key, value]) => [key, makeDefaultState(value as SupportedCodec)]));

    case 'ArrayType':
        return [];

    case 'FixedSizeArrayType':
        return Array.from({ length: _codec.size }, () => makeDefaultState(_codec.type as SupportedCodec));
    }

    throw new Error(`Unsupported codec: ${_codec}`);
}
