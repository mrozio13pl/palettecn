import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import langCss from 'shiki/langs/css.mjs';
import themeBlack from 'shiki/themes/vitesse-black.mjs';
import themeLight from 'shiki/themes/vitesse-light.mjs';
import { CopyCode } from './copy-code';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { generateCode } from '@/lib/change-theme';
import { useThemes } from '@/hooks/use-themes';

export function CodePreview() {
    const { theme } = useTheme();
    const { currentTheme, colorMode, setColorMode } = useThemes();
    const [html, setHtml] = useState<string>('');

    useEffect(() => {
        if (!currentTheme) return;

        const code = generateCode(currentTheme);

        const initShiki = async () => {
            const highlighter = await createHighlighterCore({
                themes: [themeBlack, themeLight],
                langs: [langCss],
                engine: createJavaScriptRegexEngine(),
            });

            const out = highlighter.codeToHtml(code, {
                lang: 'css',
                theme: theme === 'dark' ? 'vitesse-black' : 'vitesse-light',
            });

            setHtml(out);
            highlighter.dispose();
        };

        initShiki();
    }, [currentTheme, theme, colorMode]);

    if (!currentTheme) return null;

    return (
        <ScrollArea className="size-full relative pb-6">
            <div className="sticky top-2 w-full flex items-center gap-2 justify-end z-10 pr-4">
                <Select value={colorMode} onValueChange={setColorMode}>
                    <SelectTrigger className="uppercase backdrop-blur-md">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {['oklch', 'hex', 'rgb', 'hsl'].map(colorMode => (
                            <SelectItem key={colorMode} value={colorMode} className="uppercase">
                                {colorMode}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <CopyCode size="default" />
            </div>
            <div className="w-full sm:pb-20 mt-4 text-[13px] [&>pre]:px-4 [&>pre]:py-4 **:bg-transparent! [&>pre]:whitespace-pre-wrap [&>pre]:break-words" dangerouslySetInnerHTML={{ __html: html }} />
        </ScrollArea>
    );
}
