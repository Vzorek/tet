import { IWorker } from './base.js';

export class WebWorker implements IWorker {
    private worker: Worker;

    constructor(scriptUrl: string) {
        this.worker = new Worker(scriptUrl, {
            type: 'module',
        });
    }

    postMessage(message: unknown): void {
        this.worker.postMessage(message);
    }

    onMessage(callback: (message: unknown) => void): void {
        this.worker.addEventListener('message', event => {
            callback(event.data);
        });
    }

    onError(callback: (error: Error) => void): void {
        this.worker.addEventListener('error', event => {
            callback(new Error(event.message));
        });
    }

    async asyncDispose(): Promise<void> {
        this.worker.terminate();
    }

    async [Symbol.asyncDispose](): Promise<void> {
        return this.asyncDispose();
    }

    static postMessageToParent(message: unknown): void {
        self.postMessage(message);
    }

    static onMessageFromParent(callback: (message: unknown) => void): void {
        self.addEventListener('message', event => {
            callback(event.data);
        });
    }

    static onErrorFromParent(callback: (error: Error) => void): void {
        self.addEventListener('error', event => {
            callback(new Error(event.message));
        });
    }
}
