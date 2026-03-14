import type { Provider } from '@palettecn/shared';
import type { ModelInfo } from '../types';

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
