import useApi from './use-api';
import { ROUTES } from '@/constants/routes';
import { Bank } from '@/types/bank-types';
import { useEffect, useState } from 'react';

const useBanks = () => {
    const { trigger } = useApi();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBanks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await trigger<{ data: Bank[] }>(ROUTES.banks.all, { method: 'get' });
            if (error) {
                setError(new Error(error.message || 'Failed to fetch banks'));
            } else if (data) {
                setBanks(data.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error fetching banks'));
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
