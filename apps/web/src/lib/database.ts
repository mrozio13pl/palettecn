import Dexie from 'dexie';
import { defaultTheme } from './themes';
import { applyTheme } from './change-theme';
import type { Table } from 'dexie';
import type { ShadcnThemeStyles } from '@/lib/types';
import { useThemes } from '@/hooks/use-themes';

class ThemesDatabase extends Dexie {
    themes!: Table<ShadcnThemeStyles>;
    currentTheme!: Table<{ id: string; theme: ShadcnThemeStyles }>;
    preferences!: Table<{ id: 'x'; isSidebarCollapsed: boolean }>;

    constructor() {
        super('ThemesDatabase');
        this.version(1).stores({
            themes: 'id',
            currentTheme: 'id',
            preferences: 'id',
        });
    }
}

export const db = new ThemesDatabase();

const initializeFromDB = async () => {
    try {
        const themes = await db.themes.toArray();
        const currentThemeRecord = await db.currentTheme.get('current');
        const { isSidebarCollapsed } = (await db.preferences.get('x')) || {};

        const out: any = {
            themes: themes.length > 0 ? themes : [defaultTheme],
            currentTheme: currentThemeRecord?.theme || defaultTheme,
        };

        if (typeof isSidebarCollapsed !== 'undefined') {
            out.isSidebarCollapsed = isSidebarCollapsed;
        }

        return out;
    } catch (error) {
        console.error('Failed to load from IndexedDB:', error);
        return {
            themes: [defaultTheme],
            currentTheme: defaultTheme,
        };
    }
};

initializeFromDB().then((state) => {
    useThemes.setState({
        ...state,
        initialized: true,
    });
    applyTheme(state.currentTheme);
});
