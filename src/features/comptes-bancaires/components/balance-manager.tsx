import { CustomTableColumn } from "@/components/custom/data-table/types";
import DeleteModal from "@/components/modal/delete-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomTable from "@/components/ui/table/custom-table";
import { ROUTES } from "@/constants/routes";
import useApi from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { AccountBalance } from "@/types/bank-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const balanceSchema = zod.object({
    date: zod.string().min(1, { message: 'Date requise' }),
    amount: zod.string().min(1, { message: 'Montant requis' }),
});

type BalanceFormValues = zod.infer<typeof balanceSchema>;

const BalanceForm = ({ accountId, initialData, onSuccess, onCancel }: { accountId: number, initialData?: AccountBalance, onSuccess: () => void, onCancel: () => void }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<BalanceFormValues>({
        resolver: zodResolver(balanceSchema),
        defaultValues: {
            date: initialData?.date || new Date().toISOString().split('T')[0],
            amount: initialData?.amount || '',
        }
    });

    const onSubmit = async (values: BalanceFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = { ...values, bank_account_id: accountId, amount: Number(values.amount) };

            let response, error;
            if (initialData) {
                // Update
                ({ data: response, error } = await trigger(ROUTES.accountBalances.update(initialData.id), { method: 'put', data: payload }));
            } else {
                // Create
                ({ data: response, error } = await trigger(ROUTES.accountBalances.store, { method: 'post', data: payload }));
            }

            if (response) {
                showSuccess(initialData ? 'Solde mis à jour' : 'Solde enregistré');
                onSuccess();
            }
            if (error) {
                showError(error.response?.data?.message || 'Erreur lors de l\'enregistrement du solde');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Montant</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Ajouter')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export const BalanceManager = ({ accountId, accountCurrency }: { accountId: number, accountCurrency: string }) => {
    const [createOpen, setCreateOpen] = useState(false);
    const [editBalance, setEditBalance] = useState<AccountBalance | null>(null);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshTable = () => setRefreshKey(k => k + 1);

    const handleDelete = async (balance: AccountBalance) => {
        const { error } = await trigger(ROUTES.accountBalances.delete(balance.id), { method: 'delete' });
        if (error) {
            showError(error.response?.data?.message || 'Erreur lors de la suppression');
        } else {
            showSuccess('Solde supprimé');
            refreshTable();
        }
    };

    const columns: CustomTableColumn<AccountBalance>[] = [
        { data: 'date', label: 'Date', sortable: true },
        {
            data: 'amount',
            label: 'Solde',
            sortable: true,
            render: (val: any) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: accountCurrency }).format(Number(val))
        },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: AccountBalance) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditBalance(row)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <DeleteModal
                        id={row.id}
                        itemName="solde"
                        onDelete={() => handleDelete(row)}
                        reference={`le solde du ${row.date}`}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historique des soldes</h3>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Nouveau Solde</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un solde mensuel</DialogTitle>
                        </DialogHeader>
                        <BalanceForm
                            accountId={accountId}
                            onSuccess={() => { setCreateOpen(false); refreshTable(); }}
                            onCancel={() => setCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="h-[500px] w-full flex flex-col relative overflow-hidden">
                <CustomTable
                    key={refreshKey}
                    columns={columns}
                    url={`${ROUTES.accountBalances.index}?account_id=${accountId}`}
                />
            </div>

            <Dialog open={!!editBalance} onOpenChange={(open) => !open && setEditBalance(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le solde</DialogTitle>
                    </DialogHeader>
                    {editBalance && (
                        <BalanceForm
                            accountId={accountId}
                            initialData={editBalance}
                            onSuccess={() => { setEditBalance(null); refreshTable(); }}
                            onCancel={() => setEditBalance(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
