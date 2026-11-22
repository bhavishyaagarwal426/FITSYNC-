import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export const COLOR_SWATCHES = [
  { id: 'black', label: 'Black', hex: '#1C1917' },
  { id: 'white', label: 'White', hex: '#FFFFFF', border: true },
  { id: 'beige', label: 'Beige', hex: '#E7DFD5' },
  { id: 'brown', label: 'Brown', hex: '#78350F' },
  { id: 'navy', label: 'Navy', hex: '#1E293B' },
  { id: 'grey', label: 'Grey', hex: '#6B7280' },
  { id: 'green', label: 'Olive / Green', hex: '#3F6212' },
  { id: 'burgundy', label: 'Burgundy', hex: '#64172D' },
];

interface ColorSelectorProps {
  value?: string;
  onChange: (val?: string) => void;
}

export default function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
          4. Highlight / Anchor Color (Optional)
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-charcoal-400 hover:text-burgundy-800 underline"
          >
            No Preference
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
        {COLOR_SWATCHES.map((swatch) => {
          const isSelected = value === swatch.id;
          return (
            <button
              key={swatch.id}
              type="button"
              onClick={() => onChange(isSelected ? undefined : swatch.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              title={swatch.label}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs',
                  swatch.border && 'border border-cream-300',
                  isSelected
                    ? 'ring-2 ring-burgundy-800 ring-offset-2 scale-110'
                    : 'group-hover:scale-105'
                )}
                style={{ backgroundColor: swatch.hex }}
              >
                {isSelected && (
                  <Check
                    className={clsx(
                      'w-4 h-4',
                      swatch.id === 'white' || swatch.id === 'beige' ? 'text-charcoal-900' : 'text-white'
                    )}
                  />
                )}
              </div>
              <span className="text-[10px] text-charcoal-600 font-medium">{swatch.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
