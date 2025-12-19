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
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from "zod";

type BankRow = { id: string | number; name: string };

const Index = () => {
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<BankRow> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BankRow | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        try {
            await trigger(ROUTES.banks.delete(id), { method: "delete" });
            tableInstance?.refresh();
        } catch (e) {
            showError((e as ApiError).message || "Erreur lors de la suppression de la banque");
        }
    };

    const handleEdit = (bank: BankRow) => {
        setSelectedBank(bank);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<BankRow>[] = [
        { data: "id", label: "Référence", sortable: true },
        { data: "name", label: "Nom", sortable: true },
        {
            data: "actions",
            label: "Actions",
            sortable: false,
            render: (_v, row) => (
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
                        itemName="Banque"
                        onDelete={() => handleDelete(row.id)}
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
                    <Heading title="Banques" />
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle Banque
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Ajouter une banque</DialogTitle>
                            </DialogHeader>
                            <BankForm
                                onSuccess={() => {
                                    setCreateDialogOpen(false);
                                    tableInstance?.refresh();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator className="mb-2" />

                <div className="flex flex-1 flex-col space-y-4">
                    <CustomTable
                        columns={columns}
                        url={ROUTES.banks.index}
                        filters={filters}
                        onInit={(instance: any) => setTableInstance(instance)}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier la banque</DialogTitle>
                        </DialogHeader>
                        {selectedBank && (
                            <BankForm
                                bank={selectedBank}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedBank(null);
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

const bankSchema = zod.object({
    name: zod.string().min(1, "Le nom est requis").max(255, "Le nom ne doit pas dépasser 255 caractères"),
});

type BankFormValues = zod.infer<typeof bankSchema>;

const BankForm = ({ onSuccess, bank }: { onSuccess: () => void; bank?: BankRow }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<BankFormValues>({
        resolver: zodResolver(bankSchema),
        defaultValues: { name: bank?.name || "" },
    });

    const onSubmit = async (values: BankFormValues) => {
        setIsSubmitting(true);
        try {
            if (bank) {
                await trigger(ROUTES.banks.update(bank.id), { method: "put", data: values });
                showSuccess("Banque modifiée");
            } else {
                await trigger(ROUTES.banks.store, { method: "post", data: values });
                showSuccess("Banque créée");
            }
            onSuccess();
        } catch (e) {
            showError((e as ApiError).message || "Erreur lors de l'enregistrement de la banque");
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
                                <Input placeholder="Entrez le nom de la banque" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : bank ? "Modifier" : "Créer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default Index;
