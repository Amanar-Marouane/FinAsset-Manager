'use client'
import LoadingView from "@/components/animations/loading-view";
import { APP_ROUTES } from '@/constants/app-routes';
import useUser from "@/hooks/use-user";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { isAuth, loading } = useUser();

    useEffect(() => {
        if (!isAuth && !loading) {
            router.replace(APP_ROUTES.signIn);
        }
    }, [isAuth, loading, router]);

    if (loading) return <LoadingView />;

    if (!isAuth) return null;

    return <>{children}</>;
};


export default AppLayout