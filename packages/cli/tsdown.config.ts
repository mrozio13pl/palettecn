import { defineConfig, globalLogger } from 'tsdown';
import fs from 'node:fs/promises';

export default defineConfig({
    exports: true,
    onSuccess: async () => {
        if (process.env.NODE_ENV !== 'development') {
            await fs.mkdir('./dist/web', { recursive: true });
            await fs.cp('../../apps/web/.output', './dist/web', {
                recursive: true,
                force: true,
            });
            globalLogger.success('Copied the web app into the bundle');
            await fs.rm('./dist/web/server/package.json');
        }
    },
    platform: 'node',
    env: {
        NODE_ENV: 'production',
    },
    minify: true,
    deps: {
        neverBundle: ['../web/server/index.mjs'],
        onlyBundle: false,
    },
});
