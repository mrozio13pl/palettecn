import { ArrowUpRightIcon, LinkIcon, Minus, Plus, Trash2, TrendingUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Github } from '@lobehub/icons';
import { Calendar } from '../ui/calendar';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/area-chart';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemTitle } from '../ui/item';
import { Progress } from '../ui/progress';
import { ChartBarActive } from '../ui/chart-bar-active';
import { AnimatedCard, CardBody, CardVisual, Visual3 } from '../ui/animated-card-chart';
import { Separator } from '../ui/separator';
import type { ChartConfig } from '../ui/area-chart';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field-1';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

function ShoppingCartOne() {
    const cartItem = {
        id: 1,
        name: 'Apple AirPods Pro (2nd gen)',
        category: 'Headphones',
        image: 'https://images.unsplash.com/photo-1624258919367-5dc28f5dc293?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1160',
        price: 129.0,
        originalPrice: 129,
        quantity: 1,
    };

    const [quantity, setQuantity] = useState(cartItem.quantity);

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    return (
        <Card className="w-full bg-card border shadow-none rounded-xl not-prose p-4 flex-row gap-4">
            <div className="size-22 bg-white rounded-xl overflow-hidden flex-shrink-0">
                <img
                    src={cartItem.image}
                    alt={cartItem.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 flex flex-col space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <CardDescription>{cartItem.category}</CardDescription>
                        <CardTitle>{cartItem.name}</CardTitle>
                    </div>

                    <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center bg-background text-foreground rounded-lg border">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                            onClick={decrementQuantity}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                            {quantity}
                        </span>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                            onClick={incrementQuantity}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-xl font-semibold">
                        $
                        {(cartItem.price * quantity).toFixed(2)}
                    </p>
                </div>
            </div>
        </Card>
    );
}

function Calendar20() {
    const [date, setDate] = useState<Date | undefined>(
        new Date(2025, 5, 12),
    );
    const [selectedTime, setSelectedTime] = useState<string | null>('10:00');
    const timeSlots = Array.from({ length: 37 }, (_, i) => {
        const totalMinutes = i * 15;
        const hour = Math.floor(totalMinutes / 60) + 9;
        const minute = totalMinutes % 60;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });

    const bookedDates = Array.from(
        { length: 3 },
        (_, i) => new Date(2025, 5, 17 + i),
    );

    return (
        <Card className="gap-0 p-0">
            <CardContent className="relative p-0 md:pr-48">
                <div className="p-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                        disabled={bookedDates}
                        showOutsideDays={false}
                        modifiers={{
                            booked: bookedDates,
                        }}
                        modifiersClassNames={{
                            booked: '[&>button]:line-through opacity-100',
                        }}
                        className="bg-transparent -ml-1.5 p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
                        formatters={{
                            formatWeekdayName: (date) => {
                                return date.toLocaleString('en-US', { weekday: 'short' });
                            },
                        }}
                    />
                </div>
                <div className="no-scrollbar @min-7xl:w-40 inset-y-0 right-0 flex max-h-72 scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:border-t-0 md:border-l">
                    <div className="grid gap-2">
                        {timeSlots.map(time => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? 'default' : 'outline'}
                                onClick={() => setSelectedTime(time)}
                                className="w-auto shadow-none"
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t px-6 !py-5 md:flex-row">
                <div className="text-sm">
                    {date && selectedTime
                        ? (
                                <>
                                    Your meeting is booked for
                                    {' '}
                                    <span className="font-medium">
                                        {' '}
                                        {date?.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                        })}
                                        {' '}
                                    </span>
                                    at
                                    {' '}
                                    <span className="font-medium">{selectedTime}</span>
                                    .
                                </>
                            )
                        : (
                                <>Select a date and time for your meeting.</>
                            )}
                </div>
                <Button
                    disabled={!date || !selectedTime}
                    className="w-full md:ml-auto md:w-auto"
                    variant="outline"
                >
                    Continue
                </Button>
            </CardFooter>
        </Card>
    );
}

