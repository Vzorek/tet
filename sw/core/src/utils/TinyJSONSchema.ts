import * as t from 'io-ts';
import { FixedSizeArrayType, IntegerInRangeType, IntegerType, NumberInRangeType } from './io-tsUtils';

type CommonData = {
    title?: string;
};

export type StringSchema = CommonData & {
    type: 'string';
    enum?: string[];
};

export type NumberSchema = CommonData & {
    type: 'number';
    minimum?: number;
    maximum?: number;
};

export type BooleanSchema = CommonData & {
    type: 'boolean';
};

export type NullSchema = CommonData & {
    type: 'null';
};

export type IntegerSchema = CommonData & {
    type: 'integer';
    minimum?: number;
    maximum?: number;
};

export type ObjectSchema = CommonData & {
    type: 'object';
    properties: {
        [key: string]: TinyJSONSchema;
    };
};

export type ArraySchema = CommonData & {
    type: 'array';
    items: TinyJSONSchema;
    minItems?: number;
    maxItems?: number;
};

export type TinyJSONSchema = StringSchema | NumberSchema | BooleanSchema | NullSchema | IntegerSchema | ObjectSchema | ArraySchema;

export const tinyJSONSchemaString = t.type({
    type: t.literal('string'),
}, 'TinyJSONSchemaString');

export const tinyJSONSchemaNumber = t.intersection([
    t.type({
        type: t.literal('number'),
    }),
    t.partial({
        minimum: t.number,
        maximum: t.number,
    }),
], 'TinyJSONSchemaNumber');

export const tinyJSONSchemaBoolean = t.type({
    type: t.literal('boolean'),
}, 'TinyJSONSchemaBoolean');

export const tinyJSONSchemaNull = t.type({
    type: t.literal('null'),
}, 'TinyJSONSchemaNull');

export const tinyJSONSchemaInteger = t.intersection([
    t.type({
        type: t.literal('integer'),
    }),
    t.partial({
        minimum: t.number,
        maximum: t.number,
    }),
], 'TinyJSONSchemaInteger');

export const tinyJSONSchemaObject: t.Type<ObjectSchema> = t.recursion('TinyJSONSchemaObject', () => t.type({
    type: t.literal('object'),
    properties: t.record(t.string, tinyJSONSchema),
}));

export const tinyJSONSchemaArray: t.Type<ArraySchema> = t.recursion('TinyJSONSchemaArray', () => t.intersection([
    t.type({
        type: t.literal('array'),
        items: tinyJSONSchema,
    }),
    t.partial({
        minItems: t.number,
        maxItems: t.number,
    }),
]));

export const tinyJSONSchema: t.Type<TinyJSONSchema> = t.recursion('TinyJSONSchema', () => t.union([
    tinyJSONSchemaString,
    tinyJSONSchemaNumber,
    tinyJSONSchemaBoolean,
    tinyJSONSchemaNull,
    tinyJSONSchemaInteger,
    tinyJSONSchemaObject,
    tinyJSONSchemaArray,
]));

export const TinyJSONSchemaAtoms = {
    string: tinyJSONSchemaString,
    number: tinyJSONSchemaNumber,
    boolean: tinyJSONSchemaBoolean,
    null: tinyJSONSchemaNull,
    integer: tinyJSONSchemaInteger,
    object: tinyJSONSchemaObject,
    array: tinyJSONSchemaArray,
};

export function schemaToCodec(schema: TinyJSONSchema): t.Mixed {
    switch (schema.type) {
    case 'string':
        return t.string;
    case 'number':
        return t.number;
    case 'integer':
        return t.Int;
    case 'boolean':
        return t.boolean;
    case 'null':
        return t.null;
    case 'object':
        return t.type({
            ...Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, schemaToCodec(value)])),
        });
    case 'array':
        return t.array(schemaToCodec(schema.items));
    }
}

type SupportedCodecs =
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
    t.UnionType<t.Any[]> |
    FixedSizeArrayType<t.Any, number>;

export function codecToSchema(codec: SupportedCodecs): TinyJSONSchema {
    if (!codec._tag)
        throw new Error(`Codec does not have a _tag: ${codec}`);

    switch (codec._tag) {
    case 'StringType':
        return { type: 'string' as const } as StringSchema;
    case 'LiteralType':
        return { type: 'string' as const } as StringSchema;
    case 'NumberType':
        return { type: 'number' as const } as NumberSchema;
    case 'NumberInRangeType':
        return {
            type: 'number' as const,
            minimum: codec.min,
            maximum: codec.max,
        } as NumberSchema;
    case 'IntegerType':
        return { type: 'integer' as const } as IntegerSchema;
    case 'IntegerInRangeType':
        return {
            type: 'integer' as const,
            minimum: codec.min,
            maximum: codec.max,
        } as IntegerSchema;
    case 'BooleanType':
        return { type: 'boolean' as const } as BooleanSchema;
    case 'NullType':
        return { type: 'null' as const } as NullSchema;
    case 'InterfaceType':
        const props = Object.fromEntries(Object.entries(codec.props).map(([key, value]) => [key, codecToSchema(value as SupportedCodecs)]));
        return { type: 'object' as const, properties: props } as ObjectSchema;
    case 'ArrayType':
        return {
            type: 'array' as const,
            items: codecToSchema((codec.type as any) as SupportedCodecs), // eslint-disable-line @typescript-eslint/no-explicit-any
        } as ArraySchema;
    case 'FixedSizeArrayType':
        return {
            type: 'array' as const,
            items: codecToSchema((codec.type as any) as SupportedCodecs), // eslint-disable-line @typescript-eslint/no-explicit-any
            minItems: codec.size,
            maxItems: codec.size,
        } as ArraySchema;

    case 'UnionType':
        return {
            type: 'string' as const,
            enum: codec.types.map(type => (type as t.LiteralType<string>).value),
        };

    default:
        throw new Error(`Unsupported codec type: ${(codec as any)._tag}`); // eslint-disable-line @typescript-eslint/no-explicit-any

    }
}
