import { createFileRoute } from '@tanstack/react-router';
import {
    ArrowLeft,
    ArrowRight,
    Code2Icon,
    PaletteIcon,
    PanelLeftIcon,
    PencilIcon,
    PlusIcon,
    ScanEyeIcon,
    Settings2Icon,
    SparkleIcon,
    Trash2Icon,
    TypeOutlineIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import Logo from '../logo.svg?react';
import type { GoogleFont } from '@/lib/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Chat } from '@/components/chat';
import ThemeSwitch from '@/components/ui/theme-switch';
import { CodePreview } from '@/components/code';
import { Button } from '@/components/ui/button';
import { useThemes } from '@/hooks/use-themes';
import { defaultTheme, defaultThemeId } from '@/lib/themes';
import { applyTheme } from '@/lib/change-theme';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CopyCode } from '@/components/copy-code';
import { GhostTabsTrigger } from '@/components/ui/tab-trigger';
import { Preview } from '@/components/preview';
import { Typography } from '@/components/typography';
import { useFonts } from '@/hooks/use-fonts';
import { Colors } from '@/components/colors';
import { ColorPreview } from '@/components/color-preview';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

export const Route = createFileRoute('/')({ component: App });

function Sidebar() {
    const chatRef = useRef<{ resetChat: () => void }>(null);
    const { theme } = useTheme();
    const { themes, currentTheme, setCurrentTheme } = useThemes();
    const currentThemeIndex = useMemo(
        () => themes.findIndex((_theme) => _theme.id === currentTheme?.id),
        [currentTheme, theme],
    );

    return (
        <div className="size-full flex flex-col">
            <div className="h-16 sm:flex justify-between border-b hidden">
                <div className="flex items-center gap-2 p-4">
                    <Logo className="size-6 text-primary" />
                    <h1 className="font-bold text-sm select-none">palettecn</h1>
                </div>

                <div className="flex [&_button]:cursor-pointer [&_button]:rounded-none [&_button]:p-4 [&_button]:border-l [&_button]:h-full [&_button]:w-16">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const prev = themes[currentThemeIndex - 1];
                            setCurrentTheme(prev);
                        }}
                        disabled={currentThemeIndex === 0}
                    >
                        <ArrowLeft />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const next = themes[currentThemeIndex + 1];
                            setCurrentTheme(next);
                        }}
                        disabled={
                            currentThemeIndex >= themes.length - 1 || currentThemeIndex === -1
                        }
                    >
                        <ArrowRight />
                    </Button>
                    <Button variant="ghost" onClick={() => chatRef.current?.resetChat()}>
                        <PlusIcon />
                    </Button>
                </div>
            </div>

            <Tabs className="flex-1 flex-col flex min-h-0" defaultValue="ai">
                <TabsList className="mb-4 sm:mt-4 px-2 w-full bg-transparent!">
                    <GhostTabsTrigger value="colors">
                        <PaletteIcon />
                        Colors
                    </GhostTabsTrigger>
                    <GhostTabsTrigger value="fonts">
                        <TypeOutlineIcon />
                        Typography
                    </GhostTabsTrigger>
                    <GhostTabsTrigger value="ai">
                        <SparkleIcon />
                        Generate
                    </GhostTabsTrigger>
                    <GhostTabsTrigger value="code">
                        <Code2Icon />
                        Code
                    </GhostTabsTrigger>
                </TabsList>
                <TabsContent
                    forceMount
                    className="hidden w-full flex-1 min-h-0 data-[state=active]:flex flex-col m-0 border-none"
                    value="ai"
                >
                    <Chat ref={chatRef} />
                </TabsContent>
                <TabsContent className="flex flex-col m-0 border-none size-full" value="code">
                    <CodePreview />
                </TabsContent>
                <TabsContent className="flex flex-col border-none size-full px-6" value="fonts">
                    <Typography />
                </TabsContent>
                <TabsContent className="flex flex-col border-none size-full px-6" value="colors">
                    <Colors />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PreviewComponent() {
    const {
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        themes,
        currentTheme,
        setCurrentTheme,
        setThemes,
    } = useThemes();

    return (
        <>
            <header className="size-full p-4 border-b h-16 -mt-2 sm:mt-0 flex items-center justify-between bg-background/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    {isSidebarCollapsed && <Logo className="size-6 text-primary" />}

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-primary sm:flex hidden"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <PanelLeftIcon />
                    </Button>

                    <Select
                        value={currentTheme?.id}
                        onValueChange={(id) => {
                            const selected = themes.find((t) => t.id === id);
                            if (selected) {
                                setCurrentTheme(selected);
                            }
                        }}
                    >
                        <SelectTrigger className="w-auto border-none shadow-none focus:ring-0 sm:[&_h3]:block [&_h3]:hidden">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {themes
                                .filter((theme) => Boolean(theme?.id))
                                .map((theme) => (
                                    <SelectItem key={theme.id} value={theme.id}>
                                        <ColorPreview theme={theme} />
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <Dialog>
                        <DialogTrigger>
                            <Button size="icon" variant="ghost">
                                <PencilIcon />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Edit name</DialogTitle>
                            <DialogDescription>Edit the name of the theme</DialogDescription>
                            <Input
                                placeholder="Untitled"
                                value={themes.find((theme) => theme.id === currentTheme?.id)?.name}
                                onChange={(e) => {
                                    setThemes(
                                        themes.map((theme) => {
                                            if (theme.id === currentTheme?.id) {
                                                return { ...currentTheme, name: e.target.value };
                                            }
                                            return theme;
                                        }),
                                    );
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                            const index = themes.findIndex(
                                (theme) => theme.id === currentTheme?.id,
                            );
                            setThemes(themes.filter((_, i) => index !== i));
                            const updatedThemes = useThemes.getState().themes;

                            if (updatedThemes.length === 0) {
                                setThemes([defaultTheme]);
                                setCurrentTheme(defaultTheme);
                            } else {
                                setCurrentTheme(updatedThemes[Math.max(0, index - 1)]);
                            }
                        }}
                        disabled={
                            themes.length <= 1 &&
                            !themes.some((theme) => theme.id !== defaultThemeId)
                        }
                    >
                        <Trash2Icon />
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <CopyCode className="sm:flex hidden" />
                    <ThemeSwitch />
                </div>
            </header>
            <div className="size-full p-2">
                <Preview />
            </div>
        </>
    );
}

function App() {
    const { theme } = useTheme();
    const { setFonts } = useFonts();
    const { initialized, isSidebarCollapsed, currentTheme } = useThemes();
    const isMobile = useIsMobile();

    useQuery({
        queryKey: ['fonts'],
        queryFn: async () => {
            const res = await fetch('https://api.fontsource.org/v1/fonts');
            const json = (await res.json()) as Array<GoogleFont>;
            setFonts(json);
        },
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (currentTheme) {
            applyTheme(currentTheme, theme);
        }
    }, [currentTheme, theme]);

    if (!initialized) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner className="size-12" />
            </div>
        );
    }

    if (isMobile) {
        return (
            <Tabs defaultValue="editor" className="size-full">
                <TabsList className="bg-transparent! w-full">
                    <GhostTabsTrigger value="editor">
                        <Settings2Icon />
                        Edit
                    </GhostTabsTrigger>
                    <GhostTabsTrigger value="preview">
                        <ScanEyeIcon />
                        Preview
                    </GhostTabsTrigger>
                </TabsList>
                <Separator />
                <TabsContent value="editor" className="w-full @container/sidebar">
                    <Sidebar />
                </TabsContent>
                <TabsContent value="preview" className="w-full @container">
                    <PreviewComponent />
                </TabsContent>
            </Tabs>
        );
    }

    return (
        <div className="size-full">
            <ResizablePanelGroup orientation="horizontal" className="isolate">
                {!isSidebarCollapsed && (
                    <ResizablePanel defaultSize={25} minSize={400} maxSize="50%">
                        <Sidebar />
                    </ResizablePanel>
                )}
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <PreviewComponent />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
