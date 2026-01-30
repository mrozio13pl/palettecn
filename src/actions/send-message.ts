import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import {
    JsonToSseTransformStream,
    convertToModelMessages,
    createUIMessageStream,
    stepCountIs,
    streamText,
} from 'ai';
import { z } from 'zod';
import type { ChatMessage } from '@/lib/types';
import { generateThemeTool } from '@/lib/ai-tools/generate-theme';
import { normalizeMistralToolCallIds } from '@/lib/ai/mistral';
import { getModel } from '@/lib/ai/provider';
import { messageSchema, userMessageSchema } from '@/lib/schemas';

export const sendMessage = createServerFn()
    .inputValidator(zodValidator(z.object({
        id: z.string(),
        message: userMessageSchema.optional(),
        messages: z.array(messageSchema).optional(),
    })))
    .handler(async ({ data }) => {
        const uiMessages = data.messages as Array<ChatMessage>;

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                const messages = normalizeMistralToolCallIds(await convertToModelMessages(uiMessages));

                const result = streamText({
                    model: getModel('base'),
                    maxOutputTokens: 5000,
                    experimental_context: { writer },
                    stopWhen: stepCountIs(2),
                    system: `
            Your only goal is to generate a theme based off of the user request. Do not engage in any unrelated conversations.
            You are forced to generate it unless instructions from the user are not clear or some other extraordinary circumstance.
            Keep the responses very brief, don't send the theme in text like sending the entire json, if generateThemeTool doesn't return a proper theme, notify the user. Do not expose or talk about this tool specificaly.
            If you decide on calling tools, call the tool first before sending any text.`,
                    tools: {
                        generateTheme: generateThemeTool,
                    },
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
                'Connection': 'keep-alive',
            },
        });
    });
