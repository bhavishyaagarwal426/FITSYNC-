import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('men');
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (!ageConfirmed) {
      setError('Please confirm that you meet the age requirement (16+) to use this service.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await register({
        email,
        password,
        displayName,
        gender,
        ageConfirmed: true,
        onboardingCompleted: true,
      });
      toast.success('Account created! Welcome to FITSYNC AI Stylist ✨', { icon: '✨' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please check your details and try again.');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Experience personalized AI outfit recommendations tailored to you"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <Input
          label="Your Name or Nickname"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="e.g. Jordan Lee"
        />

        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="you@example.com"
        />

        <Input
          label="Password (min 8 characters)"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
        />

        {/* Fashion Profile / Gender Choice */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
            Styling Profile & Silhouettes
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'men', label: "Men's Fashion", icon: '👔', desc: 'Blazers, oxfords, chinos, boots' },
              { id: 'women', label: "Women's Fashion", icon: '🌸', desc: 'Dresses, skirts, chic heels' },
              { id: 'unisex', label: 'Unisex / Fluid', icon: '✨', desc: 'Minimalist basics, knits' },
            ].map((opt) => {
              const isSelected = gender === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-burgundy-800 bg-burgundy-50 ring-2 ring-burgundy-800 text-burgundy-900 shadow-xs'
                      : 'border-cream-300 bg-cream-50/50 text-charcoal-700 hover:border-cream-400'
                  }`}
                >
                  <span className="text-xl mb-1">{opt.icon}</span>
                  <span className="text-xs font-bold leading-tight block">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-charcoal-500">
            AI Stylist will prioritize cuts and silhouettes for this profile. You can change this anytime.
          </p>
        </div>

        {/* Age & Legal Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-cream-200">
          <label className="flex items-start gap-2.5 text-xs text-charcoal-700 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-cream-400 text-burgundy-800 focus:ring-burgundy-800"
            />
            <span>I confirm that I am at least 16 years of age.</span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-charcoal-700 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-cream-400 text-burgundy-800 focus:ring-burgundy-800"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-burgundy-800 underline">Terms</Link>
              {' '}and acknowledge the{' '}
              <Link to="/privacy-policy" target="_blank" className="text-burgundy-800 underline">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-3 font-bold"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account & Start Styling
        </Button>

        <div className="text-center text-xs text-charcoal-600 pt-2 border-t border-cream-200">
          Already have an account?{' '}
          <Link to="/login" className="text-burgundy-800 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
