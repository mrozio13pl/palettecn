import { Box, Text } from '@/components/ink';
import { useChatState } from '@/hooks/use-chat';
import TextInput from 'ink-text-input';
import { MenuItem, useMenu } from '@/hooks/use-menu';
import { useInput } from 'ink';
import {
    getAvailableModels,
    ModelInfo,
    Provider,
    providerDisplay,
    providers,
} from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';
import { Palettecn } from '@/core/palettecn';

export function Input({ onSubmit }: { onSubmit(): void }) {
    const {
        providers: providersState,
        input,
        setInput,
        selectedProvider,
        selectedModel,
        setSelectedModel,
    } = useChatState();
    const { isOpen, setMenu, setInput: setMenuInput } = useMenu();

    function connectProvider() {
        setMenu({
            title: 'Connect provider',
            items: providers.map((provider) => ({
                label: providerDisplay[provider],
                onSelect: () =>
                    setMenuInput({
                        title: `Connect ${providerDisplay[provider]}`,
                        placeholder: 'API KEY',
                        onSubmit(apiKey) {
                            const storedProviders = ProvidersStorage.data;

                            ProvidersStorage.save({
                                ...storedProviders,
                                [provider]: apiKey,
                            });

                            getAvailableModels(provider, apiKey).then((models) => {
                                selectModel(provider, models);
                            });
                        },
                    }),
                value: provider,
            })),
        });
    }

    function selectProvider() {
        setMenu({
            title: 'Select provider',
            items: Object.keys(ProvidersStorage.data).map((provider) => ({
                label: providerDisplay[provider as Provider],
                onSelect() {
                    const providerInfo = providersState[provider as Provider];

                    if (providerInfo.isActive) {
                        selectModel(provider as Provider, providerInfo.models);
                    }
                },
            })),
        });
    }

    function selectModel(provider: Provider, models: ModelInfo[]) {
        setMenu({
            title: 'Select model',
            items: models.map((model) => ({
                label: model.name,
                onSelect() {
                    setSelectedModel(model.id, provider);
                },
            })),
        });
    }

    useInput((input, key) => {
        if (key.ctrl && input === 'k') {
            const items: MenuItem[] = [
                {
                    label: 'Connect provider',
                    onSelect: connectProvider,
                },
                {
                    label: 'Restore backup',
                    onSelect: Palettecn.instance.restoreBackup,
                },
                {
                    label: 'Quit',
                    onSelect: process.exit,
                    preview: 'ctrl + c',
                },
            ];

            if (ProvidersStorage.data) {
                items.unshift({
                    label: 'Select provider',
                    onSelect: selectProvider,
                    preview: 'ctrl + p',
                });
            }

            setMenu({
                title: 'Command palette',
                items,
            });
            setInput(input.slice(0, -1));
        }
    });

    return (
        <Box
            width="100%"
            paddingY={1}
            paddingX={3}
            backgroundColor="#232323"
            flexDirection="column"
        >
            <Box width="100%" paddingBottom={1} flexDirection="column">
                <TextInput
                    placeholder="Imagine your theme..."
                    value={input}
                    onChange={setInput}
                    onSubmit={onSubmit}
                    focus={!isOpen}
                />
            </Box>
            <Box flexDirection="row" columnGap={2}>
                {selectedModel && selectedProvider ? (
                    <Box flexDirection="row" columnGap={1}>
                        <Text>{selectedModel}</Text>
                        <Text color="gray">{providerDisplay[selectedProvider]}</Text>
                    </Box>
                ) : (
                    <Text color="gray">No model selected</Text>
                )}
                <Box flexDirection="row" columnGap={1}>
                    <Text>ctrl + k</Text>
                    <Text color="gray">commands</Text>
                </Box>
            </Box>
        </Box>
    );
}
