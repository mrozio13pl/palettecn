import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import '../global.css';
import '@fontsource-variable/inter/index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import appCss from '../global.css?url';
import { useDynamicFavicon } from '@/hooks/use-favicon';
import { getProviderData } from '@/actions/get-providers';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProviders } from '@/hooks/use-providers';

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'palettecn - theme generator for shadcn/ui',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.svg',
            },
        ],
    }),
    shellComponent: RootDocument,
    loader: async () => {
        return await getProviderData();
    },
});

const queryClient = new QueryClient();

function RootDocument({ children }: { children: React.ReactNode }) {
    const { setProviders } = useProviders();
    const { errorMessages, providers } = Route.useLoaderData();

    useDynamicFavicon();

    useEffect(() => {
        for (const errorMessage of errorMessages) {
            toast.warning(errorMessage, {
                duration: 10_000,
            });
        }
    }, [errorMessages]);

    useEffect(() => {
        setProviders(providers);
    }, [providers]);

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <Toaster />
                <ThemeProvider attribute="class">
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </ThemeProvider>
                <TanStackDevtools
                    config={{
                        position: 'bottom-right',
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
