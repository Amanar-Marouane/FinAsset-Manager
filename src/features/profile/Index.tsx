"use client";

import LoadingView from "@/components/animations/loading-view";
import PageContainer from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading } from "@/components/ui/heading";
import { ROUTES } from "@/constants/routes";
import { AppContext } from "@/contexts/AppProvider";
import useApi from "@/hooks/use-api";
import { backErrors } from "@/utils/back-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Mail, Shield, KeyRound } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAppContext } from "@/hooks/use-app-context";

const passwordSchema = z
    .object({
        current_password: z.string().min(1, "Le mot de passe actuel est requis"),
        new_password: z
            .string()
            .min(8, "Le mot de passe doit contenir au moins 8 caractères")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
                "Le mot de passe doit contenir une lettre minuscule, une majuscule, un chiffre et un caractère spécial"
            ),
        new_password_confirmation: z.string(),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
        message: "Les mots de passe ne correspondent pas",
        path: ["new_password_confirmation"],
    });

export const SettingsContext = createContext<any>(null);

export default function ProfileViewPage() {
    const { user } = useAppContext();
    if (!user) return <LoadingView />;

    const getInitials = (name?: string) =>
        (name || "U")
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <PageContainer className="w-full">
            <div className="space-y-8 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-xl font-semibold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Heading title={user.name ?? "Utilisateur"} size="lg" />
                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {user.email ?? "—"}
                            </div>
                        </div>
                    </div>
                </div>

                <ClientSettings />
            </div>
        </PageContainer>
    );
}

const SettingsContent = () => {
    const [activeTab, setActiveTab] = useState("security");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useApi();
    const { showSuccess, showError } = useAppContext();

    const {
        register,
        handleSubmit,
        formState: { errors: passwordErrors },
        reset,
    } = useForm({
        resolver: zodResolver(passwordSchema),
    });

    const onPasswordSubmit = async (formData: z.infer<typeof passwordSchema>) => {
        setIsSubmitting(true);
        try {
            await trigger(ROUTES.changePassword, {
                method: "post",
                data: {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    new_password_confirmation: formData.new_password_confirmation,
                },
            });
            showSuccess("Votre mot de passe a été modifié avec succès.");
            reset({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error: any) {
            backErrors(error);
            showError(error?.message || "Une erreur est survenue lors de la modification du mot de passe.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SettingsContext.Provider value={{ register, formState: { errors: passwordErrors } }}>
            <div className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Sécurité</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5" />
                                    Changer le mot de passe
                                </CardTitle>
                                <CardDescription>
                                    Mettez à jour votre mot de passe pour renforcer la sécurité de votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <Input
                                        icon="Lock"
                                        label="Mot de passe actuel"
                                        name="current_password"
                                        type="password"
                                        required={false}
                                        register={() => register('current_password')}
                                        placeholder="Entrez votre mot de passe actuel"
                                    />

                                    <Input
                                        icon="Lock"
                                        label="Nouveau mot de passe"
                                        name="new_password"
                                        type="password"
                                        required={false}
                                        register={() => register('new_password')}
                                        placeholder="Entrez votre nouveau mot de passe"
                                    />

                                    <Input
                                        icon="Lock"
                                        label="Confirmer le mot de passe"
                                        name="new_password_confirmation"
                                        type="password"
                                        required={false}
                                        register={() => register('new_password_confirmation')}
                                        placeholder="Confirmez votre nouveau mot de passe"
                                    />

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            type="submit"
                                            isLoading={isSubmitting}
                                            loadingLabel="Mise à jour en cours..."
                                            label="Mettre à jour le mot de passe"
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SettingsContext.Provider>
    );
};

const ClientSettings = () => <SettingsContent />;
