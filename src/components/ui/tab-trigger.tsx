import { clsx } from 'clsx';
import { TabsTrigger } from './tabs';
import type { TabsTriggerProps } from '@radix-ui/react-tabs';

export const GhostTabsTrigger = ({ className, ...props }: TabsTriggerProps) => (
    <TabsTrigger
        className={clsx('p-2! border-none hover:text-foreground! data-[state="active"]:bg-muted! shadow-none!', className)}
        {...props}
    />
);
