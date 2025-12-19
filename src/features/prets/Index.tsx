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
import { Pret } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<Pret> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedPret, setSelectedPret] = useState<Pret | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.prets.delete(id), { method: 'delete' });
            tableInstance?.refresh();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression du prêt');
        }
    };

    const handleEdit = (pret: Pret) => {
        setSelectedPret(pret);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<Pret>[] = [
        { data: 'id', label: 'Réf', sortable: true },
        {
            data: 'montant',
            label: 'Montant',
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
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: Pret) => (
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
                        itemName="Prêt"
                        onDelete={() => handleDelete(row.id)}
                        reference={`Prêt #${row.id}`}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'montant', label: 'Montant', type: 'number' },
        { field: 'monthly_payment', label: 'Mensualité', type: 'number' },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex justify-between items-center px-6">
                    <Heading title='Vos Prêts' />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className='h-4 w-4 mr-2' />
                                Nouveau Prêt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter un prêt</DialogTitle>
                            </DialogHeader>
                            <PretForm
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
                        url={ROUTES.prets.index}
                        filters={filters}
                        onInit={setTableInstance}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le prêt</DialogTitle>
                        </DialogHeader>
                        {selectedPret ? (
                            <PretForm
                                initialData={selectedPret}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedPret(null);
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

const pretSchema = zod.object({
    montant: zod.string().min(1, 'Le montant est requis'),
    monthly_payment: zod.string().optional(),
});

type PretFormValues = zod.infer<typeof pretSchema>;

const PretForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Pret }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<PretFormValues>({
        resolver: zodResolver(pretSchema),
        defaultValues: {
            montant: initialData?.montant || '',
            monthly_payment: initialData?.monthly_payment || '',
        }
    });

    const onSubmit = async (values: PretFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                montant: values.montant,
                monthly_payment: values.monthly_payment || null,
            };

            if (initialData) {
                await trigger(ROUTES.prets.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.prets.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Prêt modifié' : 'Prêt ajouté');
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
                <FormField
                    control={form.control}
                    name="montant"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Montant</FormLabel>
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
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
                </div>
            </form>
        </Form>
    );
};

export default Index;
