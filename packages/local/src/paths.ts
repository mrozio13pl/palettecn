import envPaths from 'env-paths';
import { join } from 'node:path';

const SERVICE = 'palettecn';
const PATHS = envPaths(SERVICE);

export const CONFIG_DIR = PATHS.config;
export const KEYS_FILE_PATH = join(CONFIG_DIR, 'keys.enc.json');
export const MASTER_KEY_PATH = join(CONFIG_DIR, 'master.key');

export const DATA_DIR = PATHS.data;
export const DATA_FILE_PATH = join(DATA_DIR, 'settings.json');
