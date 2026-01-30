import { create } from 'zustand';
import type { GoogleFont } from '@/lib/types';

interface FontState {
    fonts: Array<GoogleFont>;
    setFonts: (fonts: Array<GoogleFont>) => void;
    loadedFonts: Set<string>;
    setLoadedFonts: (loadedFonts: Set<string>) => void;
}

export const useFonts = create<FontState>(set => ({
    fonts: [],
    setFonts(fonts) {
        set({ fonts });
    },
    loadedFonts: new Set(),
    setLoadedFonts(loadedFonts) {
        set({ loadedFonts });
    },
}));

export const loadFont = (fontId: string, fontFamily: string) => {
    const state = useFonts.getState();
    if (!state.loadedFonts.has(fontId)) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        state.setLoadedFonts(new Set([...state.loadedFonts, fontId]));
    }
};
