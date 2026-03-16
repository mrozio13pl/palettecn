import { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';
import copy from 'copy-text-to-clipboard';
import { cn } from '@/lib/utils';

interface SnippetProps {
    text: string | string[];
    width?: string;
    onCopy?: () => void;
    prompt?: boolean;
    className?: string;
}

export const Snippet = ({
    className,
    text,
    width = '100%',
    onCopy,
    prompt = true,
}: SnippetProps) => {
    const [copied, setCopied] = useState(false);
    const timeout = useRef<NodeJS.Timeout>(null);
    const lines = typeof text === 'string' ? [text] : text;

    const onClick = () => {
        if (timeout.current) clearTimeout(timeout.current);
        setCopied(true);
        timeout.current = setTimeout(() => setCopied(false), 2000);
        copy(lines.join('\n'));
        onCopy?.();
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 px-3 py-2.5 rounded-md border border-border bg-muted',
                className,
            )}
            style={{ width }}
        >
            <div className="flex-1">
                {lines.map((line) => (
                    <div
                        key={line}
                        className={clsx(
                            'font-mono text-[13px] text-muted-foreground',
                            prompt && "before:content-['$_']",
                        )}
                    >
                        {line}
                    </div>
                ))}
            </div>
            <button
                onClick={onClick}
                className="cursor-pointer mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
    );
};
