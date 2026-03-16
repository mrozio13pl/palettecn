import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
    return twMerge(clsx(inputs));
}

export function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isLocal =
    location?.hostname === 'localhost' ||
    location?.hostname === '127.0.0.1' ||
    location?.hostname === '::1' ||
    location?.hostname.endsWith('.localhost');
