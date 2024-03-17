export * from './TypedEventEmitter.js';

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
