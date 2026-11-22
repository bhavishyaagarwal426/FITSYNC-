import React, { useState } from 'react';
import {
  Heart,
  ThumbsDown,
  RefreshCw,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  BookmarkPlus,
  Tag,
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import type { Outfit } from '@/types';
import { useBucketListStore } from '@/store/bucketListStore';
import { useUIStore, formatPriceInCurrency, CURRENCIES } from '@/store/uiStore';
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
  const icon =
    category === 'tops'
      ? '👔'
      : category === 'bottoms'
      ? '👖'
      : category === 'footwear'
      ? '👟'
      : category === 'outerwear'
      ? '🧥'
      : '⌚';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23F4EFE6"/><circle cx="200" cy="180" r="90" fill="%23EADFCB"/><text x="50%" y="46%" font-size="68" text-anchor="middle" dominant-baseline="middle">${icon}</text><text x="50%" y="74%" font-size="14" font-family="system-ui,-apple-system,sans-serif" font-weight="700" fill="%2364172D" text-anchor="middle" letter-spacing="1">${encodeURIComponent((name || category).slice(0, 24).toUpperCase())}</text></svg>`;
};

const getSlotLabel = (slot: string) => {
  switch (slot?.toLowerCase()) {
    case 'tops':
      return '👔 Top';
    case 'bottoms':
      return '👖 Bottom';
    case 'footwear':
      return '👟 Footwear';
    case 'accessories':
      return '⌚ Accessory';
    case 'outerwear':
      return '🧥 Outerwear (Layer)';
    default:
      return slot ? slot.toUpperCase() : 'PIECE';
  }
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

  const { currency } = useUIStore();
  const { addItem: addBucketItem } = useBucketListStore();
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());

  // Check if outfit has complete selection (Top, Bottom, Footwear, Accessories, optional Outerwear)
  const slotsPresent = new Set(outfit.items.map((i) => i.slot?.toLowerCase()));
  const hasFullEssentials =
    slotsPresent.has('tops') && slotsPresent.has('bottoms') && slotsPresent.has('footwear') && slotsPresent.has('accessories');

  const curatedItems = outfit.items.filter((i) => i.wardrobeItem.isCuratedSuggestion);
  const ownedItems = outfit.items.filter((i) => !i.wardrobeItem.isCuratedSuggestion);
  const hasCuratedItems = curatedItems.length > 0;

  const handleSaveToBucketList = async (wardrobeItem: any) => {
    try {
      const numericPrice = typeof wardrobeItem.price === 'number' ? wardrobeItem.price : parseFloat(wardrobeItem.price || '0');
      const activeCurrencyConfig = CURRENCIES[currency] || CURRENCIES.USD;
      const convertedPrice = Math.round(numericPrice * activeCurrencyConfig.rate);

      await addBucketItem({
        title: wardrobeItem.name,
        category: wardrobeItem.category,
        brand: wardrobeItem.brand || 'Curated Boutique',
        targetPrice: convertedPrice,
        currency: activeCurrencyConfig.symbol,
        imageUrl: wardrobeItem.imageUrl,
        productUrl: wardrobeItem.productUrl || `https://www.google.com/search?q=${encodeURIComponent(`${wardrobeItem.brand || ''} ${wardrobeItem.name}`)}`,
        priority: 'high',
        notes: `Curated shopping piece recommended by FITSYNC AI Stylist for ${outfit.occasion} Look.`,
        status: 'dreaming',
      });
      setSavedItemIds((prev) => new Set(prev).add(wardrobeItem.id));
      toast.success(`Saved "${wardrobeItem.name}" to your Style Bucket List!`, { icon: '✨' });
    } catch {
      toast.error('Could not save item to bucket list');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Occasion & Style Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#1A1A1E] p-4 md:p-6 rounded-2xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-900 dark:text-burgundy-300 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-burgundy-800 dark:text-burgundy-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-charcoal-900 dark:text-cream-100 capitalize">
                {outfit.occasion.replace('_', ' ')} Look
              </h3>
              <Badge variant="burgundy" size="sm" className="capitalize">
                {outfit.style}
              </Badge>
              {hasCuratedItems ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300 border border-burgundy-300 dark:border-burgundy-700/50">
                  <ShoppingBag className="w-3 h-3 text-burgundy-800 dark:text-burgundy-400" />
                  Shoppable Hybrid Bundle
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  100% Wardrobe Owned
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
              {hasCuratedItems
                ? `Hybrid Bundle: ${ownedItems.length} owned garment${ownedItems.length !== 1 ? 's' : ''} + ${curatedItems.length} curated shoppable pick${curatedItems.length !== 1 ? 's' : ''} for the best complete look.`
                : `Assembled exclusively from your owned garments (1 Top, 1 Bottom, 1 Footwear, 1 Accessory${slotsPresent.has('outerwear') ? ' + 1 Outerwear Layer' : ''})`}
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
        <div className="lg:col-span-7 bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 shadow-card flex flex-col justify-between transition-colors">
          <div className={`grid gap-4 ${outfit.items.length >= 5 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {outfit.items.map((item) => {
              const isCurated = Boolean(item.wardrobeItem.isCuratedSuggestion);
              const isSaved = savedItemIds.has(item.wardrobeItem.id);

              return (
                <div
                  key={item.id}
                  className={clsx(
                    'group relative rounded-2xl border overflow-hidden flex flex-col shadow-xs transition-all',
                    isCurated
                      ? 'bg-burgundy-50/40 dark:bg-burgundy-950/20 border-burgundy-300 dark:border-burgundy-800/60 ring-1 ring-burgundy-400/30'
                      : 'bg-cream-50 dark:bg-[#121214] border-cream-300 dark:border-[#2D2D38]'
                  )}
                >
                  <div className="aspect-square w-full bg-cream-100 dark:bg-[#141418] overflow-hidden relative">
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

                    {/* Slot Category Pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xs text-charcoal-900 dark:text-cream-100 px-2 py-0.5 rounded-md shadow-xs border border-cream-200 dark:border-[#2E2E38]">
                        {getSlotLabel(item.slot)}
                      </span>
                    </div>

                    {/* Shopping Indicator vs Wardrobe Indicator */}
                    <div className="absolute top-2.5 right-2.5">
                      {isCurated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-burgundy-900/90 text-white px-2 py-0.5 rounded-md shadow-xs border border-burgundy-700/60 backdrop-blur-xs animate-pulse">
                          <ShoppingBag className="w-3 h-3 text-cream-200" />
                          <span>Curated Pick</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-900/90 text-emerald-100 px-2 py-0.5 rounded-md shadow-xs border border-emerald-700/60 backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          <span>In Wardrobe</span>
                        </span>
                      )}
                    </div>

                    {/* Price Tag if shoppable */}
                    {isCurated && item.wardrobeItem.price ? (
                      <div className="absolute bottom-2.5 left-2.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/10">
                        {formatPriceInCurrency(item.wardrobeItem.price, currency)} {item.wardrobeItem.brand ? `• ${item.wardrobeItem.brand}` : ''}
                      </div>
                    ) : null}
                  </div>

                  {/* Card Details Footer */}
                  <div className="p-3 bg-white dark:bg-[#1E1E24] border-t border-cream-200 dark:border-[#272730] flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-charcoal-900 dark:text-cream-100 truncate">
                          {item.wardrobeItem.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 capitalize truncate mt-0.5">
                        {item.wardrobeItem.brand ? `${item.wardrobeItem.brand} • ` : ''}
                        {item.wardrobeItem.color} • {item.wardrobeItem.material || item.wardrobeItem.subcategory || item.wardrobeItem.category}
                      </p>
                    </div>

                    {/* Interactive E-commerce Shopping Actions for Curated Suggestion */}
                    {isCurated && (
                      <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-cream-100 dark:border-[#272730]">
                        <a
                          href={
                            item.wardrobeItem.productUrl ||
                            `https://www.google.com/search?q=${encodeURIComponent(
                              `${item.wardrobeItem.brand || ''} ${item.wardrobeItem.name}`
                            )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 text-[10px] font-bold bg-burgundy-50 dark:bg-burgundy-950/60 hover:bg-burgundy-100 dark:hover:bg-burgundy-900/80 text-burgundy-900 dark:text-burgundy-300 rounded-lg transition-colors border border-burgundy-200 dark:border-burgundy-800"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Shop</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleSaveToBucketList(item.wardrobeItem)}
                          className={clsx(
                            'inline-flex items-center justify-center gap-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-colors border',
                            isSaved
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-cream-100 dark:bg-[#25252E] hover:bg-cream-200 dark:hover:bg-[#2F2F3B] text-charcoal-800 dark:text-cream-200 border-cream-300 dark:border-[#383845]'
                          )}
                          title="Save this dream item to your Bucket List"
                        >
                          <BookmarkPlus className="w-2.5 h-2.5 text-burgundy-800 dark:text-burgundy-400" />
                          <span>{isSaved ? 'Saved!' : 'Wishlist'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Navigation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-cream-200 dark:border-[#272730]">
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
              variant="outline"
              size="md"
              onClick={onTryAnother}
              isLoading={isLoadingAnother}
              leftIcon={<RefreshCw className={clsx('w-4 h-4', isLoadingAnother && 'animate-spin')} />}
            >
              Try Another Combo
            </Button>
          </div>
        </div>

        {/* Right: AI Stylist Analysis Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-cream-50/70 dark:bg-[#1E1E24]/70 border-burgundy-200 dark:border-burgundy-900/40 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-burgundy-800 dark:text-burgundy-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 dark:text-burgundy-300">
                Stylist Analysis & Technique
              </h4>
            </div>

            <p className="text-xs text-charcoal-700 dark:text-cream-200 leading-relaxed italic bg-white/70 dark:bg-[#16161A]/70 p-4 rounded-xl border border-cream-300 dark:border-[#2D2D38] shadow-xs">
              "{outfit.explanation}"
            </p>

            <div className="mt-5 space-y-3 pt-4 border-t border-cream-300 dark:border-[#2D2D38]">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300">
                Why this complete look works:
              </h5>
              <ul className="space-y-2 text-xs text-charcoal-600 dark:text-charcoal-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy-800 dark:bg-burgundy-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Head-to-Toe Harmony:</strong> Integrates Top, Bottom, Footwear, and Accessories into a single cohesive aesthetic.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy-800 dark:bg-burgundy-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Seasonal Layering:</strong>{' '}
                    {slotsPresent.has('outerwear')
                      ? 'Outerwear layer incorporated based on climate prediction / user preference.'
                      : 'Lightweight single-layer structure tailored for moderate/warm climate without bulky jackets.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy-800 dark:bg-burgundy-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Accessory Finish:</strong> Elevated with curated watch / accessories for authentic editorial detailing.
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
