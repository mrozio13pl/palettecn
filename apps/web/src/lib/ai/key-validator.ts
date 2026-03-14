import { generateText, type LanguageModel } from 'ai';
import type { Provider } from '@palettecn/shared';
import { initProvider } from './initialize-provider';

export async function validateApiKey(providerType: Provider, apiKey: string): Promise<boolean> {
    try {
        let model: LanguageModel;
        const provider = initProvider(providerType, apiKey);

        switch (providerType) {
            case 'chatgpt':
                model = provider('gpt-4o-mini');
                break;
            case 'claude':
                model = provider('claude-3-haiku-20240307');
                break;
            case 'gemini':
                model = provider('gemini-1.5-flash');
                break;
            case 'kimi':
                model = provider('moonshot-v1-8k');
                break;
            case 'glm':
                model = provider('glm-4.5-flash');
                break;
            default:
                return false;
        }

        await generateText({
            model,
            prompt: 'ping',
            maxOutputTokens: 1,
        });

        return true;
    } catch (error: any) {
        console.error(`Validation failed for ${providerType}:`, error.message);
        return false;
    }
}
