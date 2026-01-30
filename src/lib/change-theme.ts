import { kebabCase } from 'scule';
import convert from 'color-convert';
import type { ColorMode, ShadcnThemeStyles } from './types';
import type { DeepPartial } from 'ai';
import { loadFont, useFonts } from '@/hooks/use-fonts';
import { useThemes } from '@/hooks/use-themes';

export function displayColor(color: string, mode: ColorMode) {
    if (color.endsWith('rem')) return color;

    switch (mode) {
        case 'oklch':
            return `oklch(${convert.hex.lch(color)})`;
        case 'hex':
            return color;
        case 'hsl':
            return `hsl(${convert.hex.hsl(color)})`;
        case 'rgb':
            return `rgb(${convert.hex.rgb(color)})`;
    }
}

export function generateCode(theme: ShadcnThemeStyles, includeTailwind = true) {
    const { fonts } = useFonts.getState();
    const { currentTheme, colorMode } = useThemes.getState();
    const fontSans = fonts.find(font => currentTheme?.fontSans === font.id);
    const fontSerif = fonts.find(font => currentTheme?.fontSerif === font.id);
    const fontMono = fonts.find(font => currentTheme?.fontMono === font.id);

    let code = `
:root {
  ${Object.keys(theme?.light || {}).map(key =>
        `--${kebabCase(key)}: ${displayColor(theme.light[key as keyof typeof theme.light], colorMode)};`,
    ).join('\n  ')}
}

.dark {
  ${Object.keys(theme?.dark || {}).map(key =>
        `--${kebabCase(key)}: ${displayColor(theme.dark[key as keyof typeof theme.dark], colorMode)};`,
    ).join('\n  ')}
}`;

    if (includeTailwind) {
        code = `
@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --font-sans: ${fontSans?.family || 'Inter'}, sans-serif;
  --font-serif: ${fontSerif?.family || 'ui-serif'}, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ${fontMono?.family || 'monospace'};
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  }\n` + code;
    }

    return code.trimStart();
}

function addStyle(prop: string, value: string) {
    prop = `--${kebabCase(prop)}`;
    if (document.documentElement.style.getPropertyValue(prop) === value) return;
    document.documentElement.style.setProperty(prop, value);
}

let previousTheme: string | undefined;

export function applyTheme(combinedTheme: DeepPartial<ShadcnThemeStyles> = {}, webTheme = previousTheme) {
    console.log(combinedTheme);
    const { fonts } = useFonts.getState();
    previousTheme = webTheme === 'dark' ? 'dark' : 'light';
    const theme = combinedTheme[previousTheme as keyof typeof combinedTheme] || {};
    // const css = generateCode(combinedTheme, false);

    for (const prop of Object.keys(theme)) {
        addStyle(prop, theme[prop as keyof typeof theme]);
    }

    const others = ['fontMono', 'fontSans', 'fontSerif'] as const;

    for (const prop of others) {
        const value = combinedTheme?.[prop];

        const font = fonts.find(font => value === font.id);

        if (!font) {
            document.documentElement.style.removeProperty(`--${kebabCase(prop)}`);
            continue;
        }

        loadFont(font.id, font.family);
        addStyle(prop, font.family);
    }
}
