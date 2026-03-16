'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useThemes } from '@/hooks/use-themes';
import { clsx } from 'clsx';

const ThemeSwitch = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const { resolvedTheme, setTheme } = useTheme();
    const setCurrentTheme = useThemes((state) => state.setCurrentTheme);
    const [checked, setChecked] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    useEffect(() => setChecked(resolvedTheme === 'dark'), [resolvedTheme]);

    const handleCheckedChange = useCallback(
        (isChecked: boolean) => {
            const newTheme = isChecked ? 'dark' : 'light';
            setChecked(isChecked);
            setTheme(newTheme);
            setCurrentTheme(useThemes.getState().currentTheme!, true, newTheme);
        },
        [setTheme],
    );

    if (!mounted) return null;

    return (
        <div
            className={cn(
                'relative flex items-center justify-center', // center the whole control
                'h-7 w-14', // track sized to hug the icons
                className,
            )}
            {...props}
        >
            {/* The real shadcn Switch (full-size, same structure) */}
            <Switch
                checked={checked}
                onCheckedChange={handleCheckedChange}
                className={clsx(
                    // root (track)
                    'peer absolute inset-0 size-full min-w-14 min-h-7 rounded-full bg-input! transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    // tune the default thumb size & z-index so it slides over icons
                    '[&>span]:size-5! [&>span]:rounded-full [&>span]:bg-background [&>span]:shadow [&>span]:z-10',
                    // override default translate distances so the thumb moves across 20px track padding + icon spacing
                    'data-[state=unchecked]:[&>span]:translate-x-1.5',
                    'data-[state=checked]:[&>span]:translate-x-[28px]', // 44 ≈ w-20(80) - padding - thumb(28)
                )}
            />

            {/* Icons overlaid inside the track, perfectly centered left/right */}
            <span
                className={cn(
                    'pointer-events-none absolute left-2 inset-y-0 z-0',
                    'flex items-center justify-center',
                )}
            >
                <SunIcon
                    size={16}
                    className={cn(
                        'transition-all duration-200 ease-out',
                        checked ? 'text-muted-foreground/70' : 'text-foreground scale-110',
                    )}
                />
            </span>

            <span
                className={cn(
                    'pointer-events-none absolute right-2 inset-y-0 z-0',
                    'flex items-center justify-center',
                )}
            >
                <MoonIcon
                    size={16}
                    className={cn(
                        'transition-all duration-200 ease-out',
                        checked ? 'text-foreground scale-110' : 'text-muted-foreground/70',
                    )}
                />
            </span>
        </div>
    );
};

export default ThemeSwitch;
