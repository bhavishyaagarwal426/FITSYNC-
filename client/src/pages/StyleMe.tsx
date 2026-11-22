import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dices, ArrowRight, AlertCircle } from 'lucide-react';
import { useOutfitStore } from '@/store/outfitStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import OccasionSelector from '@/components/styleme/OccasionSelector';
import StyleSelector from '@/components/styleme/StyleSelector';
import WeatherSelector from '@/components/styleme/WeatherSelector';
import ColorSelector from '@/components/styleme/ColorSelector';

export default function StyleMe() {
  const [occasion, setOccasion] = useState('casual');
  const [style, setStyle] = useState('casual');
  const [weather, setWeather] = useState('moderate');
  const [colorPreference, setColorPreference] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { generateOutfit, surpriseMe, isLoading } = useOutfitStore();
  const { totalItems } = useWardrobeStore();
  const navigate = useNavigate();

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
