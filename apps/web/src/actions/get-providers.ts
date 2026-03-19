import { getProviderModels } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';
import { createServerFn } from '@tanstack/react-start';

const cache = new Map<
    string,
    {
        data: Awaited<ReturnType<typeof getProviderModels>>;
        expires: number;
    }
>();
const CACHE_TTL = 60 * 1000 * 60; // 1 hour

export const getProviderData = createServerFn({ method: 'GET' }).handler(async () => {
    const cacheKey = 'providerData';
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && cached.expires > now) {
        return cached.data;
    }

    const result = await getProviderModels(ProvidersStorage.data);

    cache.set(cacheKey, {
        data: result,
        expires: now + CACHE_TTL,
    });

    return result;
});
