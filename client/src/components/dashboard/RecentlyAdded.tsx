import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WardrobeItem } from '@/types';

interface RecentlyAddedProps {
  items: WardrobeItem[];
}

export default function RecentlyAdded({ items }: RecentlyAddedProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-700">
          Recently Added Clothes
        </h3>
        <button
          onClick={() => navigate('/wardrobe')}
          className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900 transition-colors"
        >
          View All ({items.length})
        </button>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar">
        {/* Quick Add Button */}
        <button
          onClick={() => navigate('/wardrobe/upload')}
          className="w-32 h-44 rounded-2xl border-2 border-dashed border-cream-400 bg-white/60 hover:bg-white hover:border-burgundy-800 flex flex-col items-center justify-center p-3 shrink-0 text-center transition-all group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-full bg-cream-200 text-burgundy-800 group-hover:bg-burgundy-800 group-hover:text-white flex items-center justify-center mb-2 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-charcoal-900 leading-tight">
            Upload Item
          </span>
          <span className="text-[10px] text-charcoal-500 mt-0.5">
            AI Auto-Tag
          </span>
        </button>

        {/* Recent Items Thumbnails */}
        {items.slice(0, 10).map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/wardrobe/${item.id}`)}
            className="w-32 h-44 rounded-2xl bg-white border border-cream-300 overflow-hidden shrink-0 flex flex-col shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="h-28 w-full bg-cream-100 overflow-hidden relative">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <p className="text-xs font-semibold text-charcoal-900 truncate group-hover:text-burgundy-800 transition-colors">
                {item.name}
              </p>
              <p className="text-[10px] text-charcoal-400 capitalize truncate">
                {item.category} • {item.color}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
