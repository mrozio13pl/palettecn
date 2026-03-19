import { Box, Text } from '@/components/ink';
import { version } from '@/package.json';
import { useQuery } from '@tanstack/react-query';
import Spinner from 'ink-spinner';
import { useChatState } from '@/hooks/use-chat';
import type { UpdateFn } from '..';

export function Header({ updater }: { updater: UpdateFn }) {
    const {
        data: update,
        error: updateError,
        isLoading,
    } = useQuery({
        queryKey: ['update'],
        queryFn: updater,
    });
    const { status } = useChatState();

    return (
        <Box>
            <Box flexDirection="row" gap={1}>
                <Text>palettecn</Text>
                <Text color="#777">//</Text>
                <Text color="#777">v{version}</Text>
                {(isLoading && (
                    <Text color="#00FFFF">
                        <Text color="#00FFFF">Checking for updates</Text>
                        <Spinner type="simpleDots" />
                    </Text>
                )) ||
                    (!!status && (
                        <Text color="#00FFFF">
                            <Text color="#00FFFF">{status}</Text>
                            <Spinner type="simpleDots" />
                        </Text>
                    ))}
            </Box>
            {update && (
                <Text color="yellow">
                    ⚠ New ({update.type}) update available: {update.current} {'->'} {update.latest}
                </Text>
            )}
            {!!updateError && (
                <Text color="#FF00FF">❌ Couldn't fetch for updates: {updateError.message}</Text>
            )}
        </Box>
    );
}
