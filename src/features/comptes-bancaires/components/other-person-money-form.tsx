"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import useApi, { ApiError } from "@/hooks/use-api";
import { useAppContext } from "@/hooks/use-app-context";
import { OthersBalances } from "@/types/bank-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from 'zod';

const otherPersonMoneySchema = zod.object({
    date: zod.string().min(1, { message: 'Date requise' }),
    other_person_money: zod.string().min(1, { message: 'Montant requis' }),
});

type OtherPersonMoneyFormValues = zod.infer<typeof otherPersonMoneySchema>;

interface OtherPersonMoneyFormProps {
    accountId: number;
    othersBalances: OthersBalances[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const OtherPersonMoneyForm = ({ accountId, othersBalances, onSuccess, onCancel }: OtherPersonMoneyFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { trigger } = useApi();
    const { showError, showSuccess } = useAppContext();

    const form = useForm<OtherPersonMoneyFormValues>({
        resolver: zodResolver(otherPersonMoneySchema),
        defaultValues: {
            date: new Date().toISOString().slice(0, 7),
            other_person_money: '',
        }
    });

    const fetchExistingRecord = (date: string) => {
        setIsLoading(true);
        try {
            const existing = othersBalances.find(b => b.date === date);
            if (existing) {
                form.setValue('other_person_money', existing.amount);
            } else {
                form.setValue('other_person_money', '');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const currentDate = form.getValues('date');
        if (currentDate) {
            fetchExistingRecord(currentDate);
        }
    }, [accountId, othersBalances]);

    const handleDateChange = (date: string) => {
        form.setValue('date', date);
        fetchExistingRecord(date);
    };

    const onSubmit = async (values: OtherPersonMoneyFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                date: values.date,
                amount: Number(values.other_person_money)
            };
            await trigger(ROUTES.othersBalances.store, { method: 'post', data: payload });
            showSuccess("Montant des fonds d'autrui mis à jour avec succès");
            onSuccess();
        } catch (e) {
            const err = e as ApiError;
            showError(err.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="month"
                                    {...field}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="other_person_money"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Argent d'autre personne</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
