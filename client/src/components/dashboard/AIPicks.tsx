import React from 'react';
import { Sparkles, ArrowRight, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Outfit } from '@/types';
import Button from '@/components/ui/Button';

interface AIPicksProps {
  outfits: Outfit[];
  onGenerateClick: () => void;
}

export default function AIPicks({ outfits, onGenerateClick }: AIPicksProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-burgundy-800" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-700">
            AI Picks for You
          </h3>
        </div>
        <button
          onClick={() => navigate('/style-me')}
          className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900 transition-colors"
        >
          Style Me New Look →
        </button>
      </div>

      {outfits.length === 0 ? (
        <div className="bg-gradient-to-r from-burgundy-900 to-burgundy-800 rounded-3xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Personalized Stylist
            </span>
            <h4 className="text-lg md:text-xl font-bold">
              Ready to discover a new look today?
            </h4>
            <p className="text-xs text-cream-200 max-w-md leading-relaxed">
              FITSYNC pairs your verified tops, bottoms, and shoes into complete, cohesive styles ready for work, weekends, or dates.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={onGenerateClick}
              leftIcon={<Sparkles className="w-4 h-4 text-burgundy-800" />}
              className="bg-white text-burgundy-900 hover:bg-cream-100 font-bold"
            >
              Generate My Outfit
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outfits.slice(0, 2).map((outfit) => (
            <div
              key={outfit.id}
              onClick={() => navigate(`/outfit/${outfit.id}`)}
              className="bg-white rounded-2xl border border-cream-300 p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-burgundy-50 text-burgundy-800 px-2 py-0.5 rounded-md">
                    {outfit.occasion} • {outfit.style}
                  </span>
                  <span className="text-[11px] text-charcoal-400">
                    {new Date(outfit.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Outfit Items Collage */}
                <div className="grid grid-cols-3 gap-2 py-1">
                  {outfit.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="aspect-square rounded-xl bg-cream-100 overflow-hidden border border-cream-200">
                      <img
                        src={item.wardrobeItem.imageUrl}
                        alt={item.wardrobeItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-charcoal-600 line-clamp-2 italic font-serif">
                  "{outfit.explanation}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-cream-200">
                <span className="text-xs font-semibold text-burgundy-800">View Look & Details →</span>
                <span className="text-[11px] text-charcoal-400">Owned Clothes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
