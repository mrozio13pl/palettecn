import { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { useTheme } from 'next-themes';
import { useThemes } from './use-themes';
import Logo from '@/logo.svg?react';

export const useDynamicFavicon = () => {
    const { theme } = useTheme();
    const { initialized, currentTheme, themes } = useThemes();

    useEffect(() => {
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim();

        const svgString = renderToString(
            <Logo style={{ color: primaryColor }} width="32" height="32" />,
        );

        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }

        link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    }, [theme, themes, currentTheme, initialized]);
};
