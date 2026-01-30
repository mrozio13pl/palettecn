import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { Output, generateText } from 'ai';
import { z } from 'zod';
import { shadcnStylesSchema } from '@/lib/schemas';
import { getModel } from '@/lib/ai/provider';

export const generateSuggestions = createServerFn({ method: 'POST' })
    .inputValidator(zodValidator(shadcnStylesSchema))
    .handler(async ({ data }) => {
        const { output } = await generateText({
            messages: [
                {
                    role: 'user',
                    content: `Current shadcn/ui theme configuration:\n\n${JSON.stringify(data, null, 2)}`,
                },
            ],
            model: getModel('suggestion'),
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
