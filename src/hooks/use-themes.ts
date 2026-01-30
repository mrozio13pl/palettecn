import { create } from 'zustand';
import type { ColorMode, ShadcnThemeStyles } from '@/lib/types';
import { db } from '@/lib/database';
import { defaultTheme } from '@/lib/themes';
import { applyTheme } from '@/lib/change-theme';

const filterById = <T extends { id: string }>(tab: Array<T>): Array<T> => {
    return [...new Map(tab.map(obj => [obj.id, obj])).values()];
};

interface ThemesState {
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
    currentTheme?: ShadcnThemeStyles;
    setCurrentTheme: (currentTheme: ShadcnThemeStyles, apply?: boolean, theme?: string) => void;
    themes: Array<ShadcnThemeStyles>;
    setThemes: (themes: this['themes']) => void;
    appendThemes: (theme: ShadcnThemeStyles) => void;
    colorMode: ColorMode;
    setColorMode: (colorMode: ColorMode) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
    initialized: boolean;
}

export const useThemes = create<ThemesState>(set => ({
    isGenerating: false,
    setIsGenerating(isGenerating) {
        set({ isGenerating });
    },
    isSidebarCollapsed: true,
    setIsSidebarCollapsed(isSidebarCollapsed) {
        set({ isSidebarCollapsed });
        db.preferences.put({ id: 'x', isSidebarCollapsed }).catch(console.error);
    },
    currentTheme: defaultTheme,
    themes: [defaultTheme],
    initialized: false,
    setCurrentTheme(currentTheme, apply = true, theme) {
        set({ currentTheme });
        db.currentTheme.put({ id: 'current', theme: currentTheme }).catch(console.error);
        if (apply) applyTheme(currentTheme, theme);
    },
    setThemes(themes) {
        const filtered = filterById(themes);
        set({ themes: filtered });
        db.themes.clear()
            .then(() => db.themes.bulkAdd(filtered))
            .catch(console.error);
    },
    appendThemes(theme) {
        set(({ themes }) => {
            const updated = filterById([...themes, theme]);
            db.themes.put(theme).catch(console.error);
            return { themes: updated };
        });
    },
    colorMode: 'oklch',
    setColorMode(colorMode) {
        set({ colorMode });
    },
}));
