import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./src/index.ts', './src/schemas.ts', './src/types.ts', './src/ai-tools.ts'],
});
