import { z } from 'zod';

const color = z.string().describe('color in hex format');

/* in rem */
const radiusValue = z.string().regex(/^\d*\.?\d+rem$/, 'Invalid radius format (expected rem)');

export const shadcnThemeSchema = z.object({
    radius: radiusValue.describe('Border radius for rounded corners, in rem'),

    background: color.describe('Main background color of the application'),
    foreground: color.describe('Main foreground/text color'),

    card: color.describe('Background color of cards'),
    cardForeground: color.describe('Text/foreground color inside cards'),

    popover: color.describe('Background color of popovers'),
    popoverForeground: color.describe('Text color inside popovers'),

    primary: color.describe('Primary brand color'),
    primaryForeground: color.describe('Foreground/text color on primary elements'),

    secondary: color.describe('Secondary color for accents or buttons'),
    secondaryForeground: color.describe('Foreground/text color on secondary elements'),

    muted: color.describe('Muted background elements'),
    mutedForeground: color.describe('Foreground color for muted elements'),

    accent: color.describe('Accent color used for highlights'),
    accentForeground: color.describe('Text/foreground color on accent backgrounds'),

    destructive: color.describe('Destructive/error color, e.g., for delete actions'),

    border: color.describe('Default border color'),
    input: color.describe('Input field background color'),
    ring: color.describe('Focus ring color'),

    chart1: color.describe('Chart color 1'),
    chart2: color.describe('Chart color 2'),
    chart3: color.describe('Chart color 3'),
    chart4: color.describe('Chart color 4'),
    chart5: color.describe('Chart color 5'),

    sidebar: color.describe('Sidebar background color'),
    sidebarForeground: color.describe('Sidebar text/foreground color'),
    sidebarPrimary: color.describe('Sidebar primary highlight color'),
    sidebarPrimaryForeground: color.describe('Sidebar text color on primary highlight'),
    sidebarAccent: color.describe('Sidebar accent highlight color'),
    sidebarAccentForeground: color.describe('Sidebar text color on accent highlight'),
    sidebarBorder: color.describe('Sidebar border color'),
    sidebarRing: color.describe('Sidebar focus ring color'),
});

export const shadcnStylesSchema = z.object({
    id: z.string(),
    name: z.string().describe('A short name for the generated theme, capitalized'),
    dark: shadcnThemeSchema,
    light: shadcnThemeSchema,
    fontSans: z
        .string()
        .describe(
            'A valid google font id, e.g. "fira-code" best suitable for given theme, font ID, not name',
        ),
    fontSerif: z.string().describe('A valid google font id, best suitable for given theme'),
    fontMono: z.string().describe('A valid google font id, best suitable for given theme'),
});

export const textPartSchema = z.object({
    type: z.enum(['text']),
    text: z.string().min(1).max(2000),
});

export const filePartSchema = z.object({
    type: z.enum(['file']),
    mediaType: z.enum(['image/jpeg', 'image/png']),
    name: z.string().min(1).max(100),
    url: z.string().url(),
});

export const partSchema = z.union([textPartSchema, filePartSchema]);

export const userMessageSchema = z.object({
    id: z.string().uuid(),
    role: z.enum(['user']),
    parts: z.array(partSchema),
});

export const messageSchema = z.object({
    id: z.string(),
    role: z.string(),
    parts: z.array(z.any()),
});
