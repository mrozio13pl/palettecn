import type { Provider } from './providers';
import type { DeepPartial, InferUITool, UIMessage } from 'ai';
import type { generateThemeTool } from './ai-tools/generate-theme';
import type { z } from 'zod';
import type { shadcnStylesSchema, shadcnThemeSchema } from './schemas';

export interface ModelInfo {
    id: string;
    name: string;
}

export type ProviderState =
    | {
          isActive: true;
          models: Array<ModelInfo>;
      }
    | {
          isActive: false;
      };

export type ProviderStateList = Record<Provider, ProviderState>;

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
              status: 'done';
              styles: ShadcnThemeStyles;
          };
};

export type ChatMessage = UIMessage<
    {
        createdAt: string;
    },
    ChatDataParts,
    ChatTools
>;
