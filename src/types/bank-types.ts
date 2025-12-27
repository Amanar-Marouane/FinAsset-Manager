export type Bank = {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
};

export type BankAccount = {
    id: number;
    bank_id: number;
    bank?: Bank;
    account_number: string;
    account_name: string;
    currency: string;
    created_at: string;
    updated_at: string;
};

export type BankAccountSchema = {
    id: number;
    bank_id: number;
    bank: Bank;
    balances: AccountBalance[];
    account_name: string;
    account_number: string;
    last_inserted_balance: string | null;
    last_inserted_balance_date: string | null;
    previous_year_last_balance: string | null;
    previous_year_last_balance_date: string | null;
    currency: string;
    created_at: string;
    updated_at: string;
};

export type AccountBalance = {
    id: number;
    account_id: number;
    year: number;
    month: number;
    date: string;
    amount: string;
    created_at: string;
    updated_at: string;
};

export type OthersBalances = {
    id: number;
    year: number;
    month: number;
    date: string;
    amount: string;
    previous_year_last_balance: string | null;
    created_at: string;
    updated_at: string;
};
