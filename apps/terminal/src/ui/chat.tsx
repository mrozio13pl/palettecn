import { useScreenSize } from 'fullscreen-ink';
import { Box, Text } from '@/components/ink';
import { Input } from './input';
import { ProvidersStorage } from '@palettecn/local';
import { useChatState } from '@/hooks/use-chat';
import { initProvider, type ShadcnThemeStyles, systemPrompt } from '@palettecn/shared';
import { jsonSchema, stepCountIs, streamText, tool } from 'ai';
import { generateThemeTool } from '@palettecn/shared/ai-tools';
import { useState } from 'react';
import Spinner from 'ink-spinner';
import type { DeepPartial, ModelMessage } from 'ai';
import { shadcnStylesSchema } from '@palettecn/shared/schemas';
import { Palettecn } from '@/core/palettecn';
import { readFile } from 'node:fs/promises';

export const readThemeTool = tool({
    description: `Reads the current shadcn/ui CSS theme file. Use this when the user asks to modify, tweak, or build upon their existing theme, or references "my current theme", "existing colors", etc.`,
    inputSchema: jsonSchema<Record<never, never>>({ type: 'object', properties: {} }),
    execute: async () => {
        const css = await readFile(Palettecn.instance.cssPath, 'utf-8');
        return { css };
    },
});

type Block =
    | { type: 'text'; content: string }
    | { type: 'reasoning'; content: string; isReasoning: boolean; reasonTime?: number }
    | { type: 'tool-call'; name: string; args: unknown }
    | { type: 'tool-result'; name: string; result: unknown }
    | { type: 'error'; message: string };

interface Message {
    role: 'user' | 'assistant';
    blocks: Block[];
    text: string; // final accumulated text for history
}

