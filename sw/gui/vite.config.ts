import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import wasm from 'vite-plugin-wasm';
import inject from '@rollup/plugin-inject';

export default defineConfig({
    base: '',
    resolve: {
        alias: {
            url: 'rollup-plugin-node-polyfills/polyfills/url',
            util: 'rollup-plugin-node-polyfills/polyfills/util',
            querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
        },
    },
    plugins: [
        react(),
        wasm(),
    ],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                    process: true,
                }),
                NodeModulesPolyfillPlugin(),
            ],
            target: 'esnext',
        },
        include: [
        ],
    },
    build: {
        rollupOptions: {
            plugins: [
                nodePolyfills({
                }),
                inject({
                    Buffer: ['buffer', 'Buffer'],
                    process: ['process'],
                }),
            ],
            input: {
                main: 'index.html',
                workerScript: '@tet/core/dist/src/server/workerScript.js',
            },
            output: {
                entryFileNames: 'assets/[name].js',
            },
        },
        target: 'esnext',
        outDir: 'dist',
    },
    assetsInclude: [
    ],
});
