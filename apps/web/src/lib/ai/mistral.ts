import type { ModelMessage } from 'ai';

// https://github.com/anomalyco/opencode/pull/2440/commits/b872227bfc67d91ca5a219c74e93ad10fb69b516
export function normalizeMistralToolCallIds(msgs: Array<ModelMessage>): Array<ModelMessage> {
    return msgs.map((msg) => {
        if ((msg.role === 'assistant' || msg.role === 'tool') && Array.isArray(msg.content)) {
            // @ts-expect-error
            msg.content = msg.content.map((part) => {
                if (
                    (part.type === 'tool-call' || part.type === 'tool-result') &&
                    'toolCallId' in part
                ) {
                    // Mistral requires alphanumeric tool call IDs with exactly 9 characters
                    const normalizedId = part.toolCallId
                        .replace(/[^a-zA-Z0-9]/g, '') // Remove non-alphanumeric characters
                        .substring(0, 9) // Take first 9 characters
                        .padEnd(9, '0'); // Pad with zeros if less than 9 characters

                    return {
                        ...part,
                        toolCallId: normalizedId,
                    };
                }
                return part;
            });
        }
        return msg;
    });
}
