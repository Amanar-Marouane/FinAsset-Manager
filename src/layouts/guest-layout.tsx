'use client';
import LoadingView from "@/components/animations/loading-view";
import { APP_ROUTES } from '@/constants/app-routes';
import { useAppContext } from "@/hooks/use-app-context";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

const GuestLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(APP_ROUTES.dashboard);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingView />;

  if (isAuthenticated) return null;

  return <>{children}</>;
};

export default GuestLayout;
