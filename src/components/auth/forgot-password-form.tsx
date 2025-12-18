'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Mail, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { APP_ROUTES } from '@/constants/app-routes';
import { ROUTES } from '@/constants/routes';
import useApi from '@/hooks/use-api';

import LoadingView from '../animations/loading-view';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// @ts-ignore
export const Context = createContext();

const ForgotPasswordForm = () => {
    const router = useRouter();
    const schema = zod.object({
        email: zod.email({ message: 'Veuillez entrer une adresse e-mail valide' }),
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const { trigger } = useApi();

    const onSubmit = async (formData: { email: string }) => {
        setIsLoading(true);
        setErrorStatus(null);
        setIsSuccess(false);

        try {
            const { error, status } = await trigger(ROUTES.forgotPassword, {
                data: formData,
                method: 'post',
            });

            if (error) {
                setErrorStatus(status || 500);
                return;
            }

            setIsSuccess(true);
            setIsSubmitted(true);

        } catch (e) {
            setErrorStatus(500);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingView />;

    // --- Vue après soumission du formulaire ---
    if (isSubmitted) {
        return (
            <main className='flex min-h-screen w-full items-center justify-center bg-background p-6'>
                <div className='w-full max-w-md text-center'>
                    {/* Success State */}
                    {isSuccess && (
                        <>
                            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600'>
                                <MailCheck size={32} />
                            </div>
                            <h1 className='mt-6 text-2xl font-bold tracking-tight text-foreground'>
                                E-mail envoyé avec succès
                            </h1>
                            <p className='text-muted-foreground mt-2'>
                                Un e-mail contenant un mot de passe temporaire a été envoyé à votre adresse. Vous devrez modifier ce mot de passe après connexion.
                            </p>
                        </>
                    )}

                    {/* Error States */}
                    {!isSuccess && (
                        <>
                            {errorStatus === 404 ? (
                                <>
                                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600'>
                                        <Mail size={32} />
                                    </div>
                                    <h1 className='mt-6 text-2xl font-bold tracking-tight text-foreground'>
                                        Adresse e-mail introuvable
                                    </h1>
                                    <p className='text-muted-foreground mt-2'>
                                        Nous n'avons pas trouvé de compte associé à cette adresse e-mail. Veuillez vérifier l'adresse saisie ou créer un nouveau compte.
                                    </p>
                                    <Button
                                        // @ts-ignore
                                        onClick={() => setIsSubmitted(false)}
                                        label='Réessayer'
                                        className='mt-4 w-full py-3'
                                        variant='outline'
                                    />
                                </>
                            ) : (
                                <>
                                    <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600'>
                                        <AlertCircle size={32} />
                                    </div>
                                    <h1 className='mt-6 text-2xl font-bold tracking-tight text-foreground'>
                                        Une erreur s'est produite
                                    </h1>
                                    <p className='text-muted-foreground mt-2'>
                                        Nous n'avons pas pu traiter votre demande. Veuillez réessayer dans quelques instants.
                                    </p>
                                    <Button
                                        // @ts-ignore
                                        onClick={() => setIsSubmitted(false)}
                                        label='Réessayer'
                                        className='mt-4 w-full py-3'
                                        variant='outline'
                                    />
                                </>
                            )}
                        </>
                    )}

                    <Button
                        onClick={() => router.push(APP_ROUTES.signIn)}
                        label='Retour à la page de connexion'
                        className='mt-8 w-full py-5'
                    />
                </div>
            </main>
        );
    }

    // --- Vue initiale du formulaire ---
    return (
        <Context.Provider value={{ register, watch, formState: { errors } }}>
            <main className='grid min-h-screen w-full'>
                <section className='flex items-center justify-center bg-background p-6 sm:p-8'>
                    <div className='w-full max-w-md'>
                        <div className='mb-8 text-center'>
                            <img
                                src='/favicon.png'
                                alt="Logo"
                                className='mx-auto h-14 w-auto mb-4'
                            />
                            <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                                Mot de passe oublié ?
                            </h2>
                            <p className='text-muted-foreground mt-2'>
                                Pas de panique. Entrez votre e-mail et nous vous enverrons un lien de réinitialisation.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            <Input
                                register={() => register('email')}
                                icon='Mail'
                                label='E-mail'
                                name='email'
                                type='email'
                                placeholder='nom@exemple.com'
                                required={true}
                                className=''
                            />
                            <Button
                                //@ts-ignore
                                type='submit'
                                isLoading={isLoading}
                                loadingLabel='Envoi en cours...'
                                label='Envoyer le lien de réinitialisation'
                                fullWidth
                                className='py-6 text-base font-semibold'
                            />
                        </form>

                        <div className='mt-8 text-center'>
                            <a
                                href={APP_ROUTES.signIn}
                                onClick={(e) => { e.preventDefault(); router.push(APP_ROUTES.signIn); }}
                                className='text-primary hover:underline text-sm font-medium'
                            >
                                Revenir à la page de connexion
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </Context.Provider>
    );
};

export default ForgotPasswordForm;