import { configureStore } from '@reduxjs/toolkit';

import TetMiddleware from './client/middleware';
import devicesSlice from './slices/devices';
import clientSlice from './slices/client';
import configSlice, { saveConfig } from './slices/config';

export const store = configureStore({
    reducer: {
        devices: devicesSlice.reducer,
        client: clientSlice.reducer,
        config: configSlice.reducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(TetMiddleware) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
});

store.subscribe(() => {
    saveConfig(store.getState().config);
});

export function getPersistent(state: State) {
    const {
        client,
        ...rest
    } = state;
    client;
    return rest;
}

export type State = ReturnType<typeof store.getState>;

export default store;
