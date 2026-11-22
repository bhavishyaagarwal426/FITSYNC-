import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-cream-300 rounded-2xl bg-white/50">
      {icon && <div className="p-4 bg-cream-100 text-burgundy-800 rounded-2xl mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-charcoal-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-charcoal-500 max-w-sm mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
