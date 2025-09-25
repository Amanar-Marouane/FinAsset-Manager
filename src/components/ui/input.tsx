'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { Suspense, useContext, useState, useMemo, InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  icon?: string;
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  context?: React.Context<any> | null;
  value?: string;
}

const Input: React.FC<InputProps> = ({
  icon = '',
  name,
  label = '',
  type = 'text',
  required = true,
  placeholder = '',
  className,
  context = null,
  value = '',
  ...props
}) => {
  // Memoize the icon component to prevent re-renders
  const Icon = useMemo(() => {
    if (!icon) return null;

    return dynamic(() =>
      import('lucide-react').then((mod) => {
        const IconComponent = (mod as any)[icon] as LucideIcon;
        if (!IconComponent) {
          console.warn(`Icon "${icon}" not found in lucide-react`);
          return () => null;
        }
        return IconComponent;
      }), {
      ssr: false,
      loading: () => <div className="inline-block w-4 h-4 shrink-0" />,
    });
  }, [icon]);

  let register = (name: string) => ({});
  let errors: { [key: string]: { message?: string } } = {};

  if (context) {
    const ctx = useContext(context);
    if (ctx?.register) register = ctx.register;
    if (ctx?.formState?.errors) errors = ctx.formState.errors;
  }

  const error = errors?.[name];
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="text-text block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Icon container with fixed width */}
        <div className={cn(
          "absolute top-1/2 left-3 -translate-y-1/2 transform",
          icon ? "w-4 h-4" : "w-0 h-0"
        )}>
          {Icon && (
            <Suspense fallback={<div className="inline-block w-4 h-4 shrink-0 opacity-30" />}>
              <Icon className="text-muted-foreground w-4 h-4 shrink-0" />
            </Suspense>
          )}
        </div>

        <input
          id={name}
          type={inputType}
          placeholder={placeholder || `Enter your ${name}`}
          autoComplete={name}
          required={required}
          defaultValue={value}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            icon ? 'pl-10 pr-3' : 'px-3',
            isPassword && 'pr-10',
            error && 'border-destructive',
            className
          )}
          {...register(name)}
          {...props}
        />

        {/* Password toggle with fixed positioning */}
        {isPassword && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 transform w-4 h-4">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Fixed height container for error message */}
      <div>
        <p className={`text-destructive text-sm mt-1 error-p ${name}-error`}>
          {error?.message || ''}
        </p>
      </div>
    </div>
  );
};

export { Input };
