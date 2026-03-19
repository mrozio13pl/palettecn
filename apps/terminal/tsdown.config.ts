import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.tsx'],
    env: {
        NODE_ENV: 'production',
    },
});
