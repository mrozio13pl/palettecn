import type { ProviderState, ProviderStateList } from '@/lib/types';
import { providers, type Provider } from '@palettecn/shared';
import { create } from 'zustand';

interface ProvidersState {
    providers: ProviderStateList;
    setProviders(providers: Partial<this['providers']>): void;
    updateProvider(provider: Provider, state: ProviderState): void;
    selectedModel?: string | null;
    setSelectedModel(
        selectedModel: this['selectedModel'],
        selectedProvider: this['selectedProvider'],
    ): void;
    selectedProvider?: Provider | null;
}

export const storage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },
};

export const useProviders = create<ProvidersState>((set) => ({
    providers: Object.fromEntries(
        providers.map((provider) => [provider, { isActive: false, models: [] }]),
    ) as any,
    setProviders(providers) {
        set((state) => ({
            providers: {
                ...state.providers,
                ...providers,
            },
        }));
    },
    updateProvider(provider, state) {
        set((prev) => {
            if (!prev.providers) return prev;

            return {
                providers: {
                    ...prev.providers,
                    [provider]: state,
                },
            };
        });
    },
    selectedModel: storage.getItem('selectedModel'),
    setSelectedModel(selectedModel, selectedProvider) {
        if (selectedModel) storage.setItem('selectedModel', selectedModel);
        if (selectedProvider) storage.setItem('selectedProvider', selectedProvider);

        set({ selectedModel, selectedProvider });
    },
    selectedProvider: storage.getItem('selectedProvider') as Provider | null,
}));
