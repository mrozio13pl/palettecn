import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { createAnthropic, AnthropicProvider } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { createMoonshotAI, MoonshotAIProvider } from '@ai-sdk/moonshotai';
import { createZhipu, ZhipuProvider } from 'zhipu-ai-provider';
import { Provider } from '@palettecn/shared';

export function initProvider<T extends Provider>(
    providerType: T,
    apiKey: string,
): T extends 'chatgpt'
    ? OpenAIProvider
    : T extends 'claude'
      ? AnthropicProvider
      : T extends 'gemini'
        ? GoogleGenerativeAIProvider
        : T extends 'kimi'
          ? MoonshotAIProvider
          : T extends 'glm'
            ? ZhipuProvider
            : never {
    if (providerType === 'chatgpt') {
        return createOpenAI({ apiKey }) as any;
    }
    if (providerType === 'claude') {
        return createAnthropic({ apiKey }) as any;
    }
    if (providerType === 'gemini') {
        return createGoogleGenerativeAI({ apiKey }) as any;
    }
    if (providerType === 'kimi') {
        return createMoonshotAI({ apiKey }) as any;
    }
    if (providerType === 'glm') {
        return createZhipu({ apiKey, baseURL: 'https://api.z.ai/api/coding/paas/v4' }) as any;
    }

    throw new Error(`Unsupported provider: ${providerType}`);
}
