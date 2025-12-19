"use client";

import { CustomTableColumn } from "@/components/custom/data-table/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CustomTable from "@/components/ui/table/custom-table";
import { ROUTES } from "@/constants/routes";
import useAllBankAccounts from "@/hooks/use-all-bank-accounts";
import { AccountBalance } from "@/types/bank-types";
import { useMemo, useState } from "react";

export default function AccountBalanceList() {
    const { accounts, isLoading: accountsLoading } = useAllBankAccounts();
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    // Finds the current selected account object for display details
    const selectedAccountDetails = useMemo(() =>
        accounts.find(a => a.id.toString() === selectedAccountId),
        [accounts, selectedAccountId]);

    // Columns for the Balance History Table
    const columns = useMemo<CustomTableColumn<AccountBalance>[]>(() => [
        { data: 'date', label: 'Date', sortable: true },
        {
            data: 'amount',
            label: 'Solde',
            sortable: true,
            render: (val: any) => {
                const amount = Number(val);
                return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: selectedAccountDetails?.currency || 'MAD'
                }).format(amount);
            }
        },
    ], [selectedAccountDetails]);

    // Computed URL: The table only fetches if an account is selected
    // API requires account_id
    const tableUrl = useMemo(() => {
        if (!selectedAccountId) return null;
        return `${ROUTES.accountBalances.index}?account_id=${selectedAccountId}`;
    }, [selectedAccountId]);

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <div className="w-[300px]">
                    <label className="text-sm font-medium mb-1 block">Sélectionner un compte</label>
                    <Select
                        value={selectedAccountId || ""}
                        onValueChange={(val) => setSelectedAccountId(val)}
                        disabled={accountsLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={accountsLoading ? "Chargement..." : "Choisir un compte"} />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                    {acc.bank?.name ? `${acc.bank.name} - ` : ''}{acc.account_number} ({acc.currency})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedAccountId ? (
                // <div className="mt-6">
                <CustomTable
                    columns={columns}
                    url={tableUrl || ""}
                    filters={[
                        { field: 'date_from', label: 'Date début', type: 'date' },
                        { field: 'date_to', label: 'Date fin', type: 'date' },
                    ]}
                />
                // </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
                    <p>Veuillez sélectionner un compte pour voir l'historique des soldes.</p>
                </div>
            )}
        </div>
    );
}
