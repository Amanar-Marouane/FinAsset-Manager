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
import { Project } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<Project> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.projects.delete(id), { method: 'delete' });
            tableInstance?.refresh();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || 'Erreur lors de la suppression du projet');
        }
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<Project>[] = [
        { data: 'id', label: 'Réf', sortable: true },
        { data: 'name', label: 'Nom', sortable: true },
        {
            data: 'capital',
            label: 'Capital',
            sortable: true,
            render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) : '-'
        },
        {
            data: 'net',
            label: 'Net Mensuel',
            sortable: true,
            render: (v: any) => v ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(Number(v)) + '/mois' : '-'
        },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_: unknown, row: Project) => (
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
                        itemName="Projet"
                        onDelete={() => handleDelete(row.id)}
                        reference={row.name}
                    />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: 'name', label: 'Nom', type: 'text' },
        { field: 'capital', label: 'Capital', type: 'number' },
        { field: 'net', label: 'Net Mensuel', type: 'number' },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 md:px-6">
                    <Heading title='Vos Projets' />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className='h-4 w-4 mr-2' />
                                Nouveau Projet
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter un projet</DialogTitle>
                            </DialogHeader>
                            <ProjectForm
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
                        url={ROUTES.projects.index}
                        filters={filters}
                        onInit={setTableInstance}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le projet</DialogTitle>
                        </DialogHeader>
                        {selectedProject ? (
                            <ProjectForm
                                initialData={selectedProject}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedProject(null);
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

const projectSchema = zod.object({
    name: zod.string().min(1, 'Le nom est requis'),
    capital: zod.string().min(1, 'Le capital est requis'),
    net: zod.string().min(1, 'Le net est requis'),
});

type ProjectFormValues = zod.infer<typeof projectSchema>;

const ProjectForm = ({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Project }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: initialData?.name || '',
            capital: initialData?.capital || '',
            net: initialData?.net || '',
        }
    });

    const onSubmit = async (values: ProjectFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: values.name,
                capital: values.capital,
                net: values.net,
            };

            if (initialData) {
                await trigger(ROUTES.projects.update(initialData.id), { method: 'put', data: payload });
            } else {
                await trigger(ROUTES.projects.store, { method: 'post', data: payload });
            }

            showSuccess(initialData ? 'Projet modifié' : 'Projet ajouté');
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
                                <FormControl><Input placeholder="Ex: Projet Immobilier" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="capital"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capital</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <FormField
                        control={form.control}
                        name="net"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Net Mensuel</FormLabel>
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
