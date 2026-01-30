import { clsx } from 'clsx';
import { useTheme } from 'next-themes';
import type { ShadcnThemeStyles } from '@/lib/types';
import { previewColors } from '@/lib/themes';

export function ColorPreview({ theme: currentTheme }: { theme: ShadcnThemeStyles }) {
    const { theme } = useTheme();

    return (
        <>
            {previewColors.map((colorName, i) => (
                <div
                    key={colorName}
                    className={clsx('sm:size-6 size-4 border', i >= 3 && 'hidden sm:block')}
                    style={{ backgroundColor: currentTheme?.[theme === 'dark' ? 'dark' : 'light']?.[colorName] }}
                />
            ))}
            <h3 className="ml-2 font-semibold">{currentTheme?.name || 'Untitled'}</h3>
        </>
    );
}
