import { createFileRoute } from '@tanstack/react-router';
import { sendMessage } from '@/actions/send-message';

export const Route = createFileRoute('/api/chat')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const body = await request.json();
                return await sendMessage({ data: body });
            },
        },
    },
});
