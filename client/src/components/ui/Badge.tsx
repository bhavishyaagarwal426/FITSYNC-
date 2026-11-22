import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'burgundy' | 'cream' | 'charcoal' | 'green' | 'amber' | 'blue';
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'cream',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const variants = {
    burgundy: 'bg-burgundy-50 text-burgundy-800 border-burgundy-200',
    cream: 'bg-cream-200 text-charcoal-800 border-cream-300',
    charcoal: 'bg-charcoal-100 text-charcoal-900 border-charcoal-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
