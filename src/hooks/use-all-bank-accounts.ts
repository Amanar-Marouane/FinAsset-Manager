import useApi from './use-api';
import { ROUTES } from '@/constants/routes';
import { BankAccount } from '@/types/bank-types';
import { useEffect, useState } from 'react';

const useAllBankAccounts = () => {
    const { trigger } = useApi();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAccounts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Assuming index returns paginated, we might need 'all' endpoint or large limit
            // For now, we try to fetch index. If your API supports pagination override, use it.
            // e.g. ?length=100
            const { data, error } = await trigger(`${ROUTES.bankAccounts.index}?length=100`, { method: 'get' });
            if (error) {
                setError(new Error('Failed to fetch accounts'));
                return;
            }
            if (data) {
                // @ts-expect-error - Handling loose API response type
                setAccounts(Array.isArray(data) ? data : data?.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error fetching accounts'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    return { accounts, isLoading, error, refresh: fetchAccounts };
};

export default useAllBankAccounts;
