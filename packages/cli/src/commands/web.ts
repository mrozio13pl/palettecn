import opener from 'opener';
import getPort, { portNumbers } from 'get-port';
import chalk from 'chalk';
import { checkUpdate } from '@/updater';

checkUpdate().then((update) => {
    if (update)
        console.warn(
            chalk.yellow`New (${update.type}) update available: ${update.current} -> ${update.latest}`,
        );
});

const freePort = await getPort({
    port: [3600, ...portNumbers(36_000, 46_000)],
});
process.env.PORT = freePort.toString();

// @ts-expect-error imported at build-time
await import('../web/server/index.mjs');

opener(`http://127.0.0.1:${freePort}`);
