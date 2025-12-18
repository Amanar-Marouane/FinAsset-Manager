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
import useApi from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { Terrain } from "@/types";
import { decodeHtmlEntities } from "@/utils/html-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<Terrain> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        const { error } = await trigger(ROUTES.terrains.delete(id), { method: 'delete' });

        if (error) {
            showError((error as any).response?.data?.message || 'Erreur lors de la suppression du terrain');
        } else {
            tableInstance?.refresh();
        }
    };

    const handleEdit = (terrain: Terrain) => {
        setSelectedTerrain(terrain);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<Terrain>[] = [
        { data: 'id', label: 'Réf', sortable: true },
        { data: 'name', label: 'Nom', sortable: true, render: (v: any) => decodeHtmlEntities(v) },
        { data: 'address', label: 'Adresse', sortable: true, render: (v: any) => decodeHtmlEntities(v || '-') },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: Terrain) => (
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
                        itemName="Terrain"
                        onDelete={() => handleDelete(row.id)}
                        reference={row.name}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'name', label: 'Nom', type: 'text' },
        { field: 'address', label: 'Adresse', type: 'text' },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex justify-between items-center px-6">
                    <Heading title='Vos Terrains' />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className='h-4 w-4 mr-2' />
                                Nouveau Terrain
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter un terrain</DialogTitle>
                            </DialogHeader>
                            <TerrainForm
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
                        url={ROUTES.terrains.index}
                        filters={filters}
                        onInit={setTableInstance}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le terrain</DialogTitle>
                        </DialogHeader>
                        {selectedTerrain ? (
                            <TerrainForm
                                initialData={selectedTerrain}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedTerrain(null);
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

const terrainSchema = zod.object({
    name: zod.string().min(1, 'Le nom est requis'),
    address: zod.string().optional(),
});

type TerrainFormValues = zod.infer<typeof terrainSchema>;

const TerrainForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Terrain }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<TerrainFormValues>({
        resolver: zodResolver(terrainSchema),
        defaultValues: {
            name: initialData?.name || '',
            address: initialData?.address || '',
        }
    });

    const onSubmit = async (values: TerrainFormValues) => {
        setIsSubmitting(true);
        try {
            let response, error;
            if (initialData) {
                ({ data: response, error } = await trigger(ROUTES.terrains.update(initialData.id), { method: 'put', data: values }));
            } else {
                ({ data: response, error } = await trigger(ROUTES.terrains.store, { method: 'post', data: values }));
            }

            if (response) {
                showSuccess(initialData ? 'Terrain modifié' : 'Terrain ajouté');
                onSuccess();
            }
            if (error) {
                showError((error as any).response?.data?.message || 'Erreur lors de l\'enregistrement');
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl><Input placeholder="Ex: Terrain Villa" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl><Input placeholder="Ex: Casablanca, Californie" {...field} /></FormControl>
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
