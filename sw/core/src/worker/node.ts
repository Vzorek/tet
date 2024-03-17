import { IWorker } from './base.js';

const { Worker: _Worker, parentPort } = await import('worker_threads');

export class NodeWorker implements IWorker {
    private worker;

    constructor(scriptPath: string) {
        this.worker = new _Worker(scriptPath);
    }

    postMessage(message: unknown): void {
        this.worker.postMessage(message);
    }

    onMessage(callback: (message: unknown) => void): void {
        this.worker.on('message', callback);
    }

    onError(callback: (error: Error) => void): void {
        this.worker.on('error', callback);
    }

    async asyncDispose(): Promise<void> {
        await this.worker.terminate();
    }

    async [Symbol.asyncDispose](): Promise<void> {
        return this.asyncDispose();
    }

    static postMessageToParent(message: unknown): void {
        if (!parentPort)
            throw new Error('Not running in a worker');
        parentPort.postMessage(message);
    }

    static onMessageFromParent(callback: (message: unknown) => void): void {
        if (!parentPort)
            throw new Error('Not running in a worker');
        parentPort.on('message', callback);
    }

    static onErrorFromParent(callback: (error: Error) => void): void {
        if (!parentPort)
            throw new Error('Not running in a worker');
        parentPort.on('error', callback);
    }
}
