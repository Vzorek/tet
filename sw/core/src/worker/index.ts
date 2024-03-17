import { IWorker, IWorkerStatic } from './base.js';

export { IWorker };

let WorkerConstructor: IWorkerStatic | undefined = undefined;

async function ensureReady() {
    if (WorkerConstructor)
        return;

    if (typeof Worker === 'undefined') {
        const { NodeWorker } = await import('./node.js');
        WorkerConstructor = NodeWorker;
    } else {
        const { WebWorker } = await import('./web.js');
        WorkerConstructor = WebWorker;
    }

    if (!WorkerConstructor)
        throw new Error('No worker implementation available');
}

// Function to create a worker based on the environment
export async function createWorker(script: string): Promise<IWorker> {
    await ensureReady();

    if (!WorkerConstructor)
        throw new Error('No worker implementation available');

    return new WorkerConstructor(script);
}

export async function postMessageToParent(message: unknown): Promise<void> {
    await ensureReady();

    if (!WorkerConstructor)
        throw new Error('No worker implementation available');

    WorkerConstructor.postMessageToParent(message);
}

export async function onMessageFromParent(callback: (message: unknown) => void): Promise<void> {
    await ensureReady();

    if (!WorkerConstructor)
        throw new Error('No worker implementation available');

    WorkerConstructor.onMessageFromParent(callback);
}

export async function onErrorFromParent(callback: (error: Error) => void): Promise<void> {
    await ensureReady();

    if (!WorkerConstructor)
        throw new Error('No worker implementation available');

    WorkerConstructor.onErrorFromParent(callback);
}
