import { consola } from 'consola';

function padUpToLength(str: string, length: number) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}

function createLoggerInstance(tag: string) {
    return consola.withTag(tag);
}

export { createLoggerInstance as createLogger };
