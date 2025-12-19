import useApi, { ApiError } from './use-api';
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
            const resp = await trigger(`${ROUTES.bankAccounts.index}?length=100`, { method: 'get' });
            const root = (resp as any)?.data ?? resp;
            const items = Array.isArray(root) ? root : (root?.data ?? []);
            setAccounts(items || []);
        } catch (e) {
            const err = e as ApiError;
            setError(new Error(err.message || 'Unknown error fetching accounts'));
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
