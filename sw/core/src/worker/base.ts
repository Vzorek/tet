export interface IWorker {
    postMessage(message: unknown): void;
    onMessage(callback: (message: unknown) => void): void;
    onError(callback: (error: Error) => void): void;
    asyncDispose(): Promise<void>;
    [Symbol.asyncDispose](): Promise<void>;
}

export interface IWorkerStatic {
    new(scriptPath: string): IWorker;
    postMessageToParent(message: unknown): void;
    onMessageFromParent(callback: (message: unknown) => void): void;
    onErrorFromParent(callback: (error: Error) => void): void;
}
