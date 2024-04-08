export type Transform<T extends Record<string, unknown>, prefix extends string> = {
    [K in keyof T]:
    T[K] extends undefined
        ? { type: `${prefix}/${K & string}` }
        : { type: `${prefix}/${K & string}`; payload: T[K]; }
}[keyof T];

