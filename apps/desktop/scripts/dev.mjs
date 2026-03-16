import { spawn } from 'node:child_process';
import watcher from '@parcel/watcher';
import which from 'which';

const unrun = await which('electron');
let electronProcess = null;

function startElectron() {
    electronProcess?.kill();
    electronProcess = spawn(unrun, ['./src/main.ts'], {
        env: { ...process.env, NODE_ENV: 'development', PORT: 3000 },
        stdio: 'inherit',
    });
}

const subscription = await watcher.subscribe('./src', () => startElectron());

startElectron();

process.on('exit', subscription.unsubscribe);
