import { CustomTableColumn, UseCustomTableReturnType } from "@/components/custom/data-table/types";
import DeleteModal from "@/components/modal/delete-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomTable from "@/components/ui/table/custom-table";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { AccountBalance, BankAccount } from "@/types/bank-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, DollarSign } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';
import { OtherPersonMoneyForm } from "./other-person-money-form";

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
            date: initialData?.date || new Date().toISOString().slice(0, 7),
            amount: initialData?.amount || '',
        }
    });

    const onSubmit = async (values: BalanceFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = { ...values, bank_account_id: accountId, amount: Number(values.amount) };

            if (initialData) {
                await trigger(ROUTES.accountBalances.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.accountBalances.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Solde mis à jour' : 'Solde enregistré');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de l\'enregistrement du solde');
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
                                <Input type="month" {...field} />
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

export const BalanceManager = ({ accountId, accountCurrency, onParentTableRefresh }: { accountId: number, accountCurrency: string, onParentTableRefresh?: () => void; }) => {
    const [createOpen, setCreateOpen] = useState(false);
    const [editBalance, setEditBalance] = useState<AccountBalance | null>(null);
    const [otherPersonMoneyOpen, setOtherPersonMoneyOpen] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    const [refreshKey, setRefreshKey] = useState(0);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

    const refreshTable = () => {
        setRefreshKey(k => k + 1);
        onParentTableRefresh?.();
    };

    const handleDelete = async (balance: AccountBalance) => {
        try {
            await trigger(ROUTES.accountBalances.delete(balance.id), { method: 'delete' });
            showSuccess('Solde supprimé');
            refreshTable();
            onParentTableRefresh?.();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression');
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
            data: 'other_person_money',
            label: "Argent d'autre personne",
            sortable: true,
            render: (val: any) => val ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: accountCurrency }).format(Number(val)) : '—'
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
                <div className="flex items-center gap-3">
                    <select
                        className="h-9 rounded-md border px-3 text-sm"
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(e.target.value); refreshTable(); }}
                    >
                        <option value="all">Toutes les années</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <Dialog open={otherPersonMoneyOpen} onOpenChange={setOtherPersonMoneyOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <DollarSign className="h-4 w-4 mr-2" /> Fonds d'autrui
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Gérer les fonds d'autrui</DialogTitle>
                            </DialogHeader>
                            <OtherPersonMoneyForm
                                accountId={accountId}
                                onSuccess={() => {
                                    setOtherPersonMoneyOpen(false);
                                    refreshTable();
                                }}
                                onCancel={() => setOtherPersonMoneyOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
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
                                onSuccess={() => { setCreateOpen(false); refreshTable(); onParentTableRefresh?.(); }}
                                onCancel={() => setCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="w-full flex flex-col">
                <CustomTable
                    key={refreshKey}
                    columns={columns}
                    url={`${ROUTES.accountBalances.index}?account_id=${accountId}${selectedYear !== 'all' ? `&year=${selectedYear}` : ''}`}
                    preFilled={{ length: 12 }}
                    pageSizeOptions={[12, 25, 50, 100]}
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
                            onSuccess={() => {
                                onParentTableRefresh?.();
                                setEditBalance(null);
                                refreshTable();
                            }}
                            onCancel={() => setEditBalance(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
