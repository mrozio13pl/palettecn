export const providers = ['claude', 'glm', 'gemini', 'chatgpt', 'kimi'] as const;

export type Provider = (typeof providers)[number];

export const providerDisplay: Record<Provider, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    glm: 'GLM',
    kimi: 'Kimi',
};
