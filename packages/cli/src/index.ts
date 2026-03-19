#!/usr/bin/env node
import { name, version, description } from '@/package.json';
import { cli, command } from 'cleye';

const argv = cli({
    name,
    version,
    help: {
        description,
        examples: ['palettecn app/globals.css'],
    },
    parameters: ['[css path]'],
    commands: [
        command({
            name: 'web',
            help: {
                description: 'Opens a web app in the browser for palletecn',
            },
        }),
    ],
});

switch (argv.command) {
    case 'web':
        await import('@/commands/web');
        break;
    default: {
        const { uiCommand } = await import('@/commands/ui');
        uiCommand(argv._.cssPath);
        break;
    }
}
