import { Suspense, lazy } from 'react';
import { LandingPage } from './preview/landing';
import { GhostTabsTrigger } from './ui/tab-trigger';
import { Tabs, TabsContent, TabsList } from './ui/tabs';
import { Spinner } from './ui/spinner';
import { useThemes } from '@/hooks/use-themes';

const ComponentsPage = lazy(() => import('@/components/preview/components').then(m => ({ default: m.ComponentsPage })));

const fallback = (
    <div className="h-full flex justify-center items-center">
        <Spinner className="size-12 -mt-12" />
    </div>
);

export function Preview() {
    const { isSidebarCollapsed } = useThemes();

    return (
        <Tabs defaultValue="landing" className="size-full">
            {!isSidebarCollapsed && (
                <TabsList className="bg-transparent! m-2 gap-4">
                    <GhostTabsTrigger value="landing">
                        Landing Page
                    </GhostTabsTrigger>
                    <GhostTabsTrigger value="components">
                        Components
                    </GhostTabsTrigger>
                </TabsList>
            )}
            <TabsContent value="landing" className="size-full">
                <LandingPage />
            </TabsContent>
            <TabsContent value="components" className="h-full overflow-y-auto sm:pb-20 @container">
                <Suspense fallback={fallback}>
                    <ComponentsPage />
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}
