import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Sparkles, Share2 } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function ExploreDetail() {
  const { id } = useParams<{ id: string }>();
  const { selectedInspiration, fetchInspirationById, toggleLike, toggleSave } = useExploreStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchInspirationById(id);
  }, [id, fetchInspirationById]);

  if (!selectedInspiration) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-charcoal-400">Loading inspiration board...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 rounded-2xl overflow-hidden bg-cream-100 border border-cream-200">
            <img
              src={selectedInspiration.imageUrl}
              alt={selectedInspiration.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23242424"/><circle cx="200" cy="220" r="120" fill="none" stroke="%2364172D" stroke-width="4"/><text x="50%" y="45%" font-size="20" font-family="sans-serif" font-weight="bold" fill="%23FAF7F2" text-anchor="middle" letter-spacing="2">FITSYNC EDITORIAL</text><text x="50%" y="55%" font-size="12" font-family="sans-serif" fill="%23E0D5C4" text-anchor="middle">${encodeURIComponent(selectedInspiration.title.toUpperCase())}</text></svg>`;
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />
          </div>

          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="burgundy" size="sm" className="capitalize">
                  {selectedInspiration.style}
                </Badge>
                <span className="text-xs text-charcoal-400 capitalize">
                  • Season: {selectedInspiration.season}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-charcoal-950">
                {selectedInspiration.title}
              </h1>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                {selectedInspiration.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap pt-2">
                {selectedInspiration.tags?.map((t, idx) => (
                  <span key={idx} className="text-xs bg-cream-100 text-charcoal-700 px-3 py-1 rounded-full border border-cream-200 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-cream-200">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    toggleLike(selectedInspiration.id);
                    toast.success('Added like!');
                  }}
                  leftIcon={<Heart className="w-4 h-4 text-burgundy-800" />}
                >
                  Like Look
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    toggleSave(selectedInspiration.id);
                    toast.success('Updated saved board!');
                  }}
                  leftIcon={<Bookmark className="w-4 h-4 text-burgundy-800" />}
                >
                  Save to Board
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/style-me')}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="w-full font-bold"
              >
                Recreate Similar Look With My Wardrobe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
