'use client';
import { useEffect, useState } from 'react';
import useApi from './use-api';
import { ROUTES } from '@/constants/routes';
import { User } from '@/contexts/AppProvider';

const useUser = () => {
  const [client, setClient] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const { trigger } = useApi();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const resp = await trigger<{ data: { user: User | null; authenticated: boolean } }>(ROUTES.isLogged, { method: 'post' });
        const payload = resp?.data?.data;
        setClient(payload?.user || null);
        setIsAuth(payload?.authenticated || false);
      } catch (_e) {
        setClient(null);
        setIsAuth(false);
      }
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { client, isAuth, loading };
};

export default useUser;
