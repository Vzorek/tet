export * from './TypedEventEmitter.js';
export * from './io-tsUtils.js';
export * from './TinyJSONSchema.js';

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
