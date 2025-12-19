"use client"

import PageContainer from "@/components/layout/page-container";
import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from "@/components/custom/data-table/types";
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
import { decodeHtmlEntities } from "@/utils/html-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from "zod";

type BuildingTypeRow = {
    id: string | number;
    name: string;
};

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<BuildingTypeRow> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<BuildingTypeRow | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.buildingTypes.delete(id), { method: "delete" });
            tableInstance?.refresh();
        } catch (err) {
            showError((err as ApiError).message || "Erreur lors de la suppression du type de bâtiment");
        }
    };

    const handleEdit = (row: BuildingTypeRow) => {
        setSelectedType(row);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<BuildingTypeRow>[] = [
        { data: "id", label: "Référence", sortable: true },
        {
            data: "name",
            label: "Nom",
            sortable: true,
            render: (value: unknown) => decodeHtmlEntities(value),
        },
        {
            data: "actions",
            label: "Actions",
            sortable: false,
            render: (_v: unknown, row: BuildingTypeRow) => (
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
                        itemName="Type de bâtiment"
                        onDelete={(id: string | number) => handleDelete(id)}
                        reference={row.name || "..."}
                    />
                </div>
            ),
        },
    ];

    const filters: CustomTableFilterConfig[] = [
        { field: "id", label: "Référence", type: "text" },
        { field: "name", label: "Nom", type: "text" },
    ];

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <Heading title="Types de bâtiment" />
                    <div className="flex items-center space-x-2">
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nouveau type de bâtiment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Créer un nouveau type</DialogTitle>
                                </DialogHeader>
                                <CreateBuildingTypeForm
                                    onSuccess={() => {
                                        setCreateDialogOpen(false);
                                        tableInstance?.refresh();
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className="mb-2" />

                <div className="flex flex-1 flex-col space-y-4">
                    <CustomTable
                        columns={columns}
                        url={ROUTES.buildingTypes.index}
                        filters={filters}
                        onInit={(instance: any) => setTableInstance(instance)}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier le type</DialogTitle>
                        </DialogHeader>
                        {selectedType && (
                            <EditBuildingTypeForm
                                typeRow={selectedType}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedType(null);
                                    tableInstance?.refresh();
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
};

type CreateBuildingTypeFormProps = {
    onSuccess?: () => void;
};

const CreateBuildingTypeForm = ({ onSuccess }: CreateBuildingTypeFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm({
        resolver: zodResolver(
            zod.object({
                name: zod.string().min(1, { message: "Le nom est requis" }).max(255, { message: "Le nom ne doit pas dépasser 255 caractères" }),
            })
        ),
        defaultValues: { name: "" },
    });

    const onSubmit = async (data: { name: string }) => {
        setIsSubmitting(true);
        try {
            await trigger(ROUTES.buildingTypes.store, {
                method: "post",
                data,
            });
            showSuccess("Type de bâtiment créé avec succès");
            form.reset();
            onSuccess?.();
        } catch (err) {
            showError((err as ApiError).message || "Erreur lors de la création du type de bâtiment");
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
                            <FormControl>
                                <Input placeholder="Entrez le nom du type de bâtiment" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Création..." : "Créer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

type EditBuildingTypeFormProps = {
    onSuccess?: () => void;
    typeRow: BuildingTypeRow;
};

const EditBuildingTypeForm = ({ onSuccess, typeRow }: EditBuildingTypeFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm({
        resolver: zodResolver(
            zod.object({
                name: zod.string().min(1, { message: "Le nom est requis" }).max(255, { message: "Le nom ne doit pas dépasser 255 caractères" }),
            })
        ),
        defaultValues: { name: typeRow.name },
    });

    const onSubmit = async (data: { name: string }) => {
        setIsSubmitting(true);
        try {
            await trigger(ROUTES.buildingTypes.update(typeRow.id), {
                method: "put",
                data,
            });

            showSuccess("Type de bâtiment modifié avec succès");
            onSuccess?.();
        } catch (err) {
            showError((err as ApiError).message || "Erreur lors de la modification du type de bâtiment");
        }
        finally {
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
                            <FormControl>
                                <Input placeholder="Entrez le nom du type de bâtiment" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Modification..." : "Modifier"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default Index;
