import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Dices, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Thermometer, Layers } from 'lucide-react';
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
  const [season, setSeason] = useState(searchParams.get('season') || 'autumn');
  const [outerwearOption, setOuterwearOption] = useState<'auto' | 'yes' | 'no'>('auto');
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
    if (searchParams.get('season')) setSeason(searchParams.get('season')!);
  }, [searchParams]);

  const handleGenerate = async () => {
    setError(null);
    try {
      const outfit = await generateOutfit({
        occasion,
        style,
        weather,
        season,
        outerwearOption,
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

  const isOuterwearPredicted =
    season === 'winter' ||
    season === 'autumn' ||
    weather === 'cold' ||
    weather === 'rainy';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
        {/* Top Header */}
        <div className="bg-white dark:bg-[#1A1A1E] p-6 md:p-8 rounded-3xl border border-cream-300 dark:border-[#2A2A33] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-50 dark:bg-burgundy-950/80 border border-burgundy-200 dark:border-burgundy-800 text-burgundy-800 dark:text-burgundy-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal AI Stylist</span>
            </div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 dark:text-cream-100 tracking-tight">
              Style Me a New Look
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
              Complete head-to-toe ensemble with guaranteed 1 Top + 1 Bottom + 1 Footwear + 1 Accessory, plus climate-smart outerwear.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSurprise}
            isLoading={isLoading}
            leftIcon={<Dices className="w-4 h-4 text-charcoal-700 dark:text-charcoal-300" />}
          >
            Quick Surprise Me
          </Button>
        </div>

        {/* Pinterest Lookbook Banner if routed from Pinterest pin or connected */}
        {fromPinterest && (
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-900/50 animate-slideDown shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                P
              </span>
              <div>
                <span className="text-xs font-bold block">Recreating Pinterest Lookbook</span>
                <span className="text-[11px] text-red-700 dark:text-red-300">
                  Target aesthetic: <span className="font-semibold capitalize">{style}</span> • Occasion:{' '}
                  <span className="font-semibold capitalize">{occasion}</span>
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-red-800 dark:text-red-300 bg-white dark:bg-[#1E1E24] px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/50">
              Matching Owned Clothes
            </span>
          </div>
        )}

        {connection?.connected && !fromPinterest && (
          <div className="flex items-center gap-2 p-3 bg-cream-50 dark:bg-[#1E1E24] rounded-2xl border border-cream-300 dark:border-[#2D2D38] text-xs text-charcoal-700 dark:text-cream-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>
              Pinterest Synced: <strong>@{connection.username}</strong>'s aesthetic moodboards are actively guiding color & silhouette scoring.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-2xl border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Styling Form Controls */}
        <div className="bg-white dark:bg-[#1A1A1E] p-6 md:p-8 rounded-3xl border border-cream-300 dark:border-[#2A2A33] shadow-card space-y-8 transition-colors">
          {/* 1. Occasion */}
          <OccasionSelector value={occasion} onChange={setOccasion} />

          {/* 2. Style Aesthetic */}
          <StyleSelector value={style} onChange={setStyle} />

          {/* 3. Season & Climate Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300">
              3. Target Season
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'summer', label: '☀️ Summer', desc: 'Warm & Sunny (Light fabrics, no jackets)' },
                { id: 'spring', label: '🌸 Spring', desc: 'Mild & Breezy (Cardigans / Light)' },
                { id: 'autumn', label: '🍂 Autumn / Fall', desc: 'Cool & Layered (Jackets & Knits)' },
                { id: 'winter', label: '❄️ Winter', desc: 'Cold (Heavy Outerwear & Coats)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeason(s.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    season === s.id
                      ? 'border-burgundy-800 bg-burgundy-50/70 dark:bg-burgundy-950/40 ring-2 ring-burgundy-800 text-burgundy-950 dark:text-cream-100 shadow-xs'
                      : 'border-cream-300 dark:border-[#2D2D38] bg-white dark:bg-[#1E1E24] text-charcoal-700 dark:text-charcoal-300 hover:border-cream-400'
                  }`}
                >
                  <span className="block text-xs font-bold">{s.label}</span>
                  <span className="block text-[10px] text-charcoal-400 dark:text-charcoal-500 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Weather Condition */}
          <WeatherSelector value={weather} onChange={setWeather} />

          {/* 5. Outerwear & Layering Preference (Jacket / Coat / Blazer) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300">
                5. Outerwear & Layering (Optional)
              </label>
              <span className="text-[11px] font-semibold text-burgundy-800 dark:text-burgundy-400">
                {outerwearOption === 'auto'
                  ? isOuterwearPredicted
                    ? 'AI Prediction: Outerwear Included 🧥'
                    : 'AI Prediction: Outerwear Skipped ☀️'
                  : outerwearOption === 'yes'
                  ? 'Always include outerwear 🧥'
                  : 'No outerwear 👕'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'auto',
                  title: '🤖 Auto-Predict (Recommended)',
                  desc: 'AI predicts from season & climate: added in Cold/Winter, skipped in Warm/Summer',
                },
                {
                  id: 'yes',
                  title: '🧥 Include Outerwear',
                  desc: 'Always layer with a jacket, coat, blazer, or cardigan from your closet',
                },
                {
                  id: 'no',
                  title: '🚫 No Outerwear',
                  desc: 'Single layer only: 1 Top + 1 Bottom + 1 Footwear + 1 Accessory',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOuterwearOption(opt.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    outerwearOption === opt.id
                      ? 'border-burgundy-800 bg-burgundy-50/70 dark:bg-burgundy-950/40 ring-2 ring-burgundy-800 text-burgundy-950 dark:text-cream-100 shadow-xs'
                      : 'border-cream-300 dark:border-[#2D2D38] bg-white dark:bg-[#1E1E24] text-charcoal-700 dark:text-charcoal-300 hover:border-cream-400'
                  }`}
                >
                  <span className="block text-xs font-bold mb-1">{opt.title}</span>
                  <span className="block text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Color Preference */}
          <ColorSelector value={colorPreference} onChange={setColorPreference} />

          {/* Guaranteed Category Composition Callout */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cream-50 dark:bg-[#16161A] border border-cream-300 dark:border-[#2D2D38] text-xs text-charcoal-700 dark:text-cream-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Guaranteed Complete Look:</strong> Every generated ensemble selects{' '}
              <strong>1 Top</strong> + <strong>1 Bottom</strong> + <strong>1 Footwear</strong> +{' '}
              <strong>1 Accessory</strong>
              {outerwearOption === 'no' || (outerwearOption === 'auto' && !isOuterwearPredicted)
                ? ' (Outerwear excluded for warm/mild weather).'
                : ' + 1 Outerwear Layer.'}
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-cream-200 dark:border-[#272730] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
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
