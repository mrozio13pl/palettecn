import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import {
    JsonToSseTransformStream,
    LanguageModel,
    convertToModelMessages,
    createUIMessageStream,
    stepCountIs,
    streamText,
} from 'ai';
import { z } from 'zod';
import type { ChatMessage } from '@/lib/types';
import { generateThemeTool } from '@/lib/ai-tools/generate-theme';
import { normalizeMistralToolCallIds } from '@/lib/ai/mistral';
import { messageSchema, userMessageSchema } from '@palettecn/shared/schemas';
import { providers, initProvider, systemPrompt } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';

export const sendMessage = createServerFn()
    .inputValidator(
        zodValidator(
            z.object({
                id: z.string(),
                message: userMessageSchema.optional(),
                messages: z.array(messageSchema).optional(),
                provider: z.enum(providers),
                model: z.string(),
            }),
        ),
    )
    .handler(async ({ data }) => {
        const apiKey = ProvidersStorage.data[data.provider];

        if (!apiKey) throw new Error('Missing API key.');

        const model = initProvider(data.provider, apiKey)(data.model) as LanguageModel;
        const uiMessages = data.messages as Array<ChatMessage>;

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                const messages = normalizeMistralToolCallIds(
                    await convertToModelMessages(uiMessages),
                );

                const result = streamText({
                    model,
                    maxOutputTokens: 5000,
                    experimental_context: { writer },
                    stopWhen: stepCountIs(2),
                    system: systemPrompt,
                    tools: {
                        generateTheme: generateThemeTool(model),
                    },
                    toolChoice: 'auto',
                    messages,
                });

                writer.merge(result.toUIMessageStream());
            },
        });

        const sseStream = stream
            .pipeThrough(new JsonToSseTransformStream())
            .pipeThrough(new TextEncoderStream());

        return new Response(sseStream, {
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
            },
        });
    });
