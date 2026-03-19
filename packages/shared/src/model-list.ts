import { providerDisplay, type Provider } from './providers';
import type { ModelInfo, ProviderStateList } from './types';

export async function getProviderModels(loadedData: Partial<Record<Provider, string>>) {
    const providers: Partial<ProviderStateList> = {};
    const errorMessages: string[] = [];

    for (const provider of Object.keys(loadedData) as Provider[]) {
        try {
            const models = await getAvailableModels(provider, loadedData[provider]!);
            providers[provider] = {
                isActive: true,
                models,
            };
        } catch (error: any) {
            errorMessages.push(
                `Couldn't fetch model list for ${providerDisplay[provider]}, perhaps the API key is no longer valid? Error: ${error.message}`,
            );
        }
    }

    const result = { errorMessages, providers };

    return result;
}

export async function getAvailableModels(provider: Provider, apiKey: string): Promise<ModelInfo[]> {
    try {
        switch (provider) {
            case 'chatgpt':
                return fetchOpenAIModels(apiKey);
            case 'claude':
                return fetchAnthropicModels(apiKey);
            case 'gemini':
                return fetchGoogleModels(apiKey);
            case 'kimi':
                return fetchMoonshotModels(apiKey);
            case 'glm':
                return fetchZhipuModels(apiKey);
            default:
                return [];
        }
    } catch {
        return [];
    }
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.map((m: any) => ({
        id: m.id,
        name: m.id
            .split(/[-_]/)
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' '),
    }));
}

async function fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-03-14',
        },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.map((m: any) => ({
        id: m.id,
        name: m.display_name || m.id,
    }));
}

async function fetchGoogleModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.models.map((m: any) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name,
    }));
}

async function fetchMoonshotModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.moonshot.cn/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.map((m: any) => ({
        id: m.id,
        name: m.id,
    }));
}

async function fetchZhipuModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.z.ai/api/paas/v4/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
    }));
}
