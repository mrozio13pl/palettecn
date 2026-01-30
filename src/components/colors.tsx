import { useTheme } from 'next-themes';
import { ChevronDown, CopyIcon, PencilIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ColorPlaceholder } from './color-placeholder';
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection } from './ui/color-picker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useThemes } from '@/hooks/use-themes';
import { colorSegments, formatColorName } from '@/lib/themes';
import { displayColor } from '@/lib/change-theme';

export function Colors() {
    const { theme } = useTheme();
    const { colorMode, currentTheme, setCurrentTheme } = useThemes();
    const selectedTheme = currentTheme?.[theme === 'dark' ? 'dark' : 'light'];

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const onUpdate = (colorName: keyof NonNullable<typeof selectedTheme>, rgb: string) => {
        if (!currentTheme || !selectedTheme || selectedTheme[colorName] === rgb) return;

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (!currentTheme || !selectedTheme || selectedTheme[colorName] === rgb) return;

            const newTheme = currentTheme;

            newTheme[theme === 'dark' ? 'dark' : 'light'] = { ...selectedTheme, [colorName]: rgb };

            setCurrentTheme(newTheme);
        }, 250);
    };

    return (
        <div className="space-y-6 overflow-auto h-full pb-24">
            {Object.keys(colorSegments).map((segmentName) => {
                const colors = colorSegments[segmentName];

                return (
                    <div key={segmentName}>
                        <Collapsible className="border rounded-xl">
                            <CollapsibleTrigger className="p-4 in-data-[state='open']:border-b flex justify-between items-center font-bold w-full">
                                <p>{segmentName}</p>
                                <ChevronDown className='transition-transform in-data-[state="open"]:rotate-180' size={16} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 space-y-2">
                                {colors.map(color => (
                                    <div className="flex items-center gap-2" key={color}>
                                        <Popover>
                                            <PopoverTrigger>
                                                <div className="size-12 border-2 rounded-sm overflow-hidden">
                                                    <span className="text-muted-foreground size-full flex justify-center items-center" style={{ backgroundColor: selectedTheme?.[color] }}>
                                                        {!selectedTheme?.[color]
                                                            ? (
                                                                    <ColorPlaceholder className="size-6" />
                                                                )
                                                            : (
                                                                    <PencilIcon className="size-6" />
                                                                )}
                                                    </span>
                                                </div>
                                            </PopoverTrigger>
                                            {!!selectedTheme?.[color] && (
                                                <PopoverContent align="start" className="p-0">
                                                    <ColorPicker
                                                        className="w-full max-w-[300px] rounded-md border bg-background p-4 shadow-sm"
                                                        defaultValue={selectedTheme[color] || '#ffffff'}
                                                        onChange={rgb => onUpdate(color, rgb.toString())}
                                                    >
                                                        <ColorPickerSelection />
                                                        <div className="flex items-center gap-4">
                                                            {/* @ts-ignore experimental */}
                                                            {typeof EyeDropper !== 'undefined' && (
                                                                <ColorPickerEyeDropper />
                                                            )}
                                                            <div className="w-full grid gap-1">
                                                                <ColorPickerHue />
                                                                <ColorPickerAlpha />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <ColorPickerOutput />
                                                            <ColorPickerFormat />
                                                        </div>
                                                    </ColorPicker>
                                                </PopoverContent>
                                            )}
                                        </Popover>

                                        <div className="space-y-1">
                                            <h3>{formatColorName(color)}</h3>
                                            <div className="text-muted-foreground text-xs flex items-center gap-2">
                                                <p>{displayColor(selectedTheme?.[color] || '', colorMode)}</p>
                                                <CopyIcon className="size-3 hover:opacity-90 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                );
            })}
        </div>
    );
}
