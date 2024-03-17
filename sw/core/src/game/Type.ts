export class Type<T> {
    readonly _state!: T;

    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    createDefault(): T {
        throw new Error('Not implemented');
    }
}

export type TypeOf<T extends Type<unknown>> = T['_state'];

export class Mixed extends Type<any> {} // eslint-disable-line @typescript-eslint/no-explicit-any

export class Any extends Type<any> {} // eslint-disable-line @typescript-eslint/no-explicit-any

export class Never extends Type<never> {}

export class NumberType extends Type<number> {
    readonly _tag = 'NumberType' as const;

    constructor(readonly defaultValue: number = 0) {
        super('number');
    }

    createDefault(): number {
        return this.defaultValue;
    }
}

export interface NumberC extends NumberType { }

export const number: NumberC = new NumberType();

export class IntRangeType<F extends number, T extends number, R = IntRange<F, T>> extends Type<R> {
    readonly _tag = 'IntRangeType' as const;

    constructor(
        name: string,
        readonly from: F,
        readonly to: T,
        readonly defaultValue: R = from as unknown as R,
    ) {
        super(name);
    }

    createDefault(): R {
        return this.defaultValue;
    }
}

export interface IntRangeC<F extends number, T extends number>
    extends IntRangeType<F, T, IntRange<F, T>> { };

export function intRange<F extends number, T extends number>(from: F, to: T, name: string): IntRangeC<F, T> {
    return new IntRangeType(name, from, to);
}

// Your existing Enumerate and IntRange types
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export class StringType extends Type<string> {
    readonly _tag = 'StringType' as const;

    constructor(readonly defaultValue: string = '') {
        super('string');
    }

    createDefault(): string {
        return this.defaultValue;
    }
}

export interface StringC extends StringType { }

export const string: StringC = new StringType();

export class BooleanType extends Type<boolean> {
    readonly _tag = 'BooleanType' as const;

    constructor(readonly defaultValue: boolean = false) {
        super('boolean');
    }

    createDefault(): boolean {
        return this.defaultValue;
    }
}

export interface BooleanC extends BooleanType { }

export const boolean: BooleanC = new BooleanType();

export interface Props {
    [key: string]: Mixed;
}

export class ClassType<P extends Props, T = any> extends Type<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly _tag = 'InterfaceType' as const;

    constructor(
        name: string,
        readonly props: P,
        readonly defaultValue: T = ClassType.createDefaultProps(props),
    ) {
        super(name);
    }

    static createDefaultProps<T, P extends Props>(props: P): T {
        const result: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        for (const key in props) {
            result[key] = props[key].createDefault();
        }
        return result;
    }

    createDefault(): T {
        return this.defaultValue;
    }
}

export interface ObjectC<P extends Props>
    extends ClassType<P, { [K in keyof P]: TypeOf<P[K]> }> { };

export function object<P extends Props>(props: P, name: string): ObjectC<P> {
    return new ClassType(name, props);
}

export class ArrayType<C extends Any, T = any> extends Type<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly _tag = 'ArrayType' as const;

    constructor(
        name: string,
        readonly type: C,
        readonly defaultValue: T = [] as unknown as T,
    ) {
        super(name);
    }

    createDefault(): T {
        return this.defaultValue;
    }
}

export interface ArrayC<C extends Any>
    extends ArrayType<C, TypeOf<C>[]> { };

export function array<C extends Any>(item: C, name: string): ArrayC<C> {
    return new ArrayType(name, item);
}

export class FixedSizeArrayType<C extends Any, N extends number, T = any> extends Type<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    readonly _tag = 'FixedSizeArrayType' as const;

    constructor(
        name: string,
        readonly type: C,
        readonly size: N,
        readonly defaultValue: T = FixedSizeArrayType.createDefaultValues(type, size) as unknown as T,
    ) {
        super(name);
    }

    static createDefaultValues<C extends Any, N extends number>(item: C, size: N): TypeOf<C>[] {
        const result: TypeOf<C>[] = [];
        for (let i = 0; i < size; i++) {
            result.push(item.createDefault());
        }
        return result;
    }

    createDefault(): T {
        return this.defaultValue;
    }
}

export interface FixedSizeArrayC<C extends Any, N extends number>
    extends FixedSizeArrayType<C, N, FixedSizeArray<TypeOf<C>, N>> { };

export function fixedSizeArray<C extends Any, N extends number>(item: C, size: N, name: string): FixedSizeArrayC<C, N> {
    return new FixedSizeArrayType(name, item, size);
}

type Shift<A extends Array<any>> = // eslint-disable-line @typescript-eslint/no-explicit-any
    ((...args: A) => void) extends ((...args: [A[0], ...infer R]) => void) ? R : never;

type GrowExpRev<A extends Array<any>, N extends number, P extends Array<Array<any>>> = A['length'] extends N ? A : { // eslint-disable-line @typescript-eslint/no-explicit-any
    0: GrowExpRev<[...A, ...P[0]], N, P>,
    1: GrowExpRev<A, N, Shift<P>>
}[[...A, ...P[0]][N] extends undefined ? 0 : 1];

type GrowExp<A extends Array<any>, N extends number, P extends Array<Array<any>>> = A['length'] extends N ? A : { // eslint-disable-line @typescript-eslint/no-explicit-any
    0: GrowExp<[...A, ...A], N, [A, ...P]>,
    1: GrowExpRev<A, N, P>
}[[...A, ...A][N] extends undefined ? 0 : 1];

export type FixedSizeArray<T, N extends number> = N extends 0 ? [] : N extends 1 ? [T] : GrowExp<[T, T], N, [[T]]>;