function Profile() {
    interface SocialLink {
        id: string;
        icon: ElementType;
        label: string;
        href: string;
    }

    interface ActionButtonProps {
        text: string;
        href: string;
    }

    interface GlassmorphismProfileCardProps {
        avatarUrl: string;
        name: string;
        title: string;
        bio: React.ReactNode;
        socialLinks?: Array<SocialLink>;
        actionButton: ActionButtonProps;
    }

    const ProfileCardDemo = () => {
        const cardProps: GlassmorphismProfileCardProps = {
            avatarUrl: 'https://github.com/mrozio13pl.png',
            name: 'mraza',
            title: 'Web Developer',
            bio: (
                <>
                    Bored,
                    {' '}
                    <span className="line-through">passionate</span>
                    {' '}
                    web developer and a real Arch user.
                </>
            ),
            socialLinks: [
                { id: 'github', icon: Github, label: 'GitHub', href: 'https://github.com/mrozio13pl' },
                { id: 'linkedin', icon: LinkIcon, label: 'Website', href: 'https://mraza.pages.dev/' },
            ],
            actionButton: {
                text: 'Contact Me',
                href: '#',
            },
        };

        return <GlassmorphismProfileCard {...cardProps} />;
    };

    const GlassmorphismProfileCard = ({
        avatarUrl,
        name,
        title,
        bio,
        socialLinks = [],
        actionButton,
    }: GlassmorphismProfileCardProps) => {
        const [hoveredItem, setHoveredItem] = useState<string | null>(null);

        return (
            <div className="relative w-full">
                <div
                    className="relative flex flex-col items-center p-6 rounded-xl border bg-card"
                >
                    <div className="w-24 h-24 mb-4 rounded-full p-1 border-2">
                        <img
                            src={avatarUrl}
                            alt={`${name}'s Avatar`}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://placehold.co/96x96/6366f1/white?text=${name.charAt(0)}`;
                            }}
                        />
                    </div>

                    <h2 className="text-2xl font-bold font-serif text-card-foreground">{name}</h2>
                    <p className="mt-1 text-sm font-medium text-primary">{title}</p>
                    <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{bio}</p>

                    <Separator className="w-1/2! h-px my-4 rounded-full bg-border" />

                    <div className="flex items-center justify-center gap-3">
                        {socialLinks.map(item => (
                            <SocialButton
                                key={item.id}
                                item={item}
                                setHoveredItem={setHoveredItem}
                                hoveredItem={hoveredItem}
                            />
                        ))}
                    </div>

                    <ActionButton action={actionButton} />
                </div>

                <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out" />
            </div>
        );
    };

    const SocialButton = ({
        item,
        setHoveredItem,
        hoveredItem,
    }: {
        item: SocialLink;
        setHoveredItem: (id: string | null) => void;
        hoveredItem: string | null;
    }) => (
        <div className="relative">
            <a
                href={item.href}
                onClick={(e: React.MouseEvent) => e.preventDefault()}
                className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-secondary/50 hover:bg-secondary"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
            >
                <div className="relative z-10 flex items-center justify-center">
                    <item.icon size={20} className="transition-all duration-200 ease-out text-secondary-foreground/70 group-hover:text-secondary-foreground" />
                </div>
            </a>
            <Tooltip item={item} hoveredItem={hoveredItem} />
        </div>
    );

    const ActionButton = ({ action }: { action: ActionButtonProps }) => (
        <a
            href={action.href}
            onClick={(e: React.MouseEvent) => e.preventDefault()}
            className="flex items-center gap-2 px-6 py-3 mt-4 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-primary text-primary-foreground"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
            <span>{action.text}</span>
            <ArrowUpRightIcon size={16} className="transition-transform duration-300 ease-out group-hover:rotate-45" />
        </a>
    );

    const Tooltip = ({
        item,
        hoveredItem,
    }: {
        item: SocialLink;
        hoveredItem: string | null;
    }) => (
        <div
            role="tooltip"
            className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-popover text-popover-foreground border-border ${
                hoveredItem === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
            {item.label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-b border-r border-border" />
        </div>
    );

    return (
        <div className="font-sans bg-background w-full">
            <ProfileCardDemo />
        </div>
    );
}

function AnimatedHatchedPatternAreaChart() {
    const chartData = [
        { month: 'January', desktop: 342, mobile: 245 },
        { month: 'February', desktop: 876, mobile: 654 },
        { month: 'March', desktop: 512, mobile: 387 },
        { month: 'April', desktop: 629, mobile: 521 },
        { month: 'May', desktop: 458, mobile: 412 },
        { month: 'June', desktop: 781, mobile: 598 },
        { month: 'July', desktop: 394, mobile: 312 },
        { month: 'August', desktop: 925, mobile: 743 },
        { month: 'September', desktop: 647, mobile: 489 },
        { month: 'October', desktop: 532, mobile: 476 },
        { month: 'November', desktop: 803, mobile: 687 },
        { month: 'December', desktop: 271, mobile: 198 },
    ];

    const chartConfig = {
        desktop: {
            label: 'Desktop',
            color: 'var(--chart-1)',
        },
        mobile: {
            label: 'Mobile',
            color: 'var(--chart-2)',
        },
    } satisfies ChartConfig;

    type ActiveProperty = keyof typeof chartConfig;

    const [activeProperty, setActiveProperty] = useState<ActiveProperty | null>(null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Hatched Area Chart
                    <Badge
                        variant="outline"
                        className="gap-1 text-green-500 bg-green-500/10 border-none ml-2"
                    >
                        <TrendingUpIcon className="h-4 w-4" />
                        <span>5.2%</span>
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Showing total visitors for the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={value => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <HatchedBackgroundPattern config={chartConfig} />
                            <linearGradient
                                id="hatched-background-pattern-grad-desktop"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="hatched-background-pattern-grad-mobile"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            onMouseEnter={() => setActiveProperty('mobile')}
                            onMouseLeave={() => setActiveProperty(null)}
                            dataKey="mobile"
                            type="natural"
                            fill={
                                activeProperty === 'mobile'
                                    ? 'url(#hatched-background-pattern-mobile)'
                                    : 'url(#hatched-background-pattern-grad-mobile)'
                            }
                            fillOpacity={0.4}
                            stroke="var(--color-mobile)"
                            stackId="a"
                            strokeWidth={0.8}
                        />
                        <Area
                            onMouseEnter={() => setActiveProperty('desktop')}
                            onMouseLeave={() => setActiveProperty(null)}
                            dataKey="desktop"
                            type="natural"
                            fill={
                                activeProperty === 'desktop'
                                    ? 'url(#hatched-background-pattern-desktop)'
                                    : 'url(#hatched-background-pattern-grad-desktop)'
                            }
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                            stackId="a"
                            strokeWidth={0.8}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

const HatchedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
    const items = Object.fromEntries(
        Object.entries(config).map(([key, value]) => [key, value.color]),
    );
    return (
        <>
            {Object.entries(items).map(([key, value]) => (
                <pattern
                    key={key}
                    id={`hatched-background-pattern-${key}`}
                    x="0"
                    y="0"
                    width="6.81"
                    height="6.81"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(-45)"
                    overflow="visible"
                >
                    <g overflow="visible" className="will-change-transform">
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to="6 0"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                        <rect width="10" height="10" opacity={0.05} fill={value} />
                        <rect width="1" height="10" fill={value} />
                    </g>
                </pattern>
            ))}
        </>
    );
};

function SimpleForm() {
    return (
        <Card>
            <CardContent>
                <FieldSet>
                    <FieldLegend>Address Information</FieldLegend>
                    <FieldDescription>We need your address to deliver your order.</FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="street">Street Address</FieldLabel>
                            <Input id="street" type="text" placeholder="123 Main St" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="city">City</FieldLabel>
                                <Input id="city" type="text" placeholder="New York" />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
                                <Input id="zip" type="text" placeholder="90502" />
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
            </CardContent>
        </Card>
    );
}

function Downloading() {
    return (
        <Item variant="outline" className="rounded-xl bg-card">
            <ItemMedia variant="icon">
                <Spinner />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Downloading...</ItemTitle>
                <ItemDescription>731 MB / 1000 MB</ItemDescription>
            </ItemContent>
            <ItemActions className="hidden sm:flex">
                <Button variant="outline" size="sm">
                    Cancel
                </Button>
            </ItemActions>
            <ItemFooter>
                <Progress value={73} />
            </ItemFooter>
        </Item>
    );
}

function AnimatedCard3Demo() {
    return (
        <AnimatedCard className="bg-card shadow-none">
            <CardVisual>
                <Visual3 />
            </CardVisual>
            <CardBody>
                <CardTitle>Just find the right caption</CardTitle>
                <CardDescription>
                    This card will tell everything you want
                </CardDescription>
            </CardBody>
        </AnimatedCard>
    );
}

function AuthenticateItem({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <Item variant="outline" className={cn('bg-card', className)} {...props}>
            <ItemContent>
                <ItemTitle>Two-factor authentication</ItemTitle>
                <ItemDescription>Verify via email or phone number.</ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button>Sign up</Button>
            </ItemActions>
        </Item>
    );
}

export function ComponentsPage() {
    return (
        <div className="grid grid-cols-1 @md:grid-cols-2 @6xl:grid-cols-3 gap-4 mx-2">
            <div className="flex flex-col gap-4 w-full">
                <ShoppingCartOne />
                <AnimatedCard3Demo />
                <SimpleForm />
                <Downloading />
            </div>

            <div className="flex flex-col gap-4 w-full @md:row-span-2 @6xl:row-span-1">
                <Calendar20 />
                <AnimatedHatchedPatternAreaChart />
                <AuthenticateItem className="@6xl:flex hidden" />
                <div className="@6xl:hidden">
                    <ChartBarActive />
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <Profile />
                <div className="@6xl:hidden">
                    <AuthenticateItem />
                </div>
                <div className="@6xl:block hidden">
                    <ChartBarActive />
                </div>
            </div>
        </div>
    );
}
