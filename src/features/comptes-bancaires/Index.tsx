"use client"

import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from "@/components/custom/data-table/types";
import UnexpectedError from "@/components/errors/UnexpectedError";
import PageContainer from "@/components/layout/page-container";
import DeleteModal from "@/components/modal/delete-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import CustomTable from "@/components/ui/table/custom-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import useBanks from "@/hooks/use-banks";
import { BankAccount } from "@/types/bank-types";
import { decodeHtmlEntities } from "@/utils/html-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, History, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';
import { BalanceManager } from "./components/balance-manager";
type BankAccountRow = BankAccount;

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<BankAccountRow> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [balanceManagerOpen, setBalanceManagerOpen] = useState(false);
    const [quickBalanceDialogOpen, setQuickBalanceDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<BankAccountRow | null>(null);
    const [quickBalanceAmount, setQuickBalanceAmount] = useState<string>('');
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    const { banks, isLoading: banksLoading } = useBanks();

    const handleDelete = async (account: BankAccountRow): Promise<void> => {
        try {
            await trigger(ROUTES.bankAccounts.delete(account.id), { method: 'delete' });
            tableInstance?.refresh();
            showSuccess('Compte bancaire supprimé avec succès');
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
            tableInstance?.refresh();
        } catch (err) {
            const error = err as ApiError;
            showError(error.message || 'Erreur lors de l’enregistrement du solde');
        }
    };

    const columns: CustomTableColumn<BankAccountRow>[] = [
        {
            data: 'bank',
            label: 'Banque',
            sortable: true,
            render: (v: any) => v?.name || '-'
        },
        { data: 'account_name', label: 'Nom du compte', sortable: true, render: (v: unknown) => decodeHtmlEntities(v) },
        { data: 'account_number', label: 'Numéro de compte', sortable: true, render: (v: unknown) => decodeHtmlEntities(v) === '' ? '-' : decodeHtmlEntities(v) },
        { data: 'currency', label: 'Devise', sortable: true },
        { data: 'last_inserted_balance', label: 'Dernier solde', sortable: true, render: (v: any) => `${v ?? 0} ` },
        { data: 'last_inserted_balance_date', label: 'Date du dernier solde', sortable: true, render: (v: any) => `${v ?? '-'} ` },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: BankAccountRow) => (
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-1.5" onClick={() => handleEditName(row)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-1.5" onClick={() => {
                                setSelectedAccount(row);
                                setBalanceManagerOpen(true);
                            }}>
                                <History className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Historique & Soldes</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-1.5"
                                onClick={() => {
                                    setSelectedAccount(row);
                                    setQuickBalanceDialogOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Solde rapide</TooltipContent>
                    </Tooltip>

                    <DeleteModal
                        id={row.id}
                        itemName="Compte bancaire"
                        onDelete={() => handleDelete(row)}
                        reference={`Confirmer la suppression du compte "${row.account_number}" ?`}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'account_name', label: 'Nom du compte', type: 'text' },
        { field: 'account_number', label: 'Numéro de compte', type: 'text' },
    ];

    if (!banksLoading) {
        filters.push({
            field: 'bank_id',
            label: 'Banque',
            type: 'select',
            options: banks.map(b => ({ label: b.name, value: b.id }))
        });
    }

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 px-3 md:px-6">
                    <Heading title='Vos Comptes bancaires' />
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
                                    tableInstance?.refresh();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator className='mb-2' />

                <div className="flex flex-1 flex-col space-y-4 px-6">
                    <CustomTable
                        columns={columns}
                        url={ROUTES.bankAccounts.index}
                        filters={filters}
                        onInit={(instance: any) => setTableInstance(instance)}
                    />
                </div>

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
                                    tableInstance?.refresh();
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
                            <BalanceManager accountId={selectedAccount.id} accountCurrency={selectedAccount.currency} onParentTableRefresh={() => tableInstance?.refresh()} />
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

export default Index;
