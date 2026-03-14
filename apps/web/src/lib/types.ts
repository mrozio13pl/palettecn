import type { DeepPartial, InferUITool, UIMessage } from 'ai';
import type { generateThemeTool } from '@/lib/ai-tools/generate-theme';
import type { z } from 'zod';
import type { shadcnStylesSchema, shadcnThemeSchema } from '@/lib/schemas';
import type { Provider } from '@palettecn/shared';

export type ShadcnThemeStyles = z.infer<typeof shadcnStylesSchema>;
export type ShadcnTheme = z.infer<typeof shadcnThemeSchema>;

export type ChatTools = {
    generateTheme: InferUITool<ReturnType<typeof generateThemeTool>>;
};

export type ChatDataParts = {
    theme:
        | {
              status: 'streaming';
              styles: DeepPartial<ShadcnThemeStyles>;
          }
        | {
              status: 'streaming';
              styles: DeepPartial<ShadcnThemeStyles>;
          };
};

export type ChatMessage = UIMessage<
    {
        createdAt: string;
    },
    ChatDataParts,
    ChatTools
>;

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

export interface ModelInfo {
    id: string;
    name: string;
}

export type ProviderState =
    | {
          isActive: true;
          models: ModelInfo[];
      }
    | {
          isActive: false;
      };

export type ProviderStateList = Record<Provider, ProviderState>;