export function Chat() {
    const { height } = useScreenSize();
    const { input, setInput, selectedProvider, selectedModel } = useChatState();
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamingBlocks, setStreamingBlocks] = useState<Block[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);

    async function sendMessage() {
        if (!selectedProvider || !selectedModel || !input.trim()) return;

        const apiKey = ProvidersStorage.data[selectedProvider];
        if (!apiKey) throw new Error('Missing API key.');

        const userMessage: Message = {
            role: 'user',
            blocks: [{ type: 'text', content: input }],
            text: input,
        };
        setMessages((prev) => [...prev, userMessage]);
        setStreamingBlocks([]);
        setIsStreaming(true);
        setInput('');

        const model = initProvider(selectedProvider, apiKey)(selectedModel);

        const history: ModelMessage[] = [
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            { role: 'user', content: input },
        ];

        let assistantText = '',
            localBlocks: Block[] = [],
            reasoningStart: number = Date.now();

        function mergeBlock(block: Block) {
            const last = localBlocks[localBlocks.length - 1];
            if (
                last?.type === block.type &&
                (block.type === 'text' || block.type === 'reasoning')
            ) {
                localBlocks = [
                    ...localBlocks.slice(0, -1),
                    {
                        ...last,
                        content: last.content + block.content,
                        isReasoning: (block as any).isReasoning,
                        // ✅ preserve reasonTime from the incoming block
                        ...((block as any).reasonTime != null && {
                            reasonTime: (block as any).reasonTime,
                        }),
                    },
                ];
            } else {
                localBlocks = [...localBlocks, block];
            }
            setStreamingBlocks(localBlocks);
        }

        try {
            const { fullStream } = streamText({
                model,
                maxOutputTokens: 5000,
                tools: {
                    generateTheme: generateThemeTool(model),
                    readTheme: readThemeTool,
                },
                system: systemPrompt,
                stopWhen: stepCountIs(2),
                messages: history,
            });

            Palettecn.instance.createBackup();

            for await (const part of fullStream) {
                switch (part.type) {
                    case 'text-delta':
                        if (!assistantText) {
                            mergeBlock({ type: 'reasoning', content: '', isReasoning: false });
                        }

                        assistantText += part.text;
                        mergeBlock({ type: 'text', content: part.text });
                        break;
                    case 'reasoning-start':
                        reasoningStart = Date.now();
                        break;
                    case 'reasoning-end':
                        mergeBlock({
                            type: 'reasoning',
                            content: '',
                            isReasoning: false,
                            reasonTime: (Date.now() - reasoningStart) / 1e3,
                        });
                        break;
                    case 'reasoning-delta':
                        mergeBlock({
                            type: 'reasoning',
                            content: part.text,
                            isReasoning: true,
                            reasonTime: (Date.now() - reasoningStart) / 1e3,
                        });
                        break;
                    case 'tool-call': {
                        mergeBlock({
                            type: 'tool-call',
                            name: part.toolName,
                            args: part.toolCallId,
                        });
                        break;
                    }
                    case 'tool-result': {
                        mergeBlock({
                            type: 'tool-result',
                            name: part.toolName,
                            result: part.output,
                        });

                        if (part.toolName === 'generateTheme') {
                            Palettecn.instance.applyThemeStyles(part.output as any);
                        }

                        break;
                    }
                    case 'tool-error':
                    case 'error':
                        mergeBlock({
                            type: 'error',
                            message: (part.error as any)?.message ?? String(part.error),
                        });
                        break;
                }
            }
        } catch (error: any) {
            mergeBlock({ type: 'error', message: error.message });
        } finally {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', blocks: localBlocks, text: assistantText },
            ]);
            setStreamingBlocks([]);
            setIsStreaming(false);
        }
    }

    function renderBlocks(blocks: Block[]) {
        return blocks
            .map((block, i) => {
                switch (block.type) {
                    case 'reasoning':
                        return block.isReasoning ? (
                            <Box key={i} flexDirection="column">
                                <Text dimColor>
                                    <Spinner />
                                    {' Thinking...'}
                                </Text>
                                <Text dimColor>{block.content}</Text>
                            </Box>
                        ) : (
                            <Text key={i} dimColor>
                                💭 Thought for {Math.ceil(block.reasonTime || 0)} seconds
                            </Text>
                        );
                    case 'text':
                        return <Text key={i}>{block.content}</Text>;
                    case 'tool-call':
                        if (blocks.find((block) => block.type === 'tool-result' && block.result))
                            return null;

                        return (
                            <Text key={i} color="gray">
                                <Spinner type="dots12" /> {block.name}({JSON.stringify(block.args)})
                            </Text>
                        );
                    case 'tool-result':
                        switch (block.name) {
                            case 'generateTheme': {
                                const result = block.result as DeepPartial<ShadcnThemeStyles>;
                                const { success: isComplete } =
                                    shadcnStylesSchema.safeParse(result);

                                return (
                                    <Box key={i}>
                                        <Text color={result?.dark?.primary || 'gray'}>
                                            {isComplete ? '✓' : <Spinner type="dots12" />}
                                            {' ' + (result?.name || 'Generating...') + ' '}
                                        </Text>
                                        <Text color={result?.dark?.primary}>██</Text>
                                        <Text color={result?.dark?.secondary}>██</Text>
                                        <Text color={result?.dark?.accent}>██</Text>
                                        <Text color={result?.dark?.foreground}>██</Text>
                                        <Text color={result?.dark?.background}>██</Text>
                                    </Box>
                                );
                            }
                            case 'readTheme': {
                                return (
                                    <Box key={i}>
                                        <Text color="gray">
                                            ✓ Read {Palettecn.instance.cssPath}
                                        </Text>
                                    </Box>
                                );
                            }
                        }
                        return (
                            <Text key={i} color="green">
                                ✓ {block.name}: {JSON.stringify(block.result)}
                            </Text>
                        );
                    case 'error':
                        return <Text color="red">{block.message}</Text>;
                }
            })
            .filter(Boolean);
    }

    return (
        <Box flexDirection="column" width="100%" height="100%">
            <Box height={height - 7} marginX={2} flexDirection="column" gap={1}>
                {messages.length === 0 && !isStreaming && (
                    <Text color="gray" italic>
                        Chat empty...
                    </Text>
                )}
                {messages.map((msg, i) => (
                    <Box key={i} flexDirection="column" gap={1}>
                        {msg.role === 'user' ? (
                            <Text color="cyan">You: {msg.text}</Text>
                        ) : (
                            renderBlocks(msg.blocks)
                        )}
                    </Box>
                ))}
                {isStreaming && (
                    <Box flexDirection="column" gap={1}>
                        {renderBlocks(streamingBlocks)}
                    </Box>
                )}
            </Box>
            <Input onSubmit={sendMessage} />
        </Box>
    );
}
