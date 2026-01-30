import { createGroq } from '@ai-sdk/groq';

export const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

const models = {
    base: groq('openai/gpt-oss-20b'),
    design: groq('moonshotai/kimi-k2-instruct-0905'),
    suggestion: groq('openai/gpt-oss-20b'),
};

export function getModel(modelKey: keyof typeof models) {
    return models[modelKey];
}
