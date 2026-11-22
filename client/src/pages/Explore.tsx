import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, Heart, Sparkles } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import AppLayout from '@/components/layout/AppLayout';
import { clsx } from 'clsx';

export default function Explore() {
  const { inspirations, isLoading, fetchInspirations, toggleLike, toggleSave } = useExploreStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInspirations(selectedCategory, search);
  }, [selectedCategory, search, fetchInspirations]);

  const categories = [
    { id: 'all', label: 'All Inspiration' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'casual', label: 'Casual Outing' },
    { id: 'formal', label: 'Old Money & Formal' },
    { id: 'korean', label: 'Korean Street' },
    { id: 'sporty', label: 'Sporty Chic' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Style Discovery & Inspiration
            </h1>
            <p className="text-xs text-charcoal-500">
              Curated editorial fashion lookbooks, seasonal aesthetics, and color palettes.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search aesthetics, fabrics, looks..."
              className="w-full bg-cream-50 border border-cream-300 rounded-full pl-9 pr-4 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs',
                selectedCategory === cat.id
                  ? 'bg-burgundy-800 text-white'
                  : 'bg-white border border-cream-300 text-charcoal-700 hover:bg-cream-100'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {inspirations.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/explore/${item.id}`)}
              className="break-inside-avoid bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative overflow-hidden bg-cream-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23242424"/><circle cx="200" cy="220" r="120" fill="none" stroke="%2364172D" stroke-width="4"/><text x="50%" y="45%" font-size="20" font-family="sans-serif" font-weight="bold" fill="%23FAF7F2" text-anchor="middle" letter-spacing="2">FITSYNC EDITORIAL</text><text x="50%" y="55%" font-size="12" font-family="sans-serif" fill="%23E0D5C4" text-anchor="middle">${encodeURIComponent(item.title.toUpperCase())}</text></svg>`;
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(item.id);
                    }}
                    className={clsx(
                      'p-2 rounded-full backdrop-blur-md shadow-sm transition-all',
                      item.isLiked ? 'bg-burgundy-800 text-white' : 'bg-white/80 text-charcoal-600 hover:bg-white'
                    )}
                    aria-label="Like"
                  >
                    <Heart className={clsx('w-3.5 h-3.5', item.isLiked && 'fill-current')} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item.id);
                    }}
                    className={clsx(
                      'p-2 rounded-full backdrop-blur-md shadow-sm transition-all',
                      item.isSaved ? 'bg-burgundy-800 text-white' : 'bg-white/80 text-charcoal-600 hover:bg-white'
                    )}
                    aria-label="Save"
                  >
                    <Bookmark className={clsx('w-3.5 h-3.5', item.isSaved && 'fill-current')} />
                  </button>
                </div>
              </div>

              <div className="p-3.5">
                <h4 className="text-xs font-bold text-charcoal-900 leading-snug group-hover:text-burgundy-800 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {item.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-cream-100 text-charcoal-600 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
