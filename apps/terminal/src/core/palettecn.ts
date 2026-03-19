import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MissingComponentsJsonError } from './error';
import { updateCssVariables, type ThemeUpdates } from './css';
import { themeToUpdates } from './theme';
import type { ShadcnThemeStyles } from '@palettecn/shared';
import type { DeepPartial } from 'ai';

export class Palettecn {
    public static instance: Palettecn;
    public readonly cssPath: string;
    public get cssPathBackup() {
        return this.cssPath + '.backup';
    }

    public constructor(cssPath?: string) {
        this.cssPath = cssPath ?? this.readGlobalsFromConfig();
        Palettecn.instance = this;
    }

    public applyThemeStyles(theme: DeepPartial<ShadcnThemeStyles>): void {
        this.applyTheme(themeToUpdates(theme));
    }

    public applyTheme(updates: ThemeUpdates) {
        this.createBackup();
        const css = readFileSync(this.cssPath, 'utf-8');
        const updated = updateCssVariables(css, updates);
        writeFileSync(this.cssPath, updated, 'utf-8');
    }

    public createBackup() {
        if (existsSync(this.cssPathBackup)) return;
        copyFileSync(this.cssPath, this.cssPathBackup);
    }

    public restoreBackup() {
        if (!existsSync(this.cssPathBackup)) return;
        copyFileSync(this.cssPathBackup, this.cssPath);
    }

    // https://ui.shadcn.com/docs/components-json
    private readGlobalsFromConfig() {
        const componentsPath = join(process.cwd(), 'components.json');
        if (!existsSync(componentsPath)) {
            throw new MissingComponentsJsonError();
        }
        const componentsJson = JSON.parse(readFileSync(componentsPath, 'utf-8'));
        return componentsJson.tailwind.css as string;
    }
}
