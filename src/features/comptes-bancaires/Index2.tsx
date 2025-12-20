"use client"

import UnexpectedError from "@/components/errors/UnexpectedError";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import useBanks from "@/hooks/use-banks";
import { BankAccount, BankAccountSchema } from "@/types/bank-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, BarChart3, Table as TableIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';
import { AccountsTable } from "./components/accounts-table";
import { BalanceManager } from "./components/balance-manager";
import { AccountsBalanceChart } from "./components/accounts-balance-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BankAccountRow = BankAccount;

const Index2 = () => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [balanceManagerOpen, setBalanceManagerOpen] = useState(false);
    const [quickBalanceDialogOpen, setQuickBalanceDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccountRow | null>(null);
    const [quickBalanceAmount, setQuickBalanceAmount] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>("table");
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    const { banks, isLoading: banksLoading } = useBanks();
    const [accounts, setAccounts] = useState<BankAccountSchema[]>([]);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    const fetchAccounts = async (yearParam?: number) => {
        const yearToFetch = yearParam ?? selectedYear;
        try {
            const response = await trigger<{ data: BankAccountSchema[] }>(ROUTES.bankAccounts.byYear(yearToFetch));
            setAccounts(response.data?.data || []);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors du chargement des comptes bancaires');
        }
    };

    useEffect(() => {
        fetchAccounts(currentYear);
    }, []);

    const handleYearChange = (yearValue: string) => {
        const year = Number(yearValue);
        setSelectedYear(year);
        fetchAccounts(year);
    };

    const handleDelete = async (account: BankAccountRow): Promise<void> => {
        try {
            await trigger(ROUTES.bankAccounts.delete(account.id), { method: 'delete' });
            showSuccess('Compte bancaire supprimé avec succès');
            fetchAccounts(selectedYear);
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression du compte bancaire');
        }
    };

    const handleEditName = (account: BankAccountRow) => {
        setSelectedAccount(account);
        setEditDialogOpen(true);
    };

    const handleQuickBalanceSubmit = async () => {
        if (!selectedAccount) return;
        try {
            await trigger(ROUTES.accountBalances.store, {
                method: 'post',
                data: {
                    bank_account_id: selectedAccount.id,
                    date: new Date().toISOString().slice(0, 7),
                    amount: Number(quickBalanceAmount || 0),
                }
            });
            showSuccess('Solde du mois courant enregistré');
            setQuickBalanceDialogOpen(false);
            setQuickBalanceAmount('');
            fetchAccounts(selectedYear);
        } catch (err) {
            const error = err as ApiError;
            showError(error.message || "Erreur lors de l'enregistrement du solde");
        }
    };

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 px-3 md:px-6">
                    <Heading title='Vos Comptes bancaires' />
                    <div className="flex items-center gap-2">
                        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Année" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <Plus className='h-4 w-4 mr-2' />
                                    Nouveau compte
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Créer un compte bancaire</DialogTitle>
                                </DialogHeader>
                                <CreateBankAccountForm
                                    banks={banks}
                                    loadingBanks={banksLoading}
                                    onSuccess={() => {
                                        setCreateDialogOpen(false);
                                        fetchAccounts(selectedYear);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className='mb-2' />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                        <TabsTrigger value="table" className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4" />
                            Tableau
                        </TabsTrigger>
                        <TabsTrigger value="chart" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Graphique
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="mt-0">
                        <AccountsTable
                            accounts={accounts}
                            year={selectedYear}
                            onEdit={handleEditName}
                            onBalanceManager={(account) => {
                                setSelectedAccount(account);
                                setBalanceManagerOpen(true);
                            }}
                            onQuickBalance={(account) => {
                                setSelectedAccount(account);
                                setQuickBalanceDialogOpen(true);
                            }}
                            onDelete={(account) => handleDelete(account)}
                            onRefresh={() => fetchAccounts(selectedYear)}
                        />
                    </TabsContent>

                    <TabsContent value="chart" className="mt-0">
                        <AccountsBalanceChart
                            accounts={accounts}
                            year={selectedYear}
                        />
                    </TabsContent>
                </Tabs>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le compte</DialogTitle>
                        </DialogHeader>
                        {selectedAccount ? (
                            <CreateBankAccountForm
                                banks={banks}
                                loadingBanks={banksLoading}
                                initialData={selectedAccount}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedAccount(null);
                                    fetchAccounts(selectedYear);
                                }}
                            />
                        ) : (
                            <UnexpectedError error={null} />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={balanceManagerOpen} onOpenChange={setBalanceManagerOpen}>
                    <DialogContent className="w-screen sm:w-[90vw] lg:w-[85vw] xl:w-[60vw]">
                        <DialogHeader>
                            <DialogTitle>Gestion des Soldes - {selectedAccount?.bank?.name} {selectedAccount?.account_number}</DialogTitle>
                        </DialogHeader>
                        {selectedAccount ? (
                            <BalanceManager
                                accountId={selectedAccount.id}
                                accountCurrency={selectedAccount.currency}
                                onParentTableRefresh={() => fetchAccounts(selectedYear)}
                            />
                        ) : (
                            <UnexpectedError error={null} />
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={quickBalanceDialogOpen} onOpenChange={(open) => { setQuickBalanceDialogOpen(open); if (!open) setQuickBalanceAmount(''); }}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Solde rapide - {selectedAccount?.account_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                                Mois courant : {new Date().toISOString().slice(0, 7)}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Montant</label>
                                <Input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={quickBalanceAmount}
                                    onChange={(e) => setQuickBalanceAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setQuickBalanceDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleQuickBalanceSubmit}>Enregistrer</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    )
};

const createSchema = zod.object({
    bank_id: zod.string().min(1, { message: 'La banque est requise' }),
    account_number: zod.string().optional(),
    account_name: zod.string().min(1, { message: 'Le nom du compte est requis' }),
    currency: zod.string().min(1, { message: 'La devise est requise' }),
});

type CreateFormValues = zod.infer<typeof createSchema>;

const CreateBankAccountForm = ({ onSuccess, banks, loadingBanks, initialData }: { onSuccess?: () => void, banks: any[], loadingBanks: boolean, initialData?: BankAccountRow }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<CreateFormValues>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            bank_id: initialData ? initialData.bank_id.toString() : (banks.length > 0 ? banks[0].id.toString() : ''),
            account_number: initialData?.account_number || '',
            account_name: initialData?.account_name || '',
            currency: initialData?.currency || 'MAD',
        }
    });

    const onSubmit = async (values: CreateFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...values,
                bank_id: Number(values.bank_id)
            };
            if (initialData) {
                await trigger(ROUTES.bankAccounts.update(initialData.id), { method: 'put', data: payload });
                showSuccess('Compte mis à jour avec succès');
            } else {
                await trigger(ROUTES.bankAccounts.store, { method: 'post', data: payload });
                showSuccess('Compte créé avec succès');
            }
            form.reset();
            onSuccess?.();
        } catch (err) {
            const error = err as ApiError;
            showError(error.message || 'Erreur lors de l\'opération');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <FormField
                        control={form.control}
                        name="bank_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banque</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez une banque" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {loadingBanks ? (
                                            <SelectItem value="loading" disabled>Chargement...</SelectItem>
                                        ) : (
                                            banks.map((bank) => (
                                                <SelectItem key={bank.id} value={bank.id.toString()}>
                                                    {bank.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Devise</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="MAD" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MAD">MAD (Dh)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="account_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du Compte</FormLabel>
                            <FormControl>
                                <Input placeholder="Nom du compte" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Numéro de Compte</FormLabel>
                            <FormControl>
                                <Input required={false} placeholder="ACC-000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (initialData ? 'Modification...' : 'Création...') : (initialData ? 'Modifier' : 'Créer')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default Index2;
