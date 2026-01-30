import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { CheckIcon, ChevronDown, CopyIcon, MousePointerClickIcon, PlayIcon } from 'lucide-react';
import { clsx } from 'clsx';
import copy from 'copy-text-to-clipboard';
import { useState } from 'react';
import { Spinner } from './ui/spinner';
import { Shimmer } from './ai-elements/shimmer';
import { ColorPlaceholder } from './color-placeholder';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import type { RequiredDeep } from 'type-fest';
import type { DeepPartial } from 'ai';
import type { ChatMessage, ShadcnThemeStyles } from '@/lib/types';
import { displayColor, generateCode } from '@/lib/change-theme';
import { colorSegments, formatColorName, previewColors } from '@/lib/themes';
import { useThemes } from '@/hooks/use-themes';

export function ThemeTool({ part, streamedData }: {
    part: ChatMessage['parts'][number];
    streamedData?: DeepPartial<ShadcnThemeStyles>;
}) {
    if (part.type !== 'tool-generateTheme') return null;

    const { theme } = useTheme();
    const { colorMode, currentTheme, setCurrentTheme } = useThemes();
    const [isCopying, setIsCopying] = useState(false);
    const isStreaming = part.state !== 'output-available';
    const styles = part.output || streamedData;
    const isApplied = currentTheme?.id === styles?.id;
    const shadcnTheme = styles?.[theme === 'dark' ? 'dark' : 'light'];

    function handleCopy() {
        setIsCopying(true);
        copy(generateCode(styles as RequiredDeep<ShadcnThemeStyles>));

        setTimeout(() => setIsCopying(false), 3000);
    }

    return (
        <Collapsible>
            <div className="rounded-lg border bg-sidebar p-2 relative">
                {!!styles?.name && (
                    <motion.p
                        initial={{ y: 30 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="capitalize absolute text-xs -top-5 @sm/sidebar:left-4 left-2 -z-1 py-0.5 px-2 border bg-muted rounded-t-sm"
                    >
                        {styles?.name}
                    </motion.p>
                )}
                <div className="flex justify-between items-center">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex @sm/sidebar:gap-2 gap-1 p-2!">
                            {previewColors.map(key => (
                                <div
                                    key={key}
                                    style={{ backgroundColor: shadcnTheme?.[key] ?? 'transparent' }}
                                    className="rounded-md border size-5 flex items-center justify-center"
                                >
                                    {!shadcnTheme?.[key] && (
                                        <div className="size-full rounded-md bg-muted flex items-center justify-center">
                                            <ColorPlaceholder />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <ChevronDown className='transition-transform in-data-[state="open"]:rotate-180' size={16} />
                        </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-0.5">
                        <Button
                            className={clsx(isStreaming && 'pointer-events-none')}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setCurrentTheme(styles as RequiredDeep<ShadcnThemeStyles>);
                            }}
                            disabled={isApplied}
                        >
                            {isStreaming
                                ? (
                                        <>
                                            <Shimmer>Generating</Shimmer>
                                            <Spinner />
                                        </>
                                    )
                                : isApplied
                                    ? (
                                            <>
                                                Applied
                                                {' '}
                                                <MousePointerClickIcon />
                                            </>
                                        )
                                    : (
                                            <>
                                                Apply
                                                {' '}
                                                <PlayIcon />
                                            </>
                                        )}
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={isStreaming || isCopying}
                            onClick={handleCopy}
                        >
                            {isCopying ? <CheckIcon /> : <CopyIcon />}
                        </Button>
                    </div>
                </div>

                <CollapsibleContent>
                    <div className="my-4 mx-2 space-y-4 max-h-52 overflow-y-auto">
                        {Object.keys(colorSegments).map((key) => {
                            const displayedColors = colorSegments[key];
                            const isEmpty = displayedColors.every(color => !shadcnTheme?.[color]);

                            if (isEmpty) return null;

                            return (
                                <div key={key}>
                                    <h1 className="text-lg">{key}</h1>

                                    <div className="flex flex-wrap gap-3">
                                        {displayedColors.map((themeKey) => {
                                            const value = shadcnTheme?.[themeKey];

                                            if (!value) return null;

                                            const formattedValue = displayColor(value, colorMode);

                                            return (
                                                <div className="flex w-52 items-center gap-2 overflow-hidden text-ellipsis">
                                                    <div
                                                        style={{
                                                            backgroundColor: value,
                                                        }}
                                                        className="border-2 rounded-sm size-12 min-w-10"
                                                    />
                                                    <div className="space-y-0.5">
                                                        <h1 className="text-sm text-ellipsis">{formatColorName(themeKey)}</h1>
                                                        <div className="text-muted-foreground flex items-center gap-2">
                                                            <p className="text-xs font-mono">{formattedValue}</p>
                                                            <CopyIcon
                                                                size={16}
                                                                onClick={() => copy(formattedValue)}
                                                                className="hover:opacity-90 cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
