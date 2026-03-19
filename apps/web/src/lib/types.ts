export type {
    ChatMessage,
    ChatDataParts,
    ChatTools,
    ShadcnTheme,
    ShadcnThemeStyles,
} from '@palettecn/shared/types';

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
type FontStyle = 'normal' | 'italic';
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface GoogleFont {
    id: string;
    family: string;
    subsets: Array<string>;
    weights: Array<FontWeight>;
    styles: Array<FontStyle>;
    defSubset: string;
    variable: boolean;
    lastModified: string;
    category: FontCategory;
    license: string;
    type: 'google';
}

export type ColorMode = 'oklch' | 'hex' | 'hsl' | 'rgb';
