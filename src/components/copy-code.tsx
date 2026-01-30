import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import copy from 'copy-text-to-clipboard';
import { Button } from '@/components/ui/button';
import { useThemes } from '@/hooks/use-themes';
import { generateCode } from '@/lib/change-theme';

export function CopyCode(props: React.ComponentProps<typeof Button>) {
    const { currentTheme, isGenerating } = useThemes();
    const [isCopying, setIsCopying] = useState(false);

    function copyCode() {
        const code = generateCode(currentTheme!);

        setIsCopying(true);
        copy(code);

        setTimeout(() => setIsCopying(false), 3000);
    }

    return (
        <Button
            size="sm"
            variant="secondary"
            onClick={copyCode}
            disabled={isGenerating}
            {...props}
        >
            Copy code
            {isCopying ? <CheckIcon /> : <CopyIcon />}
        </Button>
    );
}
