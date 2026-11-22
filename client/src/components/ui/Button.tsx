import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-800 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-burgundy-800 hover:bg-burgundy-900 text-white shadow-sm hover:shadow',
    secondary: 'bg-cream-200 dark:bg-[#25252D] hover:bg-cream-300 dark:hover:bg-[#2F2F38] text-charcoal-900 dark:text-cream-100',
    outline: 'border border-cream-400 dark:border-[#353540] hover:border-burgundy-800 dark:hover:border-burgundy-400 text-charcoal-800 dark:text-cream-200 hover:text-burgundy-800 dark:hover:text-burgundy-300 bg-transparent',
    ghost: 'hover:bg-cream-200 dark:hover:bg-[#25252D] text-charcoal-700 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-cream-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
