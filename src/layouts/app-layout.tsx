'use client'
import LoadingView from "@/components/animations/loading-view";
import { APP_ROUTES } from '@/constants/app-routes';
import { useAppContext } from "@/hooks/use-app-context";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAppContext();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            return router.push(APP_ROUTES.signIn);
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) return <LoadingView />;

    return (
        <>
            {children}
        </>
    )
}

export default AppLayout