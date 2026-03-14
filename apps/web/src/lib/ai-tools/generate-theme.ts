import { Output, generateId, streamText, tool } from 'ai';
import { z } from 'zod';
import type { LanguageModel, ModelMessage, UIMessageStreamWriter } from 'ai';
import type { ChatMessage } from '@/lib/types';
import { shadcnStylesSchema } from '@/lib/schemas';

export const generateThemeTool = (model: LanguageModel) =>
    tool({
        description: `Generates a complete shadcn/ui theme (light and dark) based on the current conversation context. Use this tool once you have a clear understanding of the user's request, which may include a text prompt, images, an SVG, or a base theme reference (@[theme_name])`,
        inputSchema: z.object({}),
        outputSchema: shadcnStylesSchema,
        execute: async (_, { messages, experimental_context, toolCallId, abortSignal }) => {
            try {
                const id = generateId();
                const writer = (experimental_context as any)
                    .writer as UIMessageStreamWriter<ChatMessage>;

                const filteredMessages = messages.map((msg) => {
                    if (Array.isArray(msg.content)) {
                        return {
                            ...msg,
                            content: msg.content.filter((part: any) => part.type !== 'reasoning'),
                        };
                    }
                    return msg;
                }) as Array<ModelMessage>;

                const { partialOutputStream, output: finalObject } = streamText({
                    model,
                    messages: filteredMessages,
                    output: Output.object({
                        schema: shadcnStylesSchema.omit({ id: true }),
                        description:
                            "The theme must include both and only 'light' and 'dark' modes at top level, like { name: \"short name\", dark: {...}, light: {...} } with all required CSS variables written in oklch.",
                    }),
                    abortSignal,
                    system: `
                        You are a specialized shadcn/ui theme generator.
                        Return ONLY a JSON object that strictly follows the provided schema.
                        Do not include markdown code blocks, backticks, or any conversational text.
                        Make sure the dark theme has dark background and light foreground and vice versa for light theme.
                        Follow the WCAG specifications, make sure the text is easily visible on the background.

                        CRITICAL: ALL color values MUST be in HEX format (#RRGGBB or #RGB).
                        Examples: #000000, #ffffff, #00ff00, #1a1a1a
                        DO NOT use oklch, rgb, hsl, or any other color format.
                        ONLY use HEX colors like #123abc.
                        `,
                    providerOptions: {
                        groq: {
                            // reasoningEffort: 'low',
                            // reasoningFormat: 'hidden',
                            disableToolValidation: true,
                        },
                    },
                });

                for await (const chunk of partialOutputStream) {
                    writer.write({
                        id: toolCallId,
                        type: 'data-theme',
                        data: { status: 'streaming', styles: { ...chunk, id } },
                        transient: true,
                    });
                }

                const output = await finalObject;

                writer.write({
                    id: toolCallId,
                    type: 'data-theme',
                    data: { status: 'streaming', styles: { ...output, id } },
                    transient: false,
                });

                return { ...output, id };
            } catch (error) {
                console.error(error);
            }
        },
    });
