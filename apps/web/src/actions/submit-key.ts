import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { providers } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';
import { getAvailableModels, validateApiKey } from '@palettecn/shared';

export const submitApiKey = createServerFn()
    .inputValidator(
        zodValidator(
            z.object({
                provider: z.enum(providers),
                apiKey: z.string(),
            }),
        ),
    )
    .handler(async ({ data: { provider, apiKey } }) => {
        const isValid = await validateApiKey(provider, apiKey);

        if (!isValid) throw new Error('Invalid API key.');

        const storedProviders = ProvidersStorage.data;

        ProvidersStorage.save({
            ...storedProviders,
            [provider]: apiKey,
        });
        console.log('storedProviders', ProvidersStorage.data);

        const models = await getAvailableModels(provider, apiKey);

        return { models };
    });
