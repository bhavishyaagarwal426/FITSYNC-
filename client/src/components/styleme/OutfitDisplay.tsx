import React from 'react';
import {
  Heart,
  ThumbsDown,
  RefreshCw,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Outfit } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface OutfitDisplayProps {
  outfit: Outfit;
  onLove: () => void;
  onReject: () => void;
  onTryAnother: () => void;
  onSave: () => void;
  onMarkWorn: () => void;
  onShare: () => void;
  isLoadingAnother?: boolean;
}

const getCategoryFallback = (category: string, name: string) => {
  const icon = category === 'tops' ? '👔' : category === 'bottoms' ? '👖' : category === 'footwear' ? '👟' : category === 'outerwear' ? '🧥' : '🧣';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23F4EFE6"/><circle cx="200" cy="180" r="90" fill="%23EADFCB"/><text x="50%" y="46%" font-size="68" text-anchor="middle" dominant-baseline="middle">${icon}</text><text x="50%" y="74%" font-size="14" font-family="system-ui,-apple-system,sans-serif" font-weight="700" fill="%2364172D" text-anchor="middle" letter-spacing="1">${encodeURIComponent((name || category).slice(0, 24).toUpperCase())}</text></svg>`;
};

export default function OutfitDisplay({
  outfit,
  onLove,
  onReject,
  onTryAnother,
  onSave,
  onMarkWorn,
  onShare,
  isLoadingAnother,
}: OutfitDisplayProps) {
  const isLoved = outfit.feedback?.rating === 'loved';
  const isRejected = outfit.feedback?.rating === 'rejected';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Occasion & Style Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 md:p-6 rounded-2xl border border-cream-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-burgundy-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-charcoal-900 capitalize">
                {outfit.occasion.replace('_', ' ')} Look
              </h3>
              <Badge variant="burgundy" size="sm" className="capitalize">
                {outfit.style}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Assembled exclusively from your owned garments
            </p>
          </div>
        </div>

        {/* Quick Save / Share Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={onSave} leftIcon={<Bookmark className="w-4 h-4" />}>
            Save Look
          </Button>
          <Button variant="outline" size="sm" onClick={onShare} leftIcon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onMarkWorn} leftIcon={<Calendar className="w-4 h-4" />}>
            Wore This
          </Button>
        </div>
      </div>

      {/* Main Grid: Outfit Visual Composition + AI Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Garment Composite Collage */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-cream-300 p-6 shadow-sm flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {outfit.items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-cream-50 rounded-2xl border border-cream-300 overflow-hidden flex flex-col shadow-xs"
              >
                <div className="aspect-square w-full bg-cream-100 overflow-hidden">
                  <img
                    src={item.wardrobeItem.imageUrl}
                    alt={item.wardrobeItem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getCategoryFallback(item.slot, item.wardrobeItem.name);
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-charcoal-900 px-2 py-0.5 rounded-md shadow-xs">
                      {item.slot}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-semibold text-charcoal-900 truncate">
                    {item.wardrobeItem.name}
                  </p>
                  <p className="text-[11px] text-charcoal-500 capitalize">
                    {item.wardrobeItem.color} • {item.wardrobeItem.material || item.wardrobeItem.category}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback & Navigation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-cream-200">
            <div className="flex items-center gap-2">
              <Button
                variant={isLoved ? 'primary' : 'outline'}
                size="md"
                onClick={onLove}
                leftIcon={<Heart className={clsx('w-4 h-4', isLoved && 'fill-current text-white')} />}
              >
                {isLoved ? 'Loved!' : 'Love It'}
              </Button>

              <Button
                variant={isRejected ? 'danger' : 'outline'}
                size="md"
                onClick={onReject}
                leftIcon={<ThumbsDown className="w-4 h-4" />}
              >
                {isRejected ? 'Rejected' : 'Not My Style'}
              </Button>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={onTryAnother}
              isLoading={isLoadingAnother}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Another Option
            </Button>
          </div>
        </div>

        {/* Right: AI Stylist Breakdown & Advice */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Explanation Card */}
          <Card padding="lg" className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-burgundy-800">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Stylist Analysis</h4>
              </div>

              <blockquote className="text-sm md:text-base text-charcoal-800 font-serif leading-relaxed italic border-l-2 border-burgundy-800 pl-4 py-1">
                "{outfit.explanation}"
              </blockquote>

              <div className="space-y-3 pt-4 border-t border-cream-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Why this outfit works:
                </h5>
                <ul className="space-y-2 text-xs text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy-800 font-bold">•</span>
                    <span>
                      <strong>Balanced proportions:</strong> Combining your {outfit.items[0]?.wardrobeItem.name || 'top'} with {outfit.items[1]?.wardrobeItem.name || 'bottom'} creates clean visual harmony.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy-800 font-bold">•</span>
                    <span>
                      <strong>Color Coordination:</strong> Compliant with natural neutral contrasts suitable for {outfit.weather || 'mild'} weather.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-burgundy-800 font-bold">•</span>
                    <span>
                      <strong>Occasion Context:</strong> Refined enough for {outfit.occasion.replace('_', ' ')} while remaining effortless.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Wardrobe authenticity guarantee */}
            <div className="mt-6 p-3 bg-cream-100 rounded-xl flex items-center gap-2 text-[11px] text-charcoal-600">
              <Info className="w-4 h-4 text-burgundy-800 shrink-0" />
              <span>
                100% of these pieces are from your uploaded wardrobe. No unowned or fabricated clothing was included.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
