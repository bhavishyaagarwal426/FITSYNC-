import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#1A1A1E] rounded-xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-all duration-200 text-charcoal-900 dark:text-cream-100',
        hover && 'hover:shadow-card-hover hover:border-cream-400 dark:hover:border-[#3E3E4B]',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
