import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { type LanguageModel, Output, generateText } from 'ai';
import { z } from 'zod';
import { shadcnStylesSchema } from '@/lib/schemas';
import { providers } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';
import { initProvider } from '@/lib/ai/initialize-provider';

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

        const { output } = await generateText({
            messages: [
                {
                    role: 'user',
                    content: `Current shadcn/ui theme configuration:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
            model,
            output: Output.object({
                schema: z.object({
                    suggestions: z.array(z.string()).max(3),
                }),
            }),
            toolChoice: 'required',
            system: `
            Suggest 0-3 very brief (2-3 short words) logical but advanced and impressive improvements, enhancements or simply suggestions to the latest shadcn/ui theme based on the provided configuration.
            `,
        });
        return output.suggestions;
    });
