import { Box, Text, useInput } from 'ink';
import { useMemo, useState, useEffect } from 'react';
import { useMenu } from '@/hooks/use-menu';
import type { MenuItem } from '@/hooks/use-menu';
import TextInput from 'ink-text-input';

export function Menu() {
    const { isOpen, title, items, mode, input, closeMenu } = useMenu();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');

    useInput((input, key) => {
        if (!isOpen) return;

        if (mode === 'items') {
            if (!items) return;

            if (key.return) {
                closeMenu();
                items[selectedIndex]?.onSelect();
            } else if (key.escape) {
                closeMenu();
            } else if (key.upArrow) {
                setSelectedIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
            } else if (key.downArrow) {
                setSelectedIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            setSelectedIndex(0);
            setInputValue('');
        }
    }, [isOpen, mode]);

    const visibleItems = useMemo(() => items?.slice(0, 12), [items]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (mode === 'input' && input) {
            closeMenu();
            input.onSubmit(inputValue);
        }
    };

    return (
        <Box
            position="absolute"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
        >
            <Box
                flexDirection="column"
                width={40}
                paddingX={2}
                paddingY={1}
                backgroundColor="#1b1b1b"
            >
                <Box marginBottom={1} marginLeft={2} justifyContent="space-between">
                    <Text bold color="#ffffff">
                        {title}
                    </Text>
                    <Text color="#666666">ESC</Text>
                </Box>
                {mode === 'items' && items ? (
                    <Box flexDirection="column">
                        {visibleItems?.map((item: MenuItem, index) => (
                            <Box key={index} justifyContent="space-between">
                                <Box>
                                    <Text color={index === selectedIndex ? '#ffffff' : '#888888'}>
                                        {index === selectedIndex ? '> ' : '  '}
                                        {item.label}
                                    </Text>
                                </Box>
                                <Box>
                                    {item.preview && (
                                        <Text dimColor color="#666666">
                                            {item.preview}
                                        </Text>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : mode === 'input' && input ? (
                    <Box gap={1}>
                        <Text>{'>'}</Text>
                        <Box>
                            {input.placeholder ? (
                                <TextInput
                                    mask="*"
                                    value={inputValue}
                                    onChange={setInputValue}
                                    onSubmit={handleSubmit}
                                    placeholder={input.placeholder}
                                />
                            ) : (
                                <TextInput
                                    value={inputValue}
                                    onChange={setInputValue}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </Box>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
