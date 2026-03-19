import { Box, type BoxProps, Text, type TextProps } from 'ink';
import type { ReactNode } from 'react';
import { darken, toHex } from 'color2k';
import { useMenu } from '@/hooks/use-menu';
import convert from 'color-convert';

function CustomText({ color, ...props }: TextProps) {
    const { isOpen } = useMenu();
    const hexColor = color?.startsWith('#') ? color : '#' + convert.keyword.hex(color || 'white');

    return <Text {...props} color={isOpen && hexColor ? toHex(darken(hexColor, 0.1)) : hexColor} />;
}

interface CustomBoxProps extends BoxProps {
    children: ReactNode;
}

function CustomBox({ backgroundColor, ...props }: CustomBoxProps) {
    const { isOpen } = useMenu();
    const hexColor =
        backgroundColor &&
        (backgroundColor?.startsWith('#')
            ? backgroundColor
            : '#' + convert.keyword.hex(backgroundColor));

    return (
        <Box
            {...props}
            backgroundColor={isOpen && hexColor ? toHex(darken(hexColor, 0.05)) : hexColor}
        />
    );
}

export { CustomText as Text, CustomBox as Box };
