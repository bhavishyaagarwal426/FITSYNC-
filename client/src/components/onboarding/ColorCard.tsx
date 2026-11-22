import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface ColorCardProps {
  id: string;
  label: string;
  hex: string;
  border?: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

export default function ColorCard({ label, hex, border, isSelected, onToggle }: ColorCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'p-3 rounded-2xl border flex items-center gap-3 transition-all duration-200 text-left',
        isSelected
          ? 'border-burgundy-800 bg-burgundy-50/60 ring-2 ring-burgundy-800 shadow-sm'
          : 'border-cream-300 bg-white hover:border-cream-400'
      )}
    >
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs',
          border && 'border border-cream-300'
        )}
        style={{ backgroundColor: hex }}
      >
        {isSelected && (
          <Check
            className={clsx(
              'w-3.5 h-3.5',
              hex === '#FFFFFF' || hex === '#F5F0E8' ? 'text-charcoal-900' : 'text-white'
            )}
          />
        )}
      </div>
      <span className="text-xs font-semibold text-charcoal-900 truncate">{label}</span>
    </button>
  );
}
