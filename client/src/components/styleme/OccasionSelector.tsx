import React from 'react';
import { clsx } from 'clsx';
import {
  GraduationCap,
  Briefcase,
  Coffee,
  Heart,
  PartyPopper,
  Sparkles,
  Plane,
  Dumbbell,
  Compass,
} from 'lucide-react';

export const OCCASIONS = [
  { id: 'college', label: 'College / Uni', icon: GraduationCap, desc: 'Comfortable, youthful everyday' },
  { id: 'work', label: 'Office / Work', icon: Briefcase, desc: 'Professional & tailored' },
  { id: 'casual', label: 'Casual Outing', icon: Coffee, desc: 'Relaxed & easygoing' },
  { id: 'date_night', label: 'Date or Social', icon: Heart, desc: 'Elevated & charismatic' },
  { id: 'party', label: 'Party / Night Out', icon: PartyPopper, desc: 'Bold, expressive & trendy' },
  { id: 'wedding', label: 'Wedding / Festive', icon: Sparkles, desc: 'Traditional or high formal' },
  { id: 'travel', label: 'Travel & Commute', icon: Plane, desc: 'Breathable & layered' },
  { id: 'sports', label: 'Active & Sporty', icon: Dumbbell, desc: 'Athletic performance' },
];

interface OccasionSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function OccasionSelector({ value, onChange }: OccasionSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
        1. Select Occasion
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {OCCASIONS.map((occ) => {
          const Icon = occ.icon;
          const isSelected = value === occ.id;
          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => onChange(occ.id)}
              className={clsx(
                'flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 group relative',
                isSelected
                  ? 'border-burgundy-800 bg-burgundy-50/60 ring-2 ring-burgundy-800 shadow-sm'
                  : 'border-cream-300 bg-white hover:border-cream-400 hover:shadow-xs'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 transition-colors',
                  isSelected ? 'bg-burgundy-800 text-white' : 'bg-cream-100 text-charcoal-600 group-hover:text-burgundy-800'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-charcoal-900 leading-tight mb-0.5">
                {occ.label}
              </span>
              <span className="text-[10px] text-charcoal-500 line-clamp-1">
                {occ.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
