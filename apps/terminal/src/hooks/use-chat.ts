import { SettingsStorage } from '@palettecn/local';
import {
    providers,
    type Provider,
    type ProviderState,
    type ProviderStateList,
} from '@palettecn/shared';
import { create } from 'zustand';

interface ChatState {
    status?: string;
    setStatus(status: string): void;
    removeStatus(): void;
    input: string;
    setInput(input: string): void;
    selectedProvider?: Provider;
    selectedModel?: string;
    setSelectedModel(selectedModel: string, selectedProvider: Provider): void;
    providers: ProviderStateList;
    setProviders(providers: Partial<ProviderStateList>): void;
    updateProvider(provider: Provider, state: ProviderState): void;
}

export const useChatState = create<ChatState>((set) => ({
    selectedProvider: SettingsStorage.data?.cli.selectedProvider!,
    selectedModel: SettingsStorage.data?.cli.selectedModel!,
    setStatus(status) {
        set({ status });
    },
    removeStatus() {
        set({ status: '' });
    },
    input: '',
    setInput(input) {
        set({ input });
    },
    setSelectedModel(selectedModel, selectedProvider) {
        SettingsStorage.save({ cli: { selectedModel, selectedProvider } });
        set({ selectedModel, selectedProvider });
    },
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
}));
