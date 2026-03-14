import { Github } from '@lobehub/icons';
import { useTheme } from 'next-themes';
import { CloverIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { ParticleAnimation } from '../ui/particle-animation';
import { WordRotate } from '../ui/word-rotate';
import { Separator } from '../ui/separator';
import { useThemes } from '@/hooks/use-themes';
import { premadeThemes, previewColors } from '@/lib/themes';

export function LandingPage() {
    const { theme } = useTheme();
    const { appendThemes, setCurrentTheme, setIsSidebarCollapsed } = useThemes();

    return (
        <div className="relative size-full">
            <div className="size-full overflow-x-hidden -z-1 absolute left-0 bottom-0">
                <ParticleAnimation
                    particleCount={500}
                    colors={['#fff200', '#a855f7', '#f43f5e', '#22c55e']}
                    animationDuration={[1, 20]}
                    className="size-full sm:mt-0 -mt-200 opacity-20"
                />
            </div>
            <div className="flex items-center flex-col mt-24 gap-y-2">
                <h1 className="font-extrabold text-3xl sm:text-5xl sm:mr-8 inline text-center">
                    <WordRotate
                        duration={4000}
                        words={['Design', 'Create', 'Generate']}
                        className="sm:w-68 w-40 text-right"
                    />{' '}
                    <span className="text-primary mr-12 sm:mr-0">shadcn/ui</span> themes with{' '}
                    <span className="bg-primary text-primary-foreground px-2 rounded-sm">AI</span>
                </h1>
                <p className="text-muted-foreground text-center px-12 mt-4">
                    Build stunning shadcn themes using premade color palettes and AI. For free.
                </p>
                <div className="flex gap-2 [&_button]:px-8! mt-4">
                    <Button onClick={() => setIsSidebarCollapsed(false)} className="font-bold">
                        Get started
                    </Button>
                    <a href="https://github.com/mrozio13pl/palettecn">
                        <Button className="font-bold backdrop-blur-sm" variant="outline">
                            View on <Github />
                        </Button>
                    </a>
                </div>

                <div className="opacity-50 sm:w-xl w-3xs flex justify-center items-center [&_svg]:min-w-6 [&_svg]:fill-border text-border my-12">
                    <CloverIcon className="-rotate-135" />
                    <Separator className="py-px" />
                    <CloverIcon className="rotate-45" />
                </div>

                <div className="sm:px-20  flex justify-center">
                    <div className="max-w-5xl flex flex-wrap justify-center items-center gap-4">
                        {premadeThemes.map((premadeTheme) => (
                            <Button
                                key={premadeTheme.id}
                                size="sm"
                                className="opacity-80 hover:opacity-100 px-1.5"
                                style={{
                                    backgroundColor:
                                        premadeTheme[theme === 'dark' ? 'dark' : 'light']
                                            .background,
                                    color: premadeTheme[theme === 'dark' ? 'dark' : 'light']
                                        .foreground,
                                }}
                                onClick={() => {
                                    appendThemes(premadeTheme);
                                    setCurrentTheme(premadeTheme, true, theme);
                                }}
                            >
                                {previewColors.slice(0, 3).map((colorName) => (
                                    <div
                                        key={colorName}
                                        className="size-6 border rounded-sm"
                                        style={{
                                            backgroundColor:
                                                premadeTheme?.[
                                                    theme === 'dark' ? 'dark' : 'light'
                                                ]?.[colorName],
                                        }}
                                    />
                                ))}
                                <h3 className="ml-2 font-semibold">
                                    {premadeTheme?.name || 'Untitled'}
                                </h3>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
