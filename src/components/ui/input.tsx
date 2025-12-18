'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { Suspense, useState, useMemo, InputHTMLAttributes } from 'react';

/**
 * Input Component
 * 
 * @example
 * // Standalone usage (without form library)
 * <Input 
 *   name="email" 
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   icon="Mail"
 * />
 * 
 * @example
 * // With react-hook-form
 * const { register, formState: { errors } } = useForm();
 * 
 * <Input 
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   icon="Mail"
 *   register={() => register('email')}
 *   error={errors.email}
 * />
 */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  icon?: string;
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  register?: () => Record<string, unknown>;
  error?: { message?: string };
  showToggle?: boolean; // Show password visibility toggle (default: true for password, false for others)
}

const Input: React.FC<InputProps> = ({
  icon = '',
  name,
  label = '',
  type = 'text',
  required = true,
  placeholder = '',
  className,
  value = '',
  register = () => ({}),
  error,
  showToggle,
  ...props
}) => {
  const Icon = useMemo(() => {
    if (!icon) return null;

    return dynamic(
      () =>
        import('lucide-react').then((mod) => {
          const IconComponent = (mod as Record<string, unknown>)[
            icon
          ] as LucideIcon | undefined;
          if (!IconComponent) return () => null;
          return IconComponent;
        }),
      { ssr: false, loading: () => <div className="w-4 h-4" /> }
    );
  }, [icon]);

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const shouldShowToggle = showToggle ?? isPassword;
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <Suspense fallback={<div className="w-4 h-4" />}>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </Suspense>
          </div>
        )}

        <input
          id={name}
          type={inputType}
          placeholder={placeholder || `Enter your ${name}`}
          autoComplete={name}
          required={required}
          defaultValue={value}
          className={cn(
            'flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            shouldShowToggle && 'pr-10',
            error && 'border-destructive',
            className
          )}
          {...register()}
          {...props}
        />

        {/* Password toggle */}
        {shouldShowToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 flex w-5 h-5 items-center justify-center text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export { Input };