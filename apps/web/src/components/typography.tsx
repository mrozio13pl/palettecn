import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import fuzzysort from 'fuzzysort';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { FontCategory } from '@/lib/types';
import { loadFont, useFonts } from '@/hooks/use-fonts';
import { useThemes } from '@/hooks/use-themes';

const fontTypes: Record<FontCategory | 'all', string> = {
    all: 'All Fonts',
    display: 'Display',
    handwriting: 'Handwriting',
    monospace: 'Monospace',
    'sans-serif': 'Sans Serif',
    serif: 'Serif',
};

function FontPicker({
    font,
    onFontChange,
}: {
    font?: string;
    onFontChange: (font: string) => void;
}) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<FontCategory | 'all'>('all');
    const { loadedFonts, fonts } = useFonts();
    const hoverTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

    const filteredFonts = useMemo(() => {
        if (!fonts) return [];
        let searchedFonts = fonts;
        if (query.trim().length)
            searchedFonts = fuzzysort
                .go(query, fonts, { keys: ['id', 'family'] })
                .map(({ obj }) => obj);
        if (category !== 'all')
            searchedFonts = searchedFonts.filter(
                (searchedFont) => searchedFont.category === category,
            );
        return searchedFonts;
    }, [fonts, query, category]);

    const handleMouseEnter = (fontId: string, fontFamily: string) => {
        if (hoverTimeoutRef.current[fontId]) {
            clearTimeout(hoverTimeoutRef.current[fontId]);
        }

        hoverTimeoutRef.current[fontId] = setTimeout(() => {
            loadFont(fontId, fontFamily);
        }, 500);
    };

    const handleMouseLeave = (fontId: string) => {
        if (hoverTimeoutRef.current[fontId]) {
            clearTimeout(hoverTimeoutRef.current[fontId]);
            delete hoverTimeoutRef.current[fontId];
        }
    };

    useEffect(() => {
        return () => {
            Object.values(hoverTimeoutRef.current).forEach(clearTimeout);
        };
    }, []);

    if (!fonts) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="w-full justify-between" variant="outline">
                    {font ? (
                        fonts.find((f) => font === f.id)?.family
                    ) : (
                        <p className="text-muted-foreground">Select font</p>
                    )}
                    <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 space-y-2">
                <Input
                    placeholder="Search fonts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Select<FontCategory | 'all'> value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(fontTypes).map((type) => (
                            <SelectItem key={type} value={type}>
                                {fontTypes[type as FontCategory]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <ScrollArea className="h-80 space-y-1">
                    {filteredFonts?.map((fontItem) => (
                        <PopoverPrimitive.PopoverClose asChild key={fontItem.id}>
                            <Button
                                className="w-full flex-col items-start gap-y-0! h-auto"
                                variant="ghost"
                                onClick={() => {
                                    loadFont(fontItem.id, fontItem.family);
                                    onFontChange(fontItem.id);
                                }}
                                onMouseEnter={() => handleMouseEnter(fontItem.id, fontItem.family)}
                                onMouseLeave={() => handleMouseLeave(fontItem.id)}
                            >
                                <h3
                                    className="text-lg"
                                    style={{
                                        fontFamily: loadedFonts.has(fontItem.id)
                                            ? fontItem.family
                                            : undefined,
                                    }}
                                >
                                    {fontItem.family}
                                </h3>
                                <p className="text-muted-foreground text-xs font-normal">
                                    {fontItem.category}
                                </p>
                            </Button>
                        </PopoverPrimitive.PopoverClose>
                    ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

export function Typography() {
    const { themes, currentTheme, setThemes, setCurrentTheme } = useThemes();
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-y-4">
            <div className="space-y-1">
                <h4>Sans-Serif</h4>
                <FontPicker
                    font={currentTheme?.fontSans}
                    onFontChange={(font) => {
                        const newTheme = { ...currentTheme!, fontSans: font };
                        setCurrentTheme(newTheme);
                    }}
                />
            </div>
            <div className="space-y-1">
                <h4>Serif</h4>
                <FontPicker
                    font={currentTheme?.fontSerif}
                    onFontChange={(font) => {
                        const newTheme = { ...currentTheme!, fontSerif: font };
                        setCurrentTheme(newTheme);
                    }}
                />
            </div>
            <div className="space-y-1">
                <h4>Monospace</h4>
                <FontPicker
                    font={currentTheme?.fontMono}
                    onFontChange={(font) => {
                        const newTheme = { ...currentTheme!, fontMono: font };
                        setCurrentTheme(newTheme);
                    }}
                />
            </div>
            <div className="space-y-1">
                <h4>Border radius</h4>
                <div className="relative flex items-center">
                    <Input
                        type="number"
                        value={currentTheme?.[theme as 'dark' | 'light'].radius.replace('rem', '')}
                        className="pr-12"
                        onChange={(e) => {
                            const value = e.target.value;
                            setThemes(
                                themes.map((t) => {
                                    if (t.id === currentTheme?.id) {
                                        const newTheme = {
                                            ...t,
                                            dark: { ...t.dark, radius: value + 'rem' },
                                            light: { ...t.light, radius: value + 'rem' },
                                        };
                                        setCurrentTheme(newTheme);
                                        return newTheme;
                                    }
                                    return t;
                                }),
                            );
                        }}
                    />
                    <span className="absolute right-3 select-none text-sm font-medium text-muted-foreground pointer-events-none">
                        rem
                    </span>
                </div>
            </div>
        </div>
    );
}
