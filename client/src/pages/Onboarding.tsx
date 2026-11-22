import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Layers, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/onboarding/ProgressBar';
import StyleCard from '@/components/onboarding/StyleCard';
import ColorCard from '@/components/onboarding/ColorCard';

const ONBOARDING_GENDERS = [
  {
    id: 'women',
    title: "Women's Fashion",
    subtitle: 'Feminine Silhouettes & Curated Pieces',
    icon: '🌸',
    desc: 'Dresses, flowing skirts, elegant blouses, heels, designer shoulder bags, and feminine luxury aesthetics.',
    badges: ['Dresses & Skirts', 'Blouses', 'Heels & Flats', 'Fine Jewelry & Bags'],
  },
  {
    id: 'men',
    title: "Men's Fashion",
    subtitle: 'Masculine Cuts & Tailored Classics',
    icon: '👔',
    desc: 'Structured blazers, oxford button-downs, polo shirts, chinos, tailored trousers, derbies, and masculine watches.',
    badges: ['Tailored Suits', 'Oxfords & Polos', 'Chinos & Denims', 'Field & Luxury Watches'],
  },
  {
    id: 'unisex',
    title: 'All / Fluid & Unisex',
    subtitle: 'Contemporary Capsule Essentials',
    icon: '✨',
    desc: 'Versatile minimal essentials, oversized silhouettes, gender-free hoodies, clean sneakers, and fluid streetwear.',
    badges: ['Minimalist Basics', 'Clean Sneakers', 'Boxy Knits', 'Fluid Streetwear'],
  },
];

const ONBOARDING_STYLES = [
  { id: 'casual', label: 'Casual', desc: 'Relaxed, everyday comfort with clean tees, jeans, and easy sneakers.' },
  { id: 'streetwear', label: 'Streetwear', desc: 'Graphic silhouettes, oversized hoodies, statement sneakers, and utility accents.' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Neutral color palettes, unbranded tailoring, capsule silhouettes.' },
  { id: 'old_money', label: 'Old Money', desc: 'Polo collars, neutral knits, linen shirts, quiet luxury loafers.' },
  { id: 'smart_casual', label: 'Smart Casual', desc: 'Blazer pairings, oxford shirts, slim chinos, versatile work-to-dinner fits.' },
  { id: 'formal', label: 'Formal', desc: 'Classic suits, dress shirts, formal footwear, polished elegance.' },
  { id: 'sporty', label: 'Sporty & Athleisure', desc: 'Performance joggers, track jackets, clean athletic lifestyle wear.' },
  { id: 'vintage', label: 'Vintage / Retro', desc: 'Nostalgic cuts, corduroys, retro colorblocks, textured heritage.' },
  { id: 'korean', label: 'Korean Aesthetic', desc: 'Boxy cardigans, wide trousers, soft tonal draping.' },
  { id: 'traditional', label: 'Traditional / Cultural', desc: 'Occasion-specific traditional ethnic and cultural garments.' },
];

const ONBOARDING_COLORS = [
  { id: 'black', label: 'Black', hex: '#1C1917' },
  { id: 'white', label: 'White', hex: '#FFFFFF', border: true },
  { id: 'beige', label: 'Beige / Cream', hex: '#E7DFD5' },
  { id: 'navy', label: 'Navy Blue', hex: '#1E293B' },
  { id: 'grey', label: 'Charcoal Grey', hex: '#4B5563' },
  { id: 'brown', label: 'Warm Brown', hex: '#78350F' },
  { id: 'green', label: 'Olive Green', hex: '#3F6212' },
  { id: 'burgundy', label: 'Burgundy', hex: '#64172D' },
];

export default function Onboarding() {
  const { user, updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<'men' | 'women' | 'unisex'>((user?.gender as any) || 'men');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['casual', 'minimalist']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['black', 'beige']);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.gender) {
      setSelectedGender(user.gender as any);
    }
  }, [user?.gender]);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleColor = (id: string) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await api.put('/preferences', {
        preferredStyles: selectedStyles,
        favouriteColours: selectedColors,
        gender: selectedGender,
      });
      await updateProfile({ onboardingCompleted: true, gender: selectedGender } as any);
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-[#121214] flex flex-col justify-between p-4 sm:p-8 font-sans transition-colors">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-burgundy-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            F
          </div>
          <span className="font-extrabold text-charcoal-900 dark:text-cream-100 tracking-wider">FITSYNC</span>
        </div>
        <button
          onClick={handleComplete}
          className="text-xs font-semibold text-charcoal-500 hover:text-burgundy-800 dark:hover:text-burgundy-400"
        >
          Skip Setup
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl w-full mx-auto bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 sm:p-10 shadow-card flex-1 flex flex-col justify-between transition-colors">
        <div>
          <ProgressBar currentStep={step} totalSteps={3} />

          {step === 1 ? (
            <div className="mt-8 space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800 dark:text-burgundy-400">
                  Step 1 • Gender & Styling Expression
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 dark:text-cream-100 mt-1">
                  How should FITSYNC style your outfits?
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                  We customize fashion suggestions, garment silhouettes, and curated shopping selections based on your preference.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                {ONBOARDING_GENDERS.map((g) => {
                  const isSelected = selectedGender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGender(g.id as any)}
                      className={`relative p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                        isSelected
                          ? 'border-burgundy-800 bg-burgundy-50/70 dark:bg-burgundy-950/40 ring-2 ring-burgundy-800 shadow-md'
                          : 'border-cream-300 dark:border-[#2D2D38] bg-cream-50/40 dark:bg-[#202026] hover:border-burgundy-700/60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#16161A] border border-cream-300 dark:border-[#2E2E38] text-2xl flex items-center justify-center shrink-0 shadow-xs">
                          {g.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-charcoal-900 dark:text-cream-100">
                              {g.title}
                            </h3>
                            <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500">
                              • {g.subtitle}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed max-w-xl">
                            {g.desc}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {g.badges.map((b) => (
                              <span
                                key={b}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2E2E38] text-charcoal-600 dark:text-charcoal-300"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="self-end sm:self-center shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-burgundy-800 border-burgundy-800 text-white shadow-xs'
                              : 'border-charcoal-300 dark:border-charcoal-600 bg-white dark:bg-[#16161A]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : step === 2 ? (
            <div className="mt-8 space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800 dark:text-burgundy-400">
                  Step 2 • Style Aesthetics
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 dark:text-cream-100 mt-1">
                  Which fashion aesthetics inspire you?
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                  Select all that apply. FITSYNC will adapt outfit recommendations to match these styles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {ONBOARDING_STYLES.map((style) => (
                  <StyleCard
                    key={style.id}
                    id={style.id}
                    label={style.label}
                    description={style.desc}
                    isSelected={selectedStyles.includes(style.id)}
                    onToggle={() => toggleStyle(style.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800 dark:text-burgundy-400">
                  Step 3 • Color Palette
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 dark:text-cream-100 mt-1">
                  What are your favorite clothing colors?
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                  Choose tones you love wearing most often. We will prioritize these when pairing items.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ONBOARDING_COLORS.map((color) => (
                  <ColorCard
                    key={color.id}
                    id={color.id}
                    label={color.label}
                    hex={color.hex}
                    border={color.border}
                    isSelected={selectedColors.includes(color.id)}
                    onToggle={() => toggleColor(color.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-cream-200 dark:border-[#272730]">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleComplete}
              isLoading={isSaving}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Enter My Wardrobe
            </Button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-charcoal-400 dark:text-charcoal-500 py-4">
        You can fine-tune your gender styling and fashion preferences anytime in Account Settings.
      </div>
    </div>
  );
}
