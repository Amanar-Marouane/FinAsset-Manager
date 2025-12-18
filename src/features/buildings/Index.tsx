"use client"

import PageContainer from "@/components/layout/page-container";
import { CustomTableColumn, CustomTableFilterConfig, UseCustomTableReturnType } from "@/components/custom/data-table/types";
import UnexpectedError from "@/components/errors/UnexpectedError";
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
import useApi from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import useBuildingTypes from "@/hooks/use-building-types";
import { BuildingType } from "@/types";
import { decodeHtmlEntities } from "@/utils/html-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

type BuildingRow = {
    id: string;
    name: string;
    address: string;
    building_type: { id: string; name: string };
};

const Index = () => {
    const { buildingTypes, error, isLoading: buildingTypesLoading } = useBuildingTypes();
    const [tableInstance, setTableInstance] = useState<UseCustomTableReturnType<BuildingRow> | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingRow | null>(null);
    const { trigger } = useApi();
    const { showError } = useAppContext();

    const handleDelete = async (id: string | number): Promise<void> => {
        const { error } = await trigger(ROUTES.buildings.delete(id), {
            method: 'delete',
        });

        if (error) {
            showError((error as any).response?.data?.message || 'Erreur lors de la suppression du bâtiment');
        } else {
            tableInstance?.refresh();
        }
    };

    const handleEdit = (building: BuildingRow) => {
        setSelectedBuilding(building);
        setEditDialogOpen(true);
    };

    const columns: CustomTableColumn<BuildingRow>[] = [
        {
            data: 'id',
            label: 'Référence',
            sortable: true
        },
        {
            data: 'name',
            label: 'Nom',
            sortable: true,
            render: (value: unknown) => decodeHtmlEntities(value)
        },
        {
            data: 'address',
            label: 'Adresse',
            sortable: true,
            render: (value: unknown) => decodeHtmlEntities(value)
        },
        {
            data: 'building_type',
            label: 'Type de bâtiment',
            sortable: true,
            render: (_value: unknown, row: BuildingRow) =>
                decodeHtmlEntities(row.building_type?.name || '')
        },
        {
            data: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_value: unknown, row: BuildingRow) => (
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-1.5"
                                onClick={() => handleEdit(row)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Modifier
                        </TooltipContent>
                    </Tooltip>
                    <DeleteModal
                        id={row.id} itemName="Bâtiment"
                        onDelete={(id: string | number) => { return handleDelete(id); }}
                        reference={row.name || '...'} />
                </div>
            )
        }
    ];

    const filters: CustomTableFilterConfig[] = [
        {
            field: 'id',
            label: 'Référence',
            type: 'text'
        },
        {
            field: 'name',
            label: 'Nom',
            type: 'text'
        },
        {
            field: 'address',
            label: 'Adresse',
            type: 'text'
        }
    ];

    if (!buildingTypesLoading && !error) {
        filters.push({
            field: 'building_type',
            label: 'Type de bâtiment',
            type: 'select',
            options: buildingTypes.map((type) => ({
                label: type.name,
                value: type.id
            }))
        }
        );
    }

    return (
        <PageContainer scrollable={false}>
            <div className="w-full flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <Heading title='Votre Bâtiments' />

                    <div className="flex items-center space-x-2">
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className='h-4 w-4 mr-2' />
                                    Nouveau Bâtiment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Créer un nouveau bâtiment</DialogTitle>
                                </DialogHeader>
                                <CreateBuildingForm
                                    onSuccess={() => {
                                        setCreateDialogOpen(false);
                                        tableInstance?.refresh();
                                    }}
                                    data={{
                                        buildingTypes: buildingTypes,
                                        error: error,
                                        buildingTypesLoading: buildingTypesLoading
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Separator className='mb-2' />

                <div className="flex flex-1 flex-col space-y-4">
                    <CustomTable
                        columns={columns}
                        url={ROUTES.buildings.index}
                        filters={filters}
                        onInit={(instance: any) => setTableInstance(instance)}
                    />
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier la ville</DialogTitle>
                        </DialogHeader>
                        {selectedBuilding && (
                            <EditBuildingForm
                                building={selectedBuilding}
                                data={{
                                    buildingTypes: buildingTypes,
                                    error: error,
                                    buildingTypesLoading: buildingTypesLoading
                                }}
                                onSuccess={() => {
                                    setEditDialogOpen(false);
                                    setSelectedBuilding(null);
                                    tableInstance?.refresh();
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    )
}

type CreateBuildingFormProps = {
    onSuccess?: () => void;
    data: {
        buildingTypes: BuildingType[],
        error: Error | null,
        buildingTypesLoading: boolean
    };
};

const CreateBuildingForm = ({ onSuccess, data }: CreateBuildingFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    if (data.error) {
        return <UnexpectedError error={data.error} />;
    }

    const form = useForm({
        resolver: zodResolver(zod.object({
            name: zod.string().min(1, { message: 'Le nom est requis' }).max(255, { message: 'Le nom ne doit pas dépasser 255 caractères' }),
            address: zod.string().min(1, { message: "L'adresse est requise" }).max(255, { message: "L'adresse ne doit pas dépasser 255 caractères" }),
            building_type_id: zod.string().min(1, { message: 'Le type de bâtiment est requis' }),
        })),
        defaultValues: {
            name: '',
            address: '',
            building_type_id: '',
        }
    });

    const onSubmit = async (data: { name: string }) => {
        setIsSubmitting(true);
        try {
            const { data: response, error } = await trigger(ROUTES.buildings.store, {
                method: 'post',
                data
            });

            if (response) {
                showSuccess('Type de bâtiment créé avec succès');
                form.reset();
                onSuccess?.();
            }

            if (error) {
                showError((error as any).response?.data?.message || 'Erreur lors de la création de la bâtiment');
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
                            <FormLabel>Nom bâtiment</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Entrez le nom du bâtiment"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Entrez l'adresse du bâtiment"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="building_type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de bâtiment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type de bâtiment" />
                                    </SelectTrigger>
                                </FormControl>
                                {data.buildingTypesLoading ? (
                                    <SelectContent>
                                        <SelectItem key={0} value={'none'}>
                                            Chargement...
                                        </SelectItem>
                                    </SelectContent>
                                ) : (
                                    <SelectContent>
                                        {data.buildingTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting || data.buildingTypesLoading}
                    >
                        {isSubmitting ? 'Création...' : 'Créer'}
                    </Button>
                </div>
            </form>
        </Form >
    )
}

type EditBuildingFormProps = {
    onSuccess?: () => void;
    building: BuildingRow;
    data: {
        buildingTypes: BuildingType[],
        error: Error | null,
        buildingTypesLoading: boolean
    };
};

const EditBuildingForm = ({ onSuccess, building, data }: EditBuildingFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();
    if (data.error) {
        return <UnexpectedError error={data.error} />;
    }

    const form = useForm({
        resolver: zodResolver(zod.object({
            name: zod.string().min(1, { message: 'Le nom est requis' }).max(255, { message: 'Le nom ne doit pas dépasser 255 caractères' }),
            address: zod.string().min(1, { message: "L'adresse est requise" }).max(255, { message: "L'adresse ne doit pas dépasser 255 caractères" }),
            building_type_id: zod.string().min(1, { message: 'Le type de bâtiment est requis' }),
        })),
        defaultValues: {
            name: building.name,
            address: building.address,
            building_type_id: building.building_type.id.toString(),
        }
    });

    const onSubmit = async (data: { name: string }) => {
        setIsSubmitting(true);
        try {
            const { data: response, error } = await trigger(ROUTES.buildings.update(building.id), {
                method: 'put',
                data
            });

            if (response) {
                showSuccess('Type de bâtiment modifié avec succès');
                form.reset();
                onSuccess?.();
            }

            if (error) {
                showError(error.response?.data?.message || 'Erreur lors de la modification du bâtiment');
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
                            <FormLabel>Nom bâtiment</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Entrez le nom du bâtiment"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Entrez l'adresse du bâtiment"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="building_type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de bâtiment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un type de bâtiment" />
                                    </SelectTrigger>
                                </FormControl>
                                {data.buildingTypesLoading ? (
                                    <SelectContent>
                                        <SelectItem key={0} value={'none'}>
                                            Chargement...
                                        </SelectItem>
                                    </SelectContent>
                                ) : (
                                    <SelectContent>
                                        {data.buildingTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting || data.buildingTypesLoading}
                    >
                        {isSubmitting ? 'Modification...' : 'Modifier'}
                    </Button>
                </div>
            </form>
        </Form >
    )
}

export default Index

// this is form for batiment type creation
// const CreateBuildingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const { trigger } = useApi();
//     const { buildingTypes, error, isLoading: buildingTypesLoading } = useBuildingTypes();
//     // const { showError, showSuccess } = useContext(AppContext);
//     if (error) {
//         return <UnexpectedError />;
//     }

//     const form = useForm({
//         resolver: zodResolver(zod.object({
//             name: zod.string().min(1, { message: 'Le nom est requis' }).max(255, { message: 'Le nom ne doit pas dépasser 255 caractères' }),
//         })),
//         defaultValues: {
//             name: '',
//         }
//     });

//     const onSubmit = async (data: { name: string }) => {
//         setIsSubmitting(true);
//         try {
//             const { data: response, error } = await trigger(ROUTES.buildingTypes.store, {
//                 method: 'POST',
//                 data
//             });

//             if (response) {
//                 // showSuccess('Type de bâtiment créé avec succès');
//                 form.reset();
//                 // onSuccess?.(); // This will call table reload and close dialog
//             }

//             if (error) {
//                 // showError(error.response?.data?.message || 'Erreur lors de la création de la ville');
//             }
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                 <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                         <FormItem>
//                             <FormLabel>Nom de la type de bâtiment</FormLabel>
//                             <FormControl>
//                                 <Input
//                                     placeholder="Entrez le nom de la type de bâtiment"
//                                     {...field}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                 />

//                 <div className="flex justify-end space-x-2">
//                     <Button
//                         type="submit"
//                         disabled={isSubmitting || buildingTypesLoading}
//                     >
//                         {isSubmitting ? 'Création...' : 'Créer'}
//                     </Button>
//                 </div>
//             </form>
//         </Form>
//     )
// }
