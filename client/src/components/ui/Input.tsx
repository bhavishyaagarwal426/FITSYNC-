import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-charcoal-400 dark:text-charcoal-500 pointer-events-none">{leftIcon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'w-full bg-white dark:bg-[#1E1E24] border rounded-lg px-3.5 py-2.5 text-sm text-charcoal-900 dark:text-cream-100 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500 transition-colors focus:outline-none focus:ring-1',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-cream-300 dark:border-[#2E2E38] focus:border-burgundy-800 dark:focus:border-burgundy-600 focus:ring-burgundy-800',
              className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-charcoal-400 dark:text-charcoal-500">{rightIcon}</div>}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
