import { consola } from 'consola';

type Meta = {
    env: {
        MODE: 'production' | 'development';
    } | undefined;
} | undefined;

const viteMode: 'production' | 'development' | undefined = (import.meta as any as Meta)?.env?.MODE; // eslint-disable-line @typescript-eslint/no-explicit-any
const nodeMode: 'production' | 'development' | undefined = process.env.NODE_ENV as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const isProd = viteMode === 'production' || nodeMode === 'production';

consola.level = isProd ? 999 : 999;

function createLoggerInstance(tag: string) {
    return consola.withTag(tag);
}

export { createLoggerInstance as createLogger };
