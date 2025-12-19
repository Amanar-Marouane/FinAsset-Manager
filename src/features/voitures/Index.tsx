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
import { Car } from "@/types";
import { decodeHtmlEntities } from "@/utils/html-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<Car> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.cars.delete(id), { method: 'delete' });
            tableInstance?.refresh();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression de la voiture');
        }
    };

    const handleEdit = (car: Car) => {
        setSelectedCar(car);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<Car>[] = [
        { data: 'id', label: 'Réf', sortable: true },
        { data: 'name', label: 'Nom', sortable: true, render: (v: any) => decodeHtmlEntities(v) },
        { data: 'model', label: 'Modèle', sortable: true, render: (v: any) => decodeHtmlEntities(v || '-') },
        { data: 'bought_at', label: 'Acheté le', sortable: true, render: (v: any) => v || '-' },
        { data: 'price', label: 'Prix', sortable: true, render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) : '-' },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: Car) => (
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
                        itemName="Voiture"
                        onDelete={() => handleDelete(row.id)}
                        reference={row.name}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'name', label: 'Nom', type: 'text' },
        { field: 'model', label: 'Modèle', type: 'text' },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 md:px-6">
                    <Heading title='Vos Voitures' />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className='h-4 w-4 mr-2' />
                                Nouvelle Voiture
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter une voiture</DialogTitle>
                            </DialogHeader>
                            <CarForm
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
                        url={ROUTES.cars.index}
                        filters={filters}
                        onInit={setTableInstance}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier la voiture</DialogTitle>
                        </DialogHeader>
                        {selectedCar ? (
                            <CarForm
                                initialData={selectedCar}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedCar(null);
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

const carSchema = zod.object({
    name: zod.string().min(1, 'Le nom est requis'),
    model: zod.string().optional(),
    bought_at: zod.string().optional(),
    price: zod.string().optional(),
});

type CarFormValues = zod.infer<typeof carSchema>;

const CarForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Car }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<CarFormValues>({
        resolver: zodResolver(carSchema),
        defaultValues: {
            name: initialData?.name || '',
            model: initialData?.model || '',
            bought_at: initialData?.bought_at?.split('T')[0] || '',
            price: initialData?.price?.toString() || '',
        }
    });

    const onSubmit = async (values: CarFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...values,
                price: values.price ? parseFloat(values.price) : null,
            };

            if (initialData) {
                await trigger(ROUTES.cars.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.cars.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Voiture modifiée' : 'Voiture ajoutée');
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
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl><Input placeholder="Ex: BMW Série 3" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modèle</FormLabel>
                                <FormControl><Input placeholder="Ex: 2025, E46" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prix</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bought_at"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date d'achat</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
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
