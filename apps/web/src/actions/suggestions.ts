import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { type LanguageModel, generateObject } from 'ai';
import { z } from 'zod';
import { shadcnStylesSchema } from '@palettecn/shared/schemas';
import { providers, initProvider } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';

export const generateSuggestions = createServerFn({ method: 'POST' })
    .inputValidator(
        zodValidator(
            z.object({
                shadcn: shadcnStylesSchema,
                provider: z.enum(providers),
                model: z.string(),
            }),
        ),
    )
    .handler(async ({ data }) => {
        const apiKey = ProvidersStorage.data[data.provider];

        if (!apiKey) throw new Error('Missing API key.');

        const model = initProvider(data.provider, apiKey)(data.model) as LanguageModel;

        const { object } = await generateObject({
            model,
            schema: z.object({
                suggestions: z.array(z.string()).max(3),
            }),
            prompt: `Current shadcn/ui theme configuration:\n\n${JSON.stringify(data, null, 2)}\n\nSuggest 0-3 very brief (2-3 short words) logical but advanced and impressive improvements, enhancements or simply suggestions to the latest shadcn/ui theme based on the provided configuration.`,
        });
        return object.suggestions;
    });
