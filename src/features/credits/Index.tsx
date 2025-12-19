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
import { Separator } from "@/components/ui/separator";
import CustomTable from "@/components/ui/table/custom-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { Credit } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<Credit> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.credits.delete(id), { method: 'delete' });
            tableInstance?.refresh();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression du crédit');
        }
    };

    const handleEdit = (credit: Credit) => {
        setSelectedCredit(credit);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<Credit>[] = [
        { data: 'id', label: 'Réf', sortable: true },
        { data: 'organization', label: 'Organisme', sortable: true, render: (v: any) => v || '-' },
        {
            data: 'montant',
            label: 'Montant (avec intérêts)',
            sortable: true,
            render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) : '-'
        },
        {
            data: 'monthly_payment',
            label: 'Mensualité',
            sortable: true,
            render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) + '/mois' : '-'
        },
        {
            data: 'montant_net',
            label: 'Montant net',
            sortable: true,
            render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) : '-'
        },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: Credit) => (
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-1.5" onClick={() => handleEdit(row)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifier</TooltipContent>
                    </Tooltip>
                    <DeleteModal
                        id={row.id}
                        itemName="Crédit"
                        onDelete={() => handleDelete(row.id)}
                        reference={row.organization || `Crédit #${row.id}`}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'organization', label: 'Organisme', type: 'text' },
        { field: 'montant', label: 'Montant', type: 'number' },
        { field: 'monthly_payment', label: 'Mensualité', type: 'number' },
        { field: 'montant_net', label: 'Montant net', type: 'number' },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 md:px-6">
                    <Heading title='Vos Crédits' />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className='h-4 w-4 mr-2' />
                                Nouveau Crédit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter un crédit</DialogTitle>
                            </DialogHeader>
                            <CreditForm
                                onSuccess={() => {
                                    setCreateDialogOpen(false);
                                    tableInstance?.refresh();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator className='mb-2' />

                <div className="flex flex-1 flex-col space-y-4 px-3 md:px-6">
                    <CustomTable
                        columns={columns}
                        url={ROUTES.credits.index}
                        filters={filters}
                        onInit={setTableInstance}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le crédit</DialogTitle>
                        </DialogHeader>
                        {selectedCredit ? (
                            <CreditForm
                                initialData={selectedCredit}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedCredit(null);
                                    tableInstance?.refresh();
                                }}
                            />
                        ) : <UnexpectedError error={null} />}
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
};

const creditSchema = zod.object({
    montant: zod.string().min(1, 'Le montant est requis'),
    monthly_payment: zod.string().optional(),
    organization: zod.string().optional(),
    montant_net: zod.string().optional(),
});

type CreditFormValues = zod.infer<typeof creditSchema>;

const CreditForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Credit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<CreditFormValues>({
        resolver: zodResolver(creditSchema),
        defaultValues: {
            montant: initialData?.montant || '',
            monthly_payment: initialData?.monthly_payment || '',
            organization: initialData?.organization || '',
            montant_net: (initialData as any)?.montant_net || '',
        }
    });

    const onSubmit = async (values: CreditFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                montant: values.montant,
                monthly_payment: values.monthly_payment || null,
                organization: values.organization || null,
                montant_net: values.montant_net || null,
            };

            if (initialData) {
                await trigger(ROUTES.credits.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.credits.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Crédit modifié' : 'Crédit ajouté');
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Organisme</FormLabel>
                                <FormControl><Input placeholder="Ex: Banque Populaire" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="montant_net"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant net</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <FormField
                        control={form.control}
                        name="montant"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Montant (avec intérêts)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="monthly_payment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mensualité</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
            </form>
        </Form>
    );
};

export default Index;
