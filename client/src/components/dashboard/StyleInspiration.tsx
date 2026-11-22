import React from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StyleInspiration as StyleInspirationType } from '@/types';
import { clsx } from 'clsx';

interface StyleInspirationProps {
  inspirations: StyleInspirationType[];
  onToggleSave?: (id: string) => void;
}

export default function StyleInspiration({ inspirations, onToggleSave }: StyleInspirationProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-700">
          Style Inspiration (Editorial Masonry)
        </h3>
        <button
          onClick={() => navigate('/explore')}
          className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900 transition-colors"
        >
          Explore All Boards →
        </button>
      </div>

      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {inspirations.slice(0, 8).map((insp) => (
          <div
            key={insp.id}
            onClick={() => navigate(`/explore/${insp.id}`)}
            className="break-inside-avoid bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer group flex flex-col"
          >
            <div className="relative overflow-hidden bg-cream-200">
              <img
                src={insp.imageUrl}
                alt={insp.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23242424"/><circle cx="200" cy="220" r="120" fill="none" stroke="%2364172D" stroke-width="4"/><text x="50%" y="45%" font-size="20" font-family="sans-serif" font-weight="bold" fill="%23FAF7F2" text-anchor="middle" letter-spacing="2">FITSYNC EDITORIAL</text><text x="50%" y="55%" font-size="12" font-family="sans-serif" fill="%23E0D5C4" text-anchor="middle">${encodeURIComponent(insp.title.toUpperCase())}</text></svg>`;
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(insp.id);
                  }}
                  className={clsx(
                    'absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-sm transition-all',
                    insp.isSaved ? 'bg-burgundy-800 text-white' : 'bg-white/80 text-charcoal-600 hover:bg-white'
                  )}
                  aria-label="Save inspiration"
                >
                  <Bookmark className={clsx('w-3.5 h-3.5', insp.isSaved && 'fill-current')} />
                </button>
              )}
            </div>

            <div className="p-3">
              <h4 className="text-xs font-semibold text-charcoal-900 leading-snug group-hover:text-burgundy-800 transition-colors">
                {insp.title}
              </h4>
              <p className="text-[11px] text-charcoal-400 capitalize mt-1">
                {insp.style} • {insp.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
