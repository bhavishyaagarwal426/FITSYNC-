import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Dices, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOutfitStore } from '@/store/outfitStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { usePinterestStore } from '@/store/pinterestStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import OccasionSelector from '@/components/styleme/OccasionSelector';
import StyleSelector from '@/components/styleme/StyleSelector';
import WeatherSelector from '@/components/styleme/WeatherSelector';
import ColorSelector from '@/components/styleme/ColorSelector';

export default function StyleMe() {
  const [searchParams] = useSearchParams();
  const [occasion, setOccasion] = useState(searchParams.get('occasion') || 'casual');
  const [style, setStyle] = useState(searchParams.get('style') || 'casual');
  const [weather, setWeather] = useState('moderate');
  const [colorPreference, setColorPreference] = useState<string | undefined>(searchParams.get('color') || undefined);
  const [error, setError] = useState<string | null>(null);

  const fromPinterest = searchParams.get('fromPinterest') === 'true';

  const { generateOutfit, surpriseMe, isLoading } = useOutfitStore();
  const { totalItems } = useWardrobeStore();
  const { connection, fetchStatus } = usePinterestStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (searchParams.get('style')) setStyle(searchParams.get('style')!);
    if (searchParams.get('occasion')) setOccasion(searchParams.get('occasion')!);
    if (searchParams.get('color')) setColorPreference(searchParams.get('color')!);
  }, [searchParams]);

  const handleGenerate = async () => {
    setError(null);
    try {
      const outfit = await generateOutfit({
        occasion,
        style,
        weather,
        colorPreference,
      });
      navigate(`/outfit/${outfit.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          'Could not assemble an outfit with current wardrobe items. Try different filters or upload more pieces.'
      );
    }
  };

  const handleSurprise = async () => {
    setError(null);
    try {
      const outfit = await surpriseMe();
      navigate(`/outfit/${outfit.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to surprise you. Please try manual generation.');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal AI Stylist</span>
            </div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Style Me a New Look
            </h1>
            <p className="text-xs text-charcoal-500">
              Select your parameters below to generate a tailored look using exclusively your wardrobe.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSurprise}
            isLoading={isLoading}
            leftIcon={<Dices className="w-4 h-4 text-charcoal-700" />}
          >
            Quick Surprise Me
          </Button>
        </div>

        {/* Pinterest Lookbook Banner if routed from Pinterest pin or connected */}
        {fromPinterest && (
          <div className="flex items-center justify-between p-4 bg-red-50 text-red-900 rounded-2xl border border-red-200 animate-slideDown shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                P
              </span>
              <div>
                <span className="text-xs font-bold block">Recreating Pinterest Lookbook</span>
                <span className="text-[11px] text-red-700">
                  Target aesthetic: <span className="font-semibold capitalize">{style}</span> • Occasion: <span className="font-semibold capitalize">{occasion}</span>
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-red-800 bg-white px-2.5 py-1 rounded-full border border-red-200">
              Matching Owned Clothes
            </span>
          </div>
        )}

        {connection?.connected && !fromPinterest && (
          <div className="flex items-center gap-2 p-3 bg-cream-50 rounded-2xl border border-cream-300 text-xs text-charcoal-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>
              Pinterest Synced: <strong>@{connection.username}</strong>'s aesthetic moodboards are actively guiding color & silhouette scoring.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Styling Form Controls */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-card space-y-8">
          {/* 1. Occasion */}
          <OccasionSelector value={occasion} onChange={setOccasion} />

          {/* 2. Style Aesthetic */}
          <StyleSelector value={style} onChange={setStyle} />

          {/* 3. Weather */}
          <WeatherSelector value={weather} onChange={setWeather} />

          {/* 4. Color Preference */}
          <ColorSelector value={colorPreference} onChange={setColorPreference} />

          {/* Primary Action Button */}
          <div className="pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-charcoal-500">
              Combinations respect color harmony, formality rules, and garment availability.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-8 shadow-sm font-bold"
            >
              Generate My Outfit
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
