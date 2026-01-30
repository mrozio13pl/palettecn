import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { cloudflare } from '@cloudflare/vite-plugin';

const config = defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        devtools(),
        viteTsConfigPaths({
            projects: ['./tsconfig.json'],
        }),
        tanstackStart(),
        viteReact(),
        tailwindcss(),
        svgr(),
        cloudflare({ viteEnvironment: { name: 'ssr' } }),
    ],
    server: {
        port: 3000,
    },
});

export default config;
