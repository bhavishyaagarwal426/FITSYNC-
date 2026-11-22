import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/onboarding/ProgressBar';
import StyleCard from '@/components/onboarding/StyleCard';
import ColorCard from '@/components/onboarding/ColorCard';

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
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['casual', 'minimalist']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['black', 'beige']);
  const [isSaving, setIsSaving] = useState(false);

  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();

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
      });
      await updateProfile({ onboardingCompleted: true });
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-burgundy-800 text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="font-extrabold text-charcoal-900 tracking-wider">FITSYNC</span>
        </div>
        <button
          onClick={handleComplete}
          className="text-xs font-semibold text-charcoal-500 hover:text-burgundy-800"
        >
          Skip Setup
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-card flex-1 flex flex-col justify-between">
        <div>
          <ProgressBar currentStep={step} totalSteps={2} />

          {step === 1 ? (
            <div className="mt-8 space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800">
                  Step 1 • Style Profile
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 mt-1">
                  Which fashion aesthetics inspire you?
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
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
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800">
                  Step 2 • Color Palette
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 mt-1">
                  What are your favorite clothing colors?
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
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
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-cream-200">
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

          {step < 2 ? (
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

      <div className="text-center text-xs text-charcoal-400 py-4">
        You can fine-tune your styling preferences anytime in Account Settings.
      </div>
    </div>
  );
}
