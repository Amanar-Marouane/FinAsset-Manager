'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
    title?: string;
    duration: number;
}

interface ToastOptions {
    title?: string;
    duration?: number;
}

interface ToastContextType {
    toast: {
        success: (message: string, options?: ToastOptions) => number;
        error: (message: string, options?: ToastOptions) => number;
        warning: (message: string, options?: ToastOptions) => number;
        info: (message: string, options?: ToastOptions) => number;
    };
    removeToast: (id: number) => void;
}

interface ToastProviderProps {
    children: ReactNode;
}

interface ToastContainerProps {
    toasts: ToastItem[];
    removeToast: (id: number) => void;
}

interface ToastComponentProps {
    toast: ToastItem;
    onRemove: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((toast: Partial<ToastItem> & { message: string }): number => {
        const id = Date.now() + Math.random();
        const newToast: ToastItem = {
            id,
            type: 'info',
            duration: 5000,
            ...toast,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove toast after duration
        setTimeout(() => {
            removeToast(id);
        }, newToast.duration);

        return id;
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (message: string, options: ToastOptions = {}): number => addToast({ type: 'success', message, ...options }),
        error: (message: string, options: ToastOptions = {}): number => addToast({ type: 'error', message, ...options }),
        warning: (message: string, options: ToastOptions = {}): number => addToast({ type: 'warning', message, ...options }),
        info: (message: string, options: ToastOptions = {}): number => addToast({ type: 'info', message, ...options }),
    };

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
    const getIcon = (type: ToastType): React.ReactElement => {
        const iconProps = { className: "h-5 w-5 shrink-0" };
        switch (type) {
            case 'success':
                return <CheckCircle {...iconProps} className="h-5 w-5 shrink-0 text-green-600" />;
            case 'error':
                return <AlertCircle {...iconProps} className="h-5 w-5 shrink-0 text-red-600" />;
            case 'warning':
                return <AlertTriangle {...iconProps} className="h-5 w-5 shrink-0 text-amber-600" />;
            case 'info':
            default:
                return <Info {...iconProps} className="h-5 w-5 shrink-0 text-blue-600" />;
        }
    };

    const getToastStyles = (type: ToastType): string => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-300 text-green-900 dark:bg-green-900/95 dark:border-green-700 dark:text-green-100';
            case 'error':
                return 'bg-red-50 border-red-300 text-red-900 dark:bg-red-900/95 dark:border-red-700 dark:text-red-100';
            case 'warning':
                return 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-900/95 dark:border-amber-700 dark:text-amber-100';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/95 dark:border-blue-700 dark:text-blue-100';
        }
    };

    return (
        <div
            className={cn(
                "relative flex items-start gap-3 p-4 border rounded-lg shadow-2xl backdrop-blur-sm pointer-events-auto animate-in slide-in-from-right-full duration-300",
                getToastStyles(toast.type)
            )}
        >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
                {toast.title != null && (
                    <p className="font-semibold text-sm mb-1">{toast.title}</p>
                )}
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
                onClick={onRemove}
                className="shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/20 transition-colors pointer-events-auto"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};
