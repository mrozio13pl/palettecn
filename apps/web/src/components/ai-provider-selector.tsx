import { Claude, Gemini, type IconType, Kimi, OpenAI, ZAI } from '@lobehub/icons';
import { type Provider, providerDisplay, providers } from '@palettecn/shared';
import { useMemo, useState } from 'react';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from './ui/menu';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Field, FieldError } from './ui/field-1';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import { submitApiKey } from '@/actions/submit-key';
import { useProviders } from '@/hooks/use-providers';
import { toast } from 'sonner';
import { CheckIcon, ChevronUp } from 'lucide-react';

const PROVIDER_ICONS: Record<Provider, IconType> = {
    chatgpt: OpenAI,
    claude: Claude,
    gemini: Gemini,
    glm: ZAI,
    kimi: Kimi,
} as const;

export function ProviderPicker() {
    const [tokenDialogState, setTokenDialogState] = useState<Provider>();
    const {
        providers: providersState,
        updateProvider,
        selectedModel,
        setSelectedModel,
    } = useProviders();

    const {
        mutate: submitKey,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationKey: ['submitApiKey', tokenDialogState],
        mutationFn: async (apiKey: string) => {
            if (!tokenDialogState) return;

            const { models } = await submitApiKey({
                data: {
                    apiKey,
                    provider: tokenDialogState,
                },
            });

            updateProvider(tokenDialogState, {
                isActive: true,
                models,
            });

            setTokenDialogState(undefined);
            toast(`API key for ${providerDisplay[tokenDialogState]} saved.`);
        },
        retry: 1,
    });

    const selectedModelInfo = useMemo(() => {
        const providerList = Object.keys(providersState);

        if (!providerList.length) return;

        for (const provider of providerList) {
            const providerState = providersState[provider as keyof typeof providersState];

            if (providerState.isActive) {
                const foundModel = providerState.models.find((model) => model.id === selectedModel);

                if (foundModel) return foundModel;
            }
        }
    }, [providersState]);

    return (
        <>
            <Dialog
                open={!!tokenDialogState}
                onOpenChange={(open: boolean) =>
                    setTokenDialogState((prev) => (open ? prev : undefined))
                }
            >
                <DialogContent>
                    <DialogTitle>Setup {providerDisplay[tokenDialogState!]}</DialogTitle>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            const formData = new FormData(event.target);
                            const apiKey = formData.get('apiKey') as string;

                            submitKey(apiKey);
                        }}
                        className="size-full space-y-2"
                    >
                        <Field data-invalid={isError}>
                            <Input
                                id="apiKey"
                                name="apiKey"
                                type="password"
                                placeholder="API key"
                                aria-invalid={isError}
                                disabled={isPending}
                                required
                            />
                            {isError && <FieldError>{error.message}</FieldError>}
                        </Field>
                        <Button type="submit" className="w-full" disabled={isPending}>
                            Submit
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Menubar asChild>
                <MenubarMenu>
                    <MenubarTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center gap-x-1">
                            {selectedModelInfo ? selectedModelInfo.name : 'Select model'}
                            <ChevronUp size={16} />
                        </Button>
                    </MenubarTrigger>
                    <MenubarContent>
                        {providers.map((provider) => {
                            const Icon = PROVIDER_ICONS[provider];
                            const displayName = providerDisplay[provider];
                            const providerState = providersState?.[provider];

                            return (
                                <MenubarSub key={provider}>
                                    <MenubarSubTrigger className="capitalize space-x-1">
                                        <Icon />
                                        {displayName}
                                    </MenubarSubTrigger>
                                    <MenubarSubContent>
                                        {providerState?.isActive ? (
                                            <>
                                                {providerState.models
                                                    .toReversed()
                                                    .map((model, index) => (
                                                        <MenubarItem
                                                            key={index}
                                                            onClick={() =>
                                                                setSelectedModel(model.id, provider)
                                                            }
                                                        >
                                                            {model.name}
                                                            {model.id === selectedModel && (
                                                                <MenubarShortcut>
                                                                    <CheckIcon size={16} />
                                                                </MenubarShortcut>
                                                            )}
                                                        </MenubarItem>
                                                    ))}
                                                <MenubarItem
                                                    onClick={() => setTokenDialogState(provider)}
                                                >
                                                    Edit {displayName}{' '}
                                                    <MenubarShortcut>API KEY</MenubarShortcut>
                                                </MenubarItem>
                                            </>
                                        ) : (
                                            <MenubarItem
                                                onClick={() => setTokenDialogState(provider)}
                                            >
                                                Setup {displayName}{' '}
                                                <MenubarShortcut>API KEY</MenubarShortcut>
                                            </MenubarItem>
                                        )}
                                    </MenubarSubContent>
                                </MenubarSub>
                            );
                        })}
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </>
    );
}
