import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import type { Provider } from '@palettecn/shared';
import { CONFIG_DIR, KEYS_FILE_PATH, MASTER_KEY_PATH } from './paths';

export type ProvidersStorageType = Partial<Record<Provider, string>>;

const ALGORITHM = 'aes-256-gcm';

interface EncryptedPayload {
    iv: string;
    data: string;
    tag: string;
}

function getMasterKey(): Buffer {
    if (existsSync(MASTER_KEY_PATH)) {
        const keyHex = readFileSync(MASTER_KEY_PATH, 'utf8');
        return Buffer.from(keyHex, 'hex');
    }

    // Generate a fresh 32-byte key if it doesn't exist
    const newKey = randomBytes(32).toString('hex');

    if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // mode: 0o600 ensures ONLY the current user can read or write this file.
    // Other users on the same computer will get a "Permission Denied" error.
    writeFileSync(MASTER_KEY_PATH, newKey, { encoding: 'utf8', mode: 0o600 });

    return Buffer.from(newKey, 'hex');
}

function save(data: ProvidersStorageType): void {
    const key = getMasterKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const payload: EncryptedPayload = {
        iv: iv.toString('hex'),
        data: encrypted,
        tag: cipher.getAuthTag().toString('hex'),
    };

    if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // The JSON file doesn't need strict permissions because it is fully encrypted
    writeFileSync(KEYS_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

function load(): ProvidersStorageType | undefined {
    if (!existsSync(KEYS_FILE_PATH)) {
        return undefined;
    }

    try {
        const fileContent = readFileSync(KEYS_FILE_PATH, 'utf8');
        const { iv, data, tag }: EncryptedPayload = JSON.parse(fileContent);

        const key = getMasterKey();
        const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));

        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted) as ProvidersStorageType;
    } catch (error) {
        console.error('Failed to decrypt providers:', error);
        return undefined;
    }
}

export const ProvidersStorage = {
    get data() {
        return load() || {};
    },
    save,
};
