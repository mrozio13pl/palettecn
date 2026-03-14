import React, { Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import copy from 'copy-text-to-clipboard';
import { motion } from 'motion/react';
import { useServerFn } from '@tanstack/react-start';
import Logo from '../logo.svg?react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './ai-elements/reasoning';
import { ThemeTool } from './theme-tool';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import type { RequiredDeep } from 'type-fest';
import type { DeepPartial } from 'ai';
import type { ChatMessage, ShadcnThemeStyles } from '@/lib/types';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { useThemes } from '@/hooks/use-themes';
import {
    PromptInput,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
    Message,
    MessageAction,
    MessageActions,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import { generateSuggestions } from '@/actions/suggestions';
import { ProviderPicker } from './ai-provider-selector';
import { useProviders } from '@/hooks/use-providers';

const suggestions = [
    'Minimalist, high-contrast monochrome',
    'Midnight executive, deep indigo with soft muted accents',
    'Autumn forest with browns and burnt orange accents',
    'Electric lime greens against a dark slate background',
];

export const Chat = ({ ref }: { ref: React.RefObject<{ resetChat: () => void } | null> }) => {
    const { selectedModel, selectedProvider } = useProviders();
    const { currentTheme, setCurrentTheme, appendThemes, setIsGenerating } = useThemes();
    const [input, setInput] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<Array<string>>();
    const [streamedData, setStreamedData] = useState<DeepPartial<ShadcnThemeStyles>>();
    const getSuggestions = useServerFn(generateSuggestions);
    const { messages, sendMessage, status, regenerate, setMessages } = useChat<ChatMessage>({
        transport: new DefaultChatTransport({
            prepareSendMessagesRequest(req) {
                setAiSuggestions([]);
                return {
                    body: {
                        id: req.id,
                        messages: req.messages,
                        provider: selectedProvider,
                        model: selectedModel,
                        ...req.body,
                    },
                };
            },
            api: '/api/chat',
        }),
        onData: (dataPart) => {
            if (dataPart.type === 'data-theme') {
                if (dataPart.data.styles.id?.length === 16) {
                    appendThemes(dataPart.data.styles as any);
                    setCurrentTheme(dataPart.data.styles as any);
                    setStreamedData(dataPart.data.styles);
                }
            }
        },
        onFinish() {
            if (!selectedProvider || !selectedModel) return;

            getSuggestions({
                data: {
                    // @ts-ignore theme is generated
                    shadcn: currentTheme || streamedData,
                    provider: selectedProvider,
                    model: selectedModel,
                },
            }).then(setAiSuggestions);
            setStreamedData(undefined);
        },
    });

    const handleSubmit = (message: PromptInputMessage, e: React.FormEvent) => {
        e.preventDefault();
        if (message.text.trim()) {
            sendMessage({ text: message.text });
            setInput('');
        }
    };

    useImperativeHandle(ref, () => ({
        resetChat: () => setMessages([]),
    }));

    useEffect(() => {
        const lastMessage = messages.at(-1);
        const lastPart = lastMessage?.parts.at(-1);

        if (lastPart?.type === 'data-theme' && streamedData?.id) {
            appendThemes(streamedData as RequiredDeep<ShadcnThemeStyles>);
            setCurrentTheme(streamedData as RequiredDeep<ShadcnThemeStyles>, false);
            setStreamedData(undefined);
        }
    }, [messages]);

    useEffect(() => {
        setIsGenerating(!!streamedData);
    }, [streamedData]);

    return (
        <div className="mx-auto relative flex flex-col justify-end size-full p-4">
            <div className="flex flex-col size-full">
                {!messages.length && (
                    <motion.div
                        className="flex flex-col justify-center sm:mx-8 gap-y-4 flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 ml-4">
                            <Logo className="size-6 text-primary" />
                            <p className="font-medium">What's on your mind?</p>
                        </div>
                        <div className="flex flex-col gap-y-1">
                            {suggestions?.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="p-2 text-left opacity-90 hover:text-primary cursor-pointer border-b"
                                    onClick={() => sendMessage({ text: suggestion })}
                                >
                                    <p className="text-xs">{suggestion}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <Conversation className="flex-1 h-full min-h-0">
                    <ConversationContent>
                        {messages.map((message, messageIndex) => (
                            <Fragment key={message.id}>
                                {message.parts.map((part, i) => {
                                    const isLastMessage = messageIndex === messages.length - 1;

                                    switch (part.type) {
                                        case 'reasoning':
                                            return (
                                                <Reasoning
                                                    key={`r-${message.id}-${i}`}
                                                    className="w-full"
                                                    isStreaming={
                                                        status === 'streaming' &&
                                                        i === message.parts.length - 1 &&
                                                        message.id === messages.at(-1)?.id
                                                    }
                                                >
                                                    <ReasoningTrigger />
                                                    <ReasoningContent>{part.text}</ReasoningContent>
                                                </Reasoning>
                                            );
                                        case 'text':
                                            return (
                                                <Fragment key={`${message.id}-${i}`}>
                                                    <Message from={message.role}>
                                                        <MessageContent>
                                                            <MessageResponse>
                                                                {part.text}
                                                            </MessageResponse>
                                                        </MessageContent>
                                                    </Message>
                                                    {message.role === 'assistant' &&
                                                        isLastMessage && (
                                                            <MessageActions>
                                                                <MessageAction
                                                                    onClick={() => regenerate()}
                                                                    label="Retry"
                                                                >
                                                                    <RefreshCcwIcon className="size-3" />
                                                                </MessageAction>
                                                                <MessageAction
                                                                    onClick={() => copy(part.text)}
                                                                    label="Copy"
                                                                >
                                                                    <CopyIcon className="size-3" />
                                                                </MessageAction>
                                                            </MessageActions>
                                                        )}
                                                </Fragment>
                                            );
                                        case 'tool-generateTheme':
                                            return (
                                                <ThemeTool
                                                    key={`${message.id}-${i}`}
                                                    streamedData={streamedData}
                                                    part={part}
                                                />
                                            );
                                        default:
                                            return <Fragment key={`${message.id}-${i}`} />;
                                    }
                                })}
                            </Fragment>
                        ))}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
                <ScrollArea>
                    <div className="flex flex-wrap gap-2">
                        {aiSuggestions?.map((suggestion, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="rounded-full cursor-pointer dark:bg-input dark:backdrop-blur-xl text-xs h-auto py-1 px-3"
                                onClick={() => sendMessage({ text: suggestion })}
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
                <PromptInput
                    multiple
                    globalDrop
                    className="mt-4 w-full mx-auto relative flex-col"
                    onSubmit={handleSubmit}
                >
                    <PromptInputTextarea
                        value={input}
                        placeholder="Say something..."
                        onChange={(e) => setInput(e.currentTarget.value)}
                        className="pr-12"
                    />
                    <PromptInputFooter>
                        <ProviderPicker />
                        <PromptInputSubmit
                            status={status === 'streaming' ? 'streaming' : 'ready'}
                            disabled={!input.trim() || !selectedModel || !selectedProvider}
                        />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    );
};
