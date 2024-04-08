import { QuickJSContext, QuickJSWASMModule } from 'quickjs-emscripten';
import variant from '@jitl/quickjs-singlefile-browser-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import { Arena } from 'quickjs-emscripten-sync';
import * as E from 'fp-ts/lib/Either.js';

export class Runtime {
    private static QuickJS: QuickJSWASMModule | null;
    readonly vm: QuickJSContext;
    readonly arena: Arena;

    static async init() {
        if (!Runtime.QuickJS) {
            Runtime.QuickJS = await newQuickJSWASMModuleFromVariant(variant);
        }
    }

    constructor() {
        if (!Runtime.QuickJS) {
            throw new Error('QuickJS not initialized');
        }
        this.vm = Runtime.QuickJS!.newContext();
        this.arena = new Arena(this.vm, { isMarshalable: true });
    }

    evalCode(code: string): E.Either<Error, unknown> {
        try {
            const val = this.arena.evalCode(code);
            return E.right(val);
        } catch (e) {
            if (e instanceof Error)
                return E.left(e);
            return E.left(new Error(`Unknown error: ${e}`));
        }
    }

    dispose() {
        this.arena.dispose();
        this.vm.dispose();
    }

    [Symbol.dispose]() {
        this.vm.dispose();
    }

};
