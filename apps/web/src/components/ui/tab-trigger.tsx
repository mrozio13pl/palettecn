import { clsx } from 'clsx';
import { TabsTrigger } from './tabs';
import type { Tabs } from 'radix-ui';

export const GhostTabsTrigger = ({ className, ...props }: Tabs.TabsTriggerProps) => (
    <TabsTrigger
        className={clsx(
            'p-2! border-none hover:text-foreground! data-[state="active"]:bg-muted! shadow-none!',
            className,
        )}
        {...props}
    />
);
