import React from 'react';
import { Sun, CloudSun, CloudRain, Snowflake, Wind } from 'lucide-react';
import { clsx } from 'clsx';

export const WEATHERS = [
  { id: 'warm', label: 'Warm / Hot', icon: Sun, desc: 'Light, breathable' },
  { id: 'moderate', label: 'Mild / Spring', icon: CloudSun, desc: 'Single layers & cardigans' },
  { id: 'cold', label: 'Cold / Winter', icon: Snowflake, desc: 'Heavier outerwear & knits' },
  { id: 'rainy', label: 'Rainy / Damp', icon: CloudRain, desc: 'Water-resistant, boots' },
];

interface WeatherSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function WeatherSelector({ value, onChange }: WeatherSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
        3. Weather & Climate
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WEATHERS.map((w) => {
          const Icon = w.icon;
          const isSelected = value === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onChange(w.id)}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-burgundy-800 bg-burgundy-50/60 ring-2 ring-burgundy-800 shadow-sm'
                  : 'border-cream-300 bg-white hover:border-cream-400'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                  isSelected ? 'bg-burgundy-800 text-white' : 'bg-cream-100 text-charcoal-600'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-charcoal-900 truncate">
                  {w.label}
                </span>
                <span className="block text-[10px] text-charcoal-400 truncate">
                  {w.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
