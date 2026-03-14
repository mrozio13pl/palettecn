import { Slider } from 'radix-ui';
import Color from 'color';
import convert from 'color-convert';
import { PipetteIcon } from 'lucide-react';
import { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ColorPickerContextValue {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
    mode: string;
    setHue: (hue: number) => void;
    setSaturation: (saturation: number) => void;
    setLightness: (lightness: number) => void;
    setAlpha: (alpha: number) => void;
    setMode: (mode: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined);

const { Range, Root, Thumb, Track } = Slider;

export const useColorPicker = () => {
    const context = use(ColorPickerContext);

    if (!context) {
        throw new Error('useColorPicker must be used within a ColorPickerProvider');
    }

    return context;
};

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    value?: Parameters<typeof Color>[0];
    defaultValue?: Parameters<typeof Color>[0];
    onChange?: (value: Parameters<typeof Color.rgb>[0]) => void;
};

export const ColorPicker = ({
    value,
    defaultValue = '#000000',
    onChange,
    className,
    ...props
}: ColorPickerProps) => {
    const selectedColor = Color(value);
    const defaultColor = Color(defaultValue);

    const [hue, setHue] = useState(selectedColor.hue() || defaultColor.hue() || 0);
    const [saturation, setSaturation] = useState(
        selectedColor.saturationl() || defaultColor.saturationl() || 100,
    );
    const [lightness, setLightness] = useState(
        selectedColor.lightness() || defaultColor.lightness() || 50,
    );
    const [alpha, setAlpha] = useState(selectedColor.alpha() * 100 || defaultColor.alpha() * 100);
    const [mode, setMode] = useState('hex');

    // Update color when controlled value changes
    useEffect(() => {
        if (value) {
            const color = Color.rgb(value).rgb().object();

            setHue(color.r);
            setSaturation(color.g);
            setLightness(color.b);
            setAlpha(color.a);
        }
    }, [value]);

    // Notify parent of changes
    useEffect(() => {
        if (onChange) {
            const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
            const rgba = color.rgb();
            onChange(rgba);
        }
    }, [hue, saturation, lightness, alpha, onChange]);

    return (
        <ColorPickerContext
            value={{
                hue,
                saturation,
                lightness,
                alpha,
                mode,
                setHue,
                setSaturation,
                setLightness,
                setAlpha,
                setMode,
            }}
        >
            <div className={cn('grid w-full gap-4', className)} {...props} />
        </ColorPickerContext>
    );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = ({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker();

    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isDragging || !containerRef.current) return;

        const color = Color.hsl(hue, saturation, lightness).hsv();

        setPosition({
            x: color.saturationv() / 100,
            y: 1 - color.value() / 100, // 0 is top (bright), 1 is bottom (dark)
        });
    }, [containerRef, hue, saturation, lightness]);

    const handlePointerMove = useCallback(
        (event: PointerEvent) => {
            if (!isDragging || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

            // Map HSV grid back to HSL state (HSV -> HSL mapping)
            // x = Saturation (0-100), (1-y) = Value/Brightness (0-100)
            const color = Color.hsv(hue, x * 100, (1 - y) * 100).hsl();

            setPosition({ x, y });
            setSaturation(color.saturationl());
            setLightness(color.lightness());
        },
        [isDragging, hue, setSaturation, setLightness],
    );

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            const handleUp = () => setIsDragging(false);
            window.addEventListener('pointerup', handleUp);
            return () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handleUp);
            };
        }
    }, [isDragging, handlePointerMove]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative aspect-[4/3] w-full cursor-crosshair rounded overflow-hidden',
                className,
            )}
            style={{
                background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `,
            }}
            onPointerDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
                const rect = containerRef.current!.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                const color = Color.hsv(hue, x * 100, (1 - y) * 100).hsl();
                setSaturation(color.saturationl());
                setLightness(color.lightness());
            }}
            {...props}
        >
            <div
                className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                style={{
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`,
                }}
            />
        </div>
    );
};

export type ColorPickerHueProps = Slider.SliderProps;

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
    const { hue, setHue } = useColorPicker();

    return (
        <Root
            value={[hue]}
            max={360}
            step={1}
            className={cn('relative flex h-4 w-full touch-none', className)}
            onValueChange={([hue]) => setHue(hue)}
            {...props}
        >
            <Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
                <Range className="absolute h-full" />
            </Track>
            <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        </Root>
    );
};

