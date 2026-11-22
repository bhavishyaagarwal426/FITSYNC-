import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface StyleCardProps {
  id: string;
  label: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
}

export default function StyleCard({ label, description, isSelected, onToggle }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between group',
        isSelected
          ? 'border-burgundy-800 bg-burgundy-50/60 ring-2 ring-burgundy-800 shadow-sm'
          : 'border-cream-300 bg-white hover:border-cream-400 hover:shadow-xs'
      )}
    >
      <div className="flex items-start justify-between w-full mb-3">
        <h4 className="text-sm font-bold text-charcoal-900 group-hover:text-burgundy-800 transition-colors">
          {label}
        </h4>
        <div
          className={clsx(
            'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
            isSelected ? 'bg-burgundy-800 text-white' : 'border border-cream-400 bg-white'
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>
      </div>
      <p className="text-xs text-charcoal-500 leading-relaxed">{description}</p>
    </button>
  );
}
