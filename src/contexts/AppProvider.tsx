'use client';

import { ROUTES } from '@/constants/routes';
import useApi from '@/hooks/use-api';
import useUser from '@/hooks/use-user';
import { SafeString } from '@/utils/safe-string';
import { createContext, JSX, ReactNode, useEffect, useState } from 'react';

export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  [key: string]: unknown;
}

// Add credentials type and move it before the context type so it can be referenced
export type Credentials = {
  email?: string;
  name?: string;
};

export interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  successMessage: string | null;
  showSuccess: (msg: string) => void;
  errorMessage: string | null;
  showError: (msg: string) => void;
  warningMessage: string | null;
  showWarning: (msg: string) => void;
  infoMessage: string | null;
  showInfo: (msg: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  logout: () => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  toastDuration?: number;
}

const AppProvider = ({
  children,
  initialUser = null,
  toastDuration = 3000,
}: AppProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { client, isAuth, loading } = useUser();
  const { trigger } = useApi();

  useEffect(() => {
    setUser(client);
    setIsAuthenticated(isAuth);
    setIsLoading(loading);
  }, [loading]);

  // Toast message handlers
  const showSuccess = (msg: string): void => {
    setSuccessMessage(msg);
    console.log('SUCCESS:', msg);
  };

  const showError = (msg: string): void => {
    setErrorMessage(msg);
    console.error('ERROR:', msg);
  };

  const showWarning = (msg: string): void => {
    setWarningMessage(msg);
    console.warn('WARNING:', msg);
  };

  const showInfo = (msg: string): void => {
    setInfoMessage(msg);
    console.info('INFO:', msg);
  };

  // General toast handler
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
    switch (type) {
      case 'success':
        showSuccess(message);
        break;
      case 'error':
        showError(message);
        break;
      case 'warning':
        showWarning(message);
        break;
      case 'info':
        showInfo(message);
        break;
      default:
        console.log(message);
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (successMessage != null) {
      const timer = setTimeout((): void => setSuccessMessage(null), toastDuration);
      return (): void => clearTimeout(timer);
    }
    return (): void => { };
  }, [successMessage, toastDuration]);

  useEffect(() => {
    if (errorMessage != null) {
      const timer = setTimeout((): void => setErrorMessage(null), toastDuration);
      return (): void => clearTimeout(timer);
    }
    return (): void => { };
  }, [errorMessage, toastDuration]);

  useEffect(() => {
    if (warningMessage != null) {
      const timer = setTimeout((): void => setWarningMessage(null), toastDuration);
      return (): void => clearTimeout(timer);
    }
    return (): void => { };
  }, [warningMessage, toastDuration]);

  useEffect(() => {
    if (infoMessage != null) {
      const timer = setTimeout((): void => setInfoMessage(null), toastDuration);
      return (): void => clearTimeout(timer);
    }
    return (): void => { };
  }, [infoMessage, toastDuration]);

  const logout = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);

    try {
      const { error, status } = await trigger(ROUTES.logout, { method: 'post' });

      if (status === 204) {
        setIsAuthenticated(false);
        setUser(null);
        showSuccess('Vous avez été déconnecté(e) avec succès');
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
      } else if (error) {
        showError(error?.response?.data?.message || 'Une erreur est survenue');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showError(SafeString(message, 'Logout failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        successMessage,
        showSuccess,
        errorMessage,
        showError,
        warningMessage,
        showWarning,
        infoMessage,
        showInfo,
        isLoading,
        setIsLoading,
        logout,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
