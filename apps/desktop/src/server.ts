import getPort, { portNumbers } from 'get-port';
import { spawn, ChildProcess } from 'node:child_process';
import path from 'node:path';
import http from 'node:http';
import { isDevelopment } from './utils';

let server: ChildProcess | null = null;

function getServerPath() {
    if (isDevelopment) return path.join(process.cwd(), '../../web/.output/server/index.mjs');
    // path from extraResources
    return path.join(process.resourcesPath, 'server/server/index.mjs');
}

function waitForServer(
    port: number,
    resolve: (port: number) => void,
    reject: (e: Error) => void,
    attempts = 0,
) {
    if (attempts > 30) return reject(new Error('Server never started'));

    http.get(`http://localhost:${port}`, () => {
        resolve(port);
    }).on('error', () => {
        setTimeout(() => waitForServer(port, resolve, reject, attempts + 1), 300);
    });
}

export async function startServer(appPath: string): Promise<number> {
    const port = Number(process.env.PORT) || (await getPort({ port: portNumbers(40_000, 60_000) }));

    if (isDevelopment) return port;

    return new Promise((resolve, reject) => {
        const serverPath = path.join(appPath, getServerPath());

        server = spawn(process.execPath, [serverPath], {
            env: { ...process.env, PORT: String(port) },
        });

        server.stdout?.on('data', (data) => console.log('[server]', data.toString()));
        server.stderr?.on('data', (data) => console.error('[server]', data.toString()));

        waitForServer(port, resolve, reject);
    });
}

export function killServer() {
    if (!isDevelopment) server?.kill();
}