export type ColorPickerAlphaProps = Slider.SliderProps;

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
    const { alpha, setAlpha } = useColorPicker();

    return (
        <Root
            value={[alpha]}
            max={100}
            step={1}
            className={cn('relative flex h-4 w-full touch-none', className)}
            onValueChange={([alpha]) => setAlpha(alpha)}
            {...props}
        >
            <Track
                className="relative my-0.5 h-3 w-full grow rounded-full"
                style={{
                    background:
                        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-primary/50" />
                <Range className="absolute h-full rounded-full bg-transparent" />
            </Track>
            <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        </Root>
    );
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
    const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

    const handleEyeDropper = async () => {
        try {
            // @ts-ignore - EyeDropper API is experimental
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            const color = Color(result.sRGBHex);
            const [h, s, l] = color.hsl().array();

            setHue(h);
            setSaturation(s);
            setLightness(l);
            setAlpha(100);
        } catch (error) {
            console.error('EyeDropper failed:', error);
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleEyeDropper}
            className={cn('shrink-0 text-muted-foreground', className)}
            {...props}
        >
            <PipetteIcon size={16} />
        </Button>
    );
};

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ['oklch', 'hex', 'rgb', 'css', 'hsl'];

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
    const { mode, setMode } = useColorPicker();

    return (
        <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-8 w-[4.5rem] shrink-0 text-xs" {...props}>
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
                {formats.map((format) => (
                    <SelectItem key={format} value={format} className="text-xs">
                        {format.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

type PercentageInputProps = ComponentProps<typeof Input>;

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
    return (
        <div className="relative">
            <Input
                type="text"
                {...props}
                className={cn(
                    'h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 text-xs shadow-none',
                    className,
                )}
            />
            <span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-xs">
                %
            </span>
        </div>
    );
};

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
    const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness } =
        useColorPicker();
    const color = Color.hsl(hue, saturation, lightness, alpha / 100);

    if (mode === 'hex') {
        const hex = color.hex();

        return (
            <div
                className={cn('-space-x-px relative flex items-center shadow-sm', className)}
                {...props}
            >
                <span className="-translate-y-1/2 absolute top-1/2 left-3 text-xs text-muted-foreground">
                    #
                </span>
                <Input
                    type="text"
                    value={hex}
                    className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none"
                />
                <PercentageInput value={alpha} />
            </div>
        );
    }

    if (mode === 'rgb') {
        const rgb = color
            .rgb()
            .array()
            .map((value) => Math.round(value));

        return (
            <div className={cn('-space-x-px flex items-center shadow-sm', className)} {...props}>
                {rgb.map((value, index) => (
                    <Input
                        key={index}
                        type="text"
                        value={value}
                        readOnly
                        className={cn(
                            'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none',
                            index && 'rounded-l-none',
                            className,
                        )}
                    />
                ))}
                <PercentageInput value={alpha} />
            </div>
        );
    }

    if (mode === 'css') {
        const rgb = color
            .rgb()
            .array()
            .map((value) => Math.round(value));

        return (
            <div className={cn('w-full shadow-sm', className)} {...props}>
                <Input
                    type="text"
                    className="h-8 w-full bg-secondary px-2 text-xs shadow-none"
                    value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
                    readOnly
                    {...props}
                />
            </div>
        );
    }

    if (mode === 'hsl') {
        const hsl = color
            .hsl()
            .array()
            .map((value) => Math.round(value));

        return (
            <div className={cn('-space-x-px flex items-center shadow-sm', className)} {...props}>
                {hsl.map((value, index) => (
                    <Input
                        key={index}
                        type="text"
                        value={value}
                        readOnly
                        className={cn(
                            'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none',
                            index && 'rounded-l-none',
                            className,
                        )}
                    />
                ))}
                <PercentageInput value={alpha} />
            </div>
        );
    }

    if (mode === 'oklch') {
        // Convert from HSL to RGB first, then to OKLCH
        const rgb = color
            .rgb()
            .array()
            .map((value) => Math.round(value));
        const oklch = convert.rgb.lch(rgb[0], rgb[1], rgb[2]);

        // Format: [L (0-100), C (0-32), H (0-360)]
        const [l, c, h] = oklch.map((value, index) => {
            // Round L and H to whole numbers, C to 2 decimals
            return index === 1 ? Math.round(value * 100) / 100 : Math.round(value);
        });

        const handleOklchChange = (index: number, value: string) => {
            try {
                const currentOklch = [...oklch];
                currentOklch[index] = parseFloat(value) || 0;

                // Convert back to RGB then to HSL
                const newRgb = convert.lch.rgb(currentOklch[0], currentOklch[1], currentOklch[2]);
                const newHsl = convert.rgb.hsl(newRgb[0], newRgb[1], newRgb[2]);

                setHue(newHsl[0]);
                setSaturation(newHsl[1]);
                setLightness(newHsl[2]);
            } catch (error) {
                console.error('Invalid OKLCH color:', error);
            }
        };

        return (
            <div className={cn('-space-x-px flex items-center shadow-sm', className)} {...props}>
                <Input
                    type="text"
                    value={l}
                    onChange={(e) => handleOklchChange(0, e.target.value)}
                    className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none"
                    placeholder="L"
                />
                <Input
                    type="text"
                    value={c}
                    onChange={(e) => handleOklchChange(1, e.target.value)}
                    className="h-8 rounded-none bg-secondary px-2 text-xs shadow-none"
                    placeholder="C"
                />
                <Input
                    type="text"
                    value={h}
                    onChange={(e) => handleOklchChange(2, e.target.value)}
                    className="h-8 rounded-none bg-secondary px-2 text-xs shadow-none"
                    placeholder="H"
                />
                <PercentageInput value={alpha} />
            </div>
        );
    }

    return null;
};
