import { getAvailableModels } from '@/lib/ai/model-list';
import { ProviderStateList } from '@/lib/types';
import { ProvidersStorage } from '@palettecn/local';
import { Provider, providerDisplay } from '@palettecn/shared';
import { createServerFn } from '@tanstack/react-start';

const cache = new Map<
    string,
    {
        data: {
            errorMessages: string[];
            providers: Partial<ProviderStateList>;
        };
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

    const loadedData = ProvidersStorage.data;
    const providers: Partial<ProviderStateList> = {};
    const errorMessages: string[] = [];

    for (const provider of Object.keys(loadedData) as Provider[]) {
        try {
            const models = await getAvailableModels(provider, loadedData[provider]!);
            providers[provider] = {
                isActive: true,
                models,
            };
        } catch (error: any) {
            errorMessages.push(
                `Couldn't fetch model list for ${providerDisplay[provider]}, perhaps the API key is no longer valid? Error: ${error.message}`,
            );
        }
    }

    const result = { errorMessages, providers };

    cache.set(cacheKey, {
        data: result,
        expires: now + CACHE_TTL,
    });

    return result;
});
