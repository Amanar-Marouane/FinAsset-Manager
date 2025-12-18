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
    currency: string;
    initial_balance: string;
    solde?: string; // Derived or current balance
    created_at: string;
    updated_at: string;
};

export type AccountBalance = {
    id: number;
    bank_account_id: number;
    date: string;
    amount: string;
    created_at: string;
    updated_at: string;
};
