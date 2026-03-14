import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { nitro } from 'nitro/vite';

// remove's full paths from tanstack start's manifest
const pathScrubber = () => {
    return {
        name: 'remove-fullpaths',
        enforce: 'post' as const,
        closeBundle: async () => {
            const fs = await import('node:fs');
            const path = await import('node:path');

            const outDir = path.resolve('.output');
            const privatePath = import.meta.dirname;
            const safePath = '.';

            const walk = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                fs.readdirSync(dir).forEach((file) => {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        walk(fullPath);
                    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs')) {
                        let content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes(privatePath)) {
                            fs.writeFileSync(fullPath, content.replaceAll(privatePath, safePath));
                            console.warn(
                                'Removed unsafe absolute path from',
                                path.relative(privatePath, fullPath),
                            );
                        }
                    }
                });
            };

            walk(outDir);
            console.info('Removed unsafe absolute paths');
        },
    };
};

const config = defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [devtools(), tanstackStart(), react(), tailwindcss(), svgr(), nitro(), pathScrubber()],
    server: {
        port: Number(process.env.PORT) || 3000,
    },
    build: {
        manifest: false,
    },
});

export default config;
