import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkSize();

        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, [breakpoint]);

    return isMobile;
}
