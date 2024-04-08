import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import wasm from 'vite-plugin-wasm';
import inject from '@rollup/plugin-inject';

export default defineConfig({
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
            '@tet/core/dist/src/server/workerScript.js',
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
        },
        target: 'esnext',
        outDir: 'dist',
        assetsInlineLimit: 0,
        minify: false,
    },
    assetsInclude: [
        '@tet/core/dist/src/server/workerScript.js',
    ],
});
