import { defineConfig } from 'tsdown';

export default defineConfig({
    format: 'cjs',
    outDir: 'dist',
    outExtensions: () => ({ js: '.js' }),
    entry: ['src/main.ts'],
    clean: true,
});
