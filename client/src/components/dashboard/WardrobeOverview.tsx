import React from 'react';
import { Shirt, Footprints, Layers, Sparkles, Watch, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WardrobeOverviewProps {
  items: Array<{ category: string }>;
  totalItems: number;
}

export default function WardrobeOverview({ items, totalItems }: WardrobeOverviewProps) {
  const navigate = useNavigate();

  const counts: Record<string, number> = {
    tops: 0,
    bottoms: 0,
    footwear: 0,
    outerwear: 0,
    accessories: 0,
  };

  items.forEach((item) => {
    const cat = item.category?.toLowerCase() || '';
    if (counts[cat] !== undefined) counts[cat]++;
  });

  const categories = [
    { id: 'tops', label: 'Tops', count: counts.tops, icon: Shirt },
    { id: 'bottoms', label: 'Bottoms', count: counts.bottoms, icon: Layers },
    { id: 'footwear', label: 'Footwear', count: counts.footwear, icon: Footprints },
    { id: 'outerwear', label: 'Outerwear', count: counts.outerwear, icon: Sparkles },
    { id: 'accessories', label: 'Accessories', count: counts.accessories, icon: Watch },
    { id: 'all', label: 'Total Items', count: totalItems, icon: Package, highlight: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-700">
          Wardrobe Overview
        </h3>
        <button
          onClick={() => navigate('/wardrobe')}
          className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900 transition-colors"
        >
          View Full Closet →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/wardrobe${cat.id !== 'all' ? `?category=${cat.id}` : ''}`)}
              className="bg-white p-4 rounded-2xl border border-cream-300 hover:border-cream-400 hover:shadow-card transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-cream-100 text-charcoal-700 group-hover:bg-burgundy-100 group-hover:text-burgundy-900 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-charcoal-900 group-hover:text-burgundy-800 transition-colors">
                  {cat.count}
                </span>
              </div>
              <span className="text-xs font-medium text-charcoal-500 capitalize">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
