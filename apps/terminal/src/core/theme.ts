import { kebabCase } from 'scule';
import type { DeepPartial } from 'ai';
import type { ShadcnThemeStyles } from '@palettecn/shared';
import type { ThemeUpdates } from './css';

function modeToVars(mode: DeepPartial<ShadcnThemeStyles['light']>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(mode)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [`--${kebabCase(k)}`, v as string]),
    );
}

export function themeToUpdates(theme: DeepPartial<ShadcnThemeStyles>): ThemeUpdates {
    return {
        ...(theme.light && { light: modeToVars(theme.light) }),
        ...(theme.dark && { dark: modeToVars(theme.dark) }),
    };
}
