import { renderToStaticMarkup } from 'react-dom/server';
import { createFileRoute } from '@tanstack/react-router';
import Logo from '@/logo.svg?react';

export const Route = createFileRoute('/favicon.svg')({
    server: {
        handlers: {
            GET: async () => {
                const svgString = renderToStaticMarkup(
                    <Logo style={{ color: 'white' }} width="32" height="32" />,
                );

                return new Response(svgString, {
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            },
        },
    },
});
