import { withFullScreen } from 'fullscreen-ink';
import { Box } from '@/components/ink';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Header } from '@/ui/header';
import { Chat } from '@/ui/chat';
import { Menu } from '@/components/menu';
import { useChatState } from '@/hooks/use-chat';
import { useEffect } from 'react';
import { getProviderModels } from '@palettecn/shared';
import { ProvidersStorage } from '@palettecn/local';
import { Palettecn } from '@/core/palettecn';
import chalk from 'chalk';
import type { Update } from 'tiny-update-notifier';

export type UpdateFn = () => Promise<Update | false>;

const queryClient = new QueryClient();

function App({ updater }: { updater: UpdateFn }) {
    const { setStatus, removeStatus, setProviders } = useChatState();

    async function init() {
        setStatus('Loading models');
        const { providers } = await getProviderModels(ProvidersStorage.data);
        setProviders(providers);
        removeStatus();
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Box backgroundColor="#121212" flexDirection="column" width="100%" height="100%">
                <Box flexDirection="column" rowGap={1} width="100%" height="100%">
                    <Box width="100%">
                        <Header updater={updater} />
                    </Box>
                    <Chat />
                </Box>
                <Menu />
            </Box>
        </QueryClientProvider>
    );
}

export function initializeUi(cssPath: string | undefined, updater: UpdateFn) {
    new Palettecn(cssPath);
    withFullScreen(<App updater={updater} />).start();
}

process.once('uncaughtException', (error) => {
    console.error(chalk.red(`Something went wrong: ${chalk.bold(error.name)}\n\n${error.message}`));
});
