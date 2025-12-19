'use client';

import LoadingView from "@/components/animations/loading-view";
import { APP_ROUTES } from '@/constants/app-routes';
import { useRouter } from 'next/navigation';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  router.replace(APP_ROUTES.signIn);

  return <LoadingView />;
}
