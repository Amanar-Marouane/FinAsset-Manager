'use client';

import { APP_ROUTES } from '@/constants/app-routes';
import { ROUTES } from '@/constants/routes';
import useApi, { ApiError } from '@/hooks/use-api';
import { useAppContext } from '@/hooks/use-app-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { createContext, useState } from 'react';
import { FieldErrors, useForm, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { z as zod } from 'zod';
import LoadingView from '../animations/loading-view';
import UnexpectedError from '../errors/UnexpectedError';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Credentials, User } from '@/contexts/AppProvider';
import { SafeString } from '@/utils/safe-string';

interface SignInFormContextType {
    register: UseFormRegister<SignInFormValues>;
    watch: UseFormWatch<SignInFormValues>;
    formState: {
        errors: FieldErrors<SignInFormValues>;
    };
}

export const Context = createContext<SignInFormContextType | undefined>(undefined);

type SignInFormValues = {
    email: string;
    password: string;
};

const SignInForm = () => {
    const schema = zod.object({
        email: zod.email({ message: 'Veuillez entrer une adresse e-mail valide' }),
        password: zod.string().min(1, { message: 'Le mot de passe est requis' })
    });

    const { showError, showSuccess, setIsAuthenticated, setUser } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignInFormValues>({
        resolver: zodResolver(schema)
    });

    const { trigger } = useApi();

    const onSubmit = async (credentials: Credentials): Promise<void> => {
        setIsLoading(true);

        try {
            const { data, error } = await trigger<{ data: { user: User, access_token: string, refresh_token: string } }>(ROUTES.login, {
                method: 'post',
                data: credentials,
            });

            if (error) {
                throw new Error(error.message || 'Login failed');
            }

            setUser(data?.data.user || null);
            setIsAuthenticated(true);

            // Simulate storing tokens
            localStorage.setItem('access-token', data?.data.access_token || 'fake-access-token');
            localStorage.setItem('refresh-token', data?.data.refresh_token || 'fake-refresh-token');

            showSuccess('Login successful!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setIsAuthenticated(false);
            showError(SafeString(message, 'Login failed'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingView />;

    return (
        <Context.Provider value={{ register, watch, formState: { errors } }}>
            <main className='grid min-h-screen w-full'>
                <section className='flex items-center justify-center bg-background p-6 sm:p-8'>
                    <div className='w-full max-w-md'>
                        <div className='mb-8 text-center'>
                            <img
                                src='/favicon.png' // Votre logo
                                alt="Logo"
                                className='mx-auto h-14 w-auto mb-4'
                            />
                            <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                                Connexion à votre espace
                            </h2>
                            <p className='text-muted-foreground mt-2'>
                                Heureux de vous revoir !
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                            <Input
                                register={() => register("email")} icon='Mail' label='E-mail'
                                name='email' type='email' placeholder='nom@exemple.com'
                                required={true}
                            />
                            <Input
                                register={() => register("password")} icon='Lock' label='Mot de passe'
                                name='password' type='password' placeholder='********'
                                required={true}
                            />
                            <Button type='submit' isLoading={isLoading} loadingLabel='Connexion...'
                                label='Se connecter' fullWidth className='py-6 text-base font-semibold mt-2'
                            />

                            <Link href={APP_ROUTES.forgotPassword}
                                className='text-primary hover:underline text-sm font-medium block text-center'>
                                Mot de passe oublié ?
                            </Link>
                        </form>
                    </div>
                </section>
            </main>
        </Context.Provider>
    );
};

export default SignInForm;