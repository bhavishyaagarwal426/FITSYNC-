import React from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-cream-300 dark:border-[#2A2A33] overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-2',
              isActive
                ? 'border-burgundy-800 dark:border-burgundy-400 text-burgundy-800 dark:text-burgundy-400 font-semibold'
                : 'border-transparent text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-cream-100 hover:border-cream-400 dark:hover:border-[#3E3E4B]'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'text-xs px-2 py-0.5 rounded-full',
                  isActive
                    ? 'bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-900 dark:text-burgundy-300'
                    : 'bg-cream-200 dark:bg-[#25252D] text-charcoal-600 dark:text-charcoal-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
