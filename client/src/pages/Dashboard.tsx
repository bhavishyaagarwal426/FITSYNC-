import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dices, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { useExploreStore } from '@/store/exploreStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import WardrobeOverview from '@/components/dashboard/WardrobeOverview';
import RecentlyAdded from '@/components/dashboard/RecentlyAdded';
import AIPicks from '@/components/dashboard/AIPicks';
import StyleInspiration from '@/components/dashboard/StyleInspiration';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { items, totalItems, fetchItems } = useWardrobeStore();
  const { savedOutfits, fetchSavedOutfits, surpriseMe, isLoading: isSurprising } = useOutfitStore();
  const { inspirations, fetchInspirations } = useExploreStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchSavedOutfits();
    fetchInspirations();
  }, [fetchItems, fetchSavedOutfits, fetchInspirations]);

  const handleSurpriseMe = async () => {
    try {
      const outfit = await surpriseMe();
      navigate(`/outfit/${outfit.id}`);
    } catch {
      navigate('/style-me');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Top Hero: Greeting & Primary CTAs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-card">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-950 tracking-tight">
              Good morning, {user?.displayName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-xs md:text-sm text-charcoal-500 font-medium">
              Ready to discover a new look from your closet today?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={handleSurpriseMe}
              isLoading={isSurprising}
              leftIcon={<Dices className="w-4 h-4 text-charcoal-700" />}
            >
              Surprise Me
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/style-me')}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="shadow-sm font-semibold"
            >
              Generate My Outfit
            </Button>
          </div>
        </div>

        {/* New User Welcome & Instant AI Stylist Callout */}
        {totalItems === 0 && (
          <div className="bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-white p-6 sm:p-8 rounded-3xl shadow-card border border-burgundy-700 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-cream-100 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cream-200" />
                  <span>Instant AI Outfit Suggestions Ready</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  You don't need to upload clothes to get amazing outfit ideas!
                </h2>
                <p className="text-xs sm:text-sm text-cream-200 leading-relaxed">
                  FITSYNC is designed first and foremost to give you high-fashion styling inspiration. Our AI Stylist will build complete, realistic head-to-toe combinations (1 Top + 1 Bottom + 1 Footwear + 1 Accessory + outerwear) drawing from Pinterest aesthetics and curated designer pieces.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSurpriseMe}
                  isLoading={isSurprising}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
                  leftIcon={<Dices className="w-4 h-4 text-cream-200" />}
                >
                  Quick Surprise Look
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/style-me')}
                  className="bg-white text-burgundy-950 hover:bg-cream-100 font-extrabold shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Style My Lookbook
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Wardrobe Overview */}
        <WardrobeOverview items={items} totalItems={totalItems} />

        {/* 2. Recently Added Garments */}
        <RecentlyAdded items={items} />

        {/* 3. AI Picks for You */}
        <AIPicks
          outfits={savedOutfits.map((s) => s.outfit)}
          onGenerateClick={() => navigate('/style-me')}
        />

        {/* 4. Style Inspiration (Editorial Masonry Grid) */}
        <StyleInspiration inspirations={inspirations} />
      </div>
    </AppLayout>
  );
}
