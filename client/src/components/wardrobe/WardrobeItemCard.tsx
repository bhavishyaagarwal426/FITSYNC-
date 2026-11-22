import React from 'react';
import { Heart, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { WardrobeItem } from '@/types';
import Badge from '@/components/ui/Badge';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onClick?: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onToggleAvailability?: (e: React.MouseEvent) => void;
}

const getCategoryFallback = (category: string, name: string) => {
  const icon = category === 'tops' ? '👔' : category === 'bottoms' ? '👖' : category === 'footwear' ? '👟' : category === 'outerwear' ? '🧥' : '🧣';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23F4EFE6"/><circle cx="200" cy="180" r="90" fill="%23EADFCB"/><text x="50%" y="46%" font-size="68" text-anchor="middle" dominant-baseline="middle">${icon}</text><text x="50%" y="74%" font-size="14" font-family="system-ui,-apple-system,sans-serif" font-weight="700" fill="%2364172D" text-anchor="middle" letter-spacing="1">${encodeURIComponent((name || category).slice(0, 24).toUpperCase())}</text></svg>`;
};

export default function WardrobeItemCard({
  item,
  onClick,
  onToggleFavorite,
  onToggleAvailability,
}: WardrobeItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col',
        !item.isAvailable && 'opacity-60 grayscale-[30%]'
      )}
    >
      {/* Item Image Container */}
      <div className="relative aspect-square w-full bg-cream-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = getCategoryFallback(item.category, item.name);
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={clsx(
              'absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm',
              item.isFavorite
                ? 'bg-burgundy-800 text-white'
                : 'bg-white/80 text-charcoal-400 hover:text-burgundy-800 hover:bg-white'
            )}
            aria-label="Toggle favorite"
          >
            <Heart className={clsx('w-4 h-4', item.isFavorite && 'fill-current')} />
          </button>
        )}

        {/* Category Pill Tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <Badge variant="cream" size="sm" className="bg-white/90 backdrop-blur-md capitalize font-semibold shadow-xs">
            {item.category}
          </Badge>
        </div>

        {/* Unavailable overlay badge */}
        {!item.isAvailable && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-charcoal-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
              In Laundry / Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h4 className="text-xs md:text-sm font-semibold text-charcoal-900 truncate group-hover:text-burgundy-800 transition-colors">
            {item.name}
          </h4>
          <p className="text-[11px] text-charcoal-500 capitalize mt-0.5 truncate">
            {item.color} • {item.style || 'Casual'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-cream-200 text-[11px] text-charcoal-400">
          <span className="capitalize">{item.formality || 'Everyday'}</span>
          {onToggleAvailability && (
            <button
              onClick={onToggleAvailability}
              className="text-charcoal-400 hover:text-charcoal-700 text-xs flex items-center gap-1"
              title="Toggle availability"
            >
              {item.isAvailable ? (
                <span className="text-green-600 flex items-center gap-0.5">● Ready</span>
              ) : (
                <span className="text-amber-600 flex items-center gap-0.5">○ Paused</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
