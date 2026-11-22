import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Cookie, Trash2, Check, AlertTriangle, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore, ThemeMode } from '@/store/uiStore';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>((user?.gender as any) || 'unisex');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/preferences').then((res: any) => {
      setPreferredStyles(res.preferredStyles || []);
      if (res.gender) setGender(res.gender);
    }).catch(() => {});
  }, []);

  const handleGenderChange = async (newGender: 'men' | 'women' | 'unisex') => {
    setGender(newGender);
    try {
      await api.put('/preferences', { gender: newGender });
      await updateProfile({ gender: newGender } as any);
      toast.success(
        `Styling profile updated to ${
          newGender === 'women'
            ? "Women's Fashion 🌸"
            : newGender === 'men'
            ? "Men's Fashion 👔"
            : 'Unisex / Fluid ✨'
        }`
      );
    } catch {
      toast.error('Failed to update styling preference.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ displayName });
      toast.success('Profile details saved!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    toast.success(
      newTheme === 'dark'
        ? 'Midnight Luxury Dark Mode activated'
        : newTheme === 'light'
        ? 'Warm Cream Light Mode activated'
        : 'System theme sync activated'
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-950 dark:text-cream-100 tracking-tight">
            Account & Application Settings
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-0.5">
            Manage your personal styling profile, appearance theme, Pinterest feed, and privacy preferences
          </p>
        </div>

        {/* 1. Appearance & Theme Settings */}
        <section className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 md:p-8 shadow-card space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-cream-200 dark:border-[#272730] pb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-burgundy-800 dark:text-burgundy-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 dark:text-cream-100">
                Appearance & Theme
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500">
              Active: <span className="text-burgundy-800 dark:text-burgundy-400 font-bold capitalize">{theme}</span>
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-charcoal-600 dark:text-charcoal-300">
              Customize your aesthetic visual experience. Choose between FITSYNC's signature editorial Warm Cream or our Midnight Charcoal & Burgundy palette.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  theme === 'light'
                    ? 'border-burgundy-800 bg-cream-50/90 shadow-md ring-2 ring-burgundy-800/20'
                    : 'border-cream-300 dark:border-[#2D2D38] bg-cream-50/50 dark:bg-[#202026] hover:border-burgundy-700/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    {theme === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-burgundy-800 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 mb-1">
                    Warm Cream (Light)
                  </h4>
                  <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                    Editorial fashion atmosphere with warm alabaster, subtle cream tones and rich burgundy accents.
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-cream-200 dark:border-[#2D2D38] flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#FAF7F2] border border-charcoal-200 shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-[#64172D] shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-[#242424] shadow-xs" />
                  <span className="text-[10px] text-charcoal-400 ml-auto font-medium">Original</span>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  theme === 'dark'
                    ? 'border-burgundy-600 bg-[#16161A] shadow-md ring-2 ring-burgundy-600/30'
                    : 'border-cream-300 dark:border-[#2D2D38] bg-cream-50/50 dark:bg-[#202026] hover:border-burgundy-600/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center justify-center shadow-xs">
                      <Moon className="w-4 h-4" />
                    </div>
                    {theme === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-burgundy-700 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 mb-1">
                    Midnight Charcoal (Dark)
                  </h4>
                  <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                    Ultra-luxurious obsidian slate backgrounds, glowing burgundy accents, and soothing night contrast.
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-cream-200 dark:border-[#2D2D38] flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#121214] border border-[#3E3E4B] shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-[#8B2643] shadow-xs" />
                  <div className="w-4 h-4 rounded-full bg-[#F5EFEB] shadow-xs" />
                  <span className="text-[10px] text-charcoal-400 ml-auto font-medium">Night styling</span>
                </div>
              </button>

              {/* System Preference Card */}
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  theme === 'system'
                    ? 'border-burgundy-800 dark:border-burgundy-600 bg-cream-50 dark:bg-[#16161A] shadow-md ring-2 ring-burgundy-700/20'
                    : 'border-cream-300 dark:border-[#2D2D38] bg-cream-50/50 dark:bg-[#202026] hover:border-burgundy-700/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200 flex items-center justify-center shadow-xs">
                      <Laptop className="w-4 h-4" />
                    </div>
                    {theme === 'system' && (
                      <span className="w-5 h-5 rounded-full bg-burgundy-800 dark:bg-burgundy-700 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 mb-1">
                    System Preference
                  </h4>
                  <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                    Automatically align with your operating system settings for seamless daytime and evening transitions.
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-cream-200 dark:border-[#2D2D38] flex items-center justify-between">
                  <span className="text-[10px] text-charcoal-500 dark:text-charcoal-400">Auto-detect</span>
                  <span className="text-[10px] text-burgundy-800 dark:text-burgundy-400 font-semibold">Adaptive</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Gender & Styling Expression */}
        <section className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 md:p-8 shadow-card space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-cream-200 dark:border-[#272730] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 dark:text-cream-100">
                Gender & Styling Expression
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500">
              Active:{' '}
              <span className="text-burgundy-800 dark:text-burgundy-400 font-bold capitalize">
                {gender === 'women'
                  ? "Women's Fashion 🌸"
                  : gender === 'men'
                  ? "Men's Fashion 👔"
                  : 'Unisex & Fluid ✨'}
              </span>
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-charcoal-600 dark:text-charcoal-300">
              Control the silhouette, garment types, and curated designer shopping recommendations proposed by your AI Stylist.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {[
                {
                  id: 'women',
                  title: "Women's Fashion",
                  icon: '🌸',
                  desc: 'Dresses, flowing skirts, silk blouses, heels, designer shoulder bags, and feminine luxury styling.',
                },
                {
                  id: 'men',
                  title: "Men's Fashion",
                  icon: '👔',
                  desc: 'Tailored blazers, oxford button-downs, polo shirts, chinos, boots, derbies, and masculine watches.',
                },
                {
                  id: 'unisex',
                  title: 'All / Fluid & Unisex',
                  icon: '✨',
                  desc: 'Versatile minimalist essentials, genderless silhouettes, clean sneakers, and contemporary basics.',
                },
              ].map((g) => {
                const isSelected = gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGenderChange(g.id as any)}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-burgundy-800 bg-cream-50/90 dark:bg-[#1E1E24] shadow-md ring-2 ring-burgundy-800/20'
                        : 'border-cream-300 dark:border-[#2D2D38] bg-cream-50/40 dark:bg-[#202026] hover:border-burgundy-700/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#16161A] border border-cream-300 dark:border-[#2E2E38] text-base flex items-center justify-center shadow-xs">
                          {g.icon}
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-burgundy-800 dark:bg-burgundy-700 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 mb-1">
                        {g.title}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                        {g.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-cream-200 dark:border-[#2D2D38] flex items-center justify-between">
                      <span className="text-[10px] text-charcoal-400">Styling Rules</span>
                      <span className="text-[10px] text-burgundy-800 dark:text-burgundy-400 font-semibold">
                        {isSelected ? 'Active Profile' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Account Details */}
        <section className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 md:p-8 shadow-card space-y-6 transition-colors">
          <div className="flex items-center gap-2 border-b border-cream-200 dark:border-[#272730] pb-3">
            <User className="w-4 h-4 text-burgundy-800 dark:text-burgundy-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 dark:text-cream-100">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-cream-100 dark:bg-[#202026] border border-cream-300 dark:border-[#2E2E38] rounded-lg px-3.5 py-2.5 text-xs text-charcoal-500 dark:text-charcoal-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-charcoal-400 dark:text-charcoal-500 mt-1">
                Your email is used exclusively for account verification and password recovery.
              </p>
            </div>

            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </form>
        </section>

        {/* 3. Pinterest & Moodboard Integration */}
        <section className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 md:p-8 shadow-card space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-cream-200 dark:border-[#272730] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                P
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 dark:text-cream-100">
                Pinterest Moodboard & Feed Integration
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-burgundy-800 dark:text-burgundy-400 hover:underline"
            >
              Explore Pinterest Lookbooks →
            </Link>
          </div>

          <p className="text-xs text-charcoal-600 dark:text-charcoal-300 leading-relaxed max-w-2xl">
            Link your Pinterest account to automatically sync your fashion pins, train your AI Stylist with your favorite aesthetic moodboards, and recreate Pinterest outfits using your owned clothes.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/explore')}
              className="border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold"
            >
              Manage Pinterest Sync in Explore
            </Button>
          </div>
        </section>

        {/* 4. Privacy & Data Rights */}
        <section className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-6 md:p-8 shadow-card space-y-6 transition-colors">
          <div className="flex items-center gap-2 border-b border-cream-200 dark:border-[#272730] pb-3">
            <Shield className="w-4 h-4 text-burgundy-800 dark:text-burgundy-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 dark:text-cream-100">
              Privacy, Consent & Data Rights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/privacy"
              className="p-4 rounded-2xl bg-cream-50 dark:bg-[#202026] border border-cream-300 dark:border-[#2D2D38] hover:border-burgundy-800 dark:hover:border-burgundy-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 group-hover:text-burgundy-800 dark:group-hover:text-burgundy-400 mb-1">
                  Privacy Dashboard
                </h4>
                <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                  Review personal records, active consent items, and data processing statuses.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 dark:text-burgundy-400 pt-3">Open Dashboard →</span>
            </Link>

            <Link
              to="/privacy/download"
              className="p-4 rounded-2xl bg-cream-50 dark:bg-[#202026] border border-cream-300 dark:border-[#2D2D38] hover:border-burgundy-800 dark:hover:border-burgundy-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 group-hover:text-burgundy-800 dark:group-hover:text-burgundy-400 mb-1">
                  Download My Data
                </h4>
                <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                  Export complete digital wardrobe metadata and outfits in portable JSON format.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 dark:text-burgundy-400 pt-3">Export JSON →</span>
            </Link>

            <Link
              to="/cookies"
              className="p-4 rounded-2xl bg-cream-50 dark:bg-[#202026] border border-cream-300 dark:border-[#2D2D38] hover:border-burgundy-800 dark:hover:border-burgundy-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 dark:text-cream-100 group-hover:text-burgundy-800 dark:group-hover:text-burgundy-400 mb-1">
                  Cookie Preferences
                </h4>
                <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                  Granular control over essential, analytics, and personalization cookies.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 dark:text-burgundy-400 pt-3">Manage Cookies →</span>
            </Link>
          </div>
        </section>

        {/* 5. Danger Zone */}
        <section className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/40 p-6 md:p-8 space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-900 dark:text-red-300">
              Danger Zone • Account Closure
            </h2>
          </div>

          <p className="text-xs text-charcoal-600 dark:text-charcoal-300 max-w-xl leading-relaxed">
            Deleting your account triggers our verified data erasure workflow. All uploaded clothing photographs, generated outfits, and community posts will be permanently purged in accordance with data retention policies.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/privacy/delete')}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Initiate Account Deletion
          </Button>
        </section>
      </div>
    </AppLayout>
  );
}
