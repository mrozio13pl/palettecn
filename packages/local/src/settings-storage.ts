import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { DATA_DIR, DATA_FILE_PATH } from './paths';
import { defu } from 'defu';
import type { PartialDeep } from 'type-fest';
import type { Provider } from '@palettecn/shared';

export type SettingsStorageType = {
    cli: {
        selectedModel: string;
        selectedProvider: Provider;
    };
};

function save(data: PartialDeep<SettingsStorageType>): void {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }

    writeFileSync(DATA_FILE_PATH, JSON.stringify(defu(data, load()), null, 2), 'utf8');
}

function load(): SettingsStorageType | undefined {
    if (!existsSync(DATA_FILE_PATH)) {
        return undefined;
    }

    try {
        const fileContent = readFileSync(DATA_FILE_PATH, 'utf8');
        return JSON.parse(fileContent) as SettingsStorageType;
    } catch (error) {
        console.error('Failed to load settings:', error);
        return undefined;
    }
}

export const SettingsStorage = {
    get data() {
        return load();
    },
    save,
};
