import React from 'react';
import { clsx } from 'clsx';

export const STYLES = [
  { id: 'casual', label: 'Casual', desc: 'Timeless everyday ease' },
  { id: 'streetwear', label: 'Streetwear', desc: 'Urban, graphic, relaxed fits' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean silhouettes, neutrals' },
  { id: 'old_money', label: 'Old Money', desc: 'Quiet luxury, tailored heritage' },
  { id: 'smart_casual', label: 'Smart Casual', desc: 'Refined blazer or polo balances' },
  { id: 'formal', label: 'Formal', desc: 'Polished suits & elegant classics' },
  { id: 'vintage', label: 'Vintage / Retro', desc: '70s-90s inspired nostalgic tones' },
  { id: 'korean', label: 'Korean Aesthetic', desc: 'Layered textures, soft drapes' },
];

interface StyleSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
        2. Preferred Style Direction
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STYLES.map((style) => {
          const isSelected = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={clsx(
                'flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-burgundy-800 bg-burgundy-50/60 ring-2 ring-burgundy-800 shadow-sm'
                  : 'border-cream-300 bg-white hover:border-cream-400 hover:shadow-xs'
              )}
            >
              <span className="text-xs font-semibold text-charcoal-900 mb-0.5">
                {style.label}
              </span>
              <span className="text-[10px] text-charcoal-500 line-clamp-1">
                {style.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
