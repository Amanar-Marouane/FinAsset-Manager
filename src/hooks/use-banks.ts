import useApi, { ApiError } from './use-api';
import { ROUTES } from '@/constants/routes';
import { Bank } from '@/types/bank-types';
import { useEffect, useState } from 'react';

const useBanks = () => {
    const { trigger } = useApi();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiError | null>(null);

    const fetchBanks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await trigger<{ data: Bank[] }>(ROUTES.banks.all, { method: 'get' });
            setBanks(resp?.data?.data ?? []);
        } catch (e) {
            const err = e as ApiError;
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    return { banks, isLoading, error, refresh: fetchBanks };
};

export default useBanks;
