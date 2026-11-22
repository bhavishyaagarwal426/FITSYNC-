import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('You must review and accept the Terms and Privacy Policy to continue.');
      return;
    }
    if (!ageConfirmed) {
      setError('Please confirm that you meet the age requirement (16+) to use this service.');
      return;
    }

    try {
      await register({ email, password, displayName });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start exploring new combinations from your existing wardrobe"
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

        {/* Age & Legal Checkboxes */}
        <div className="space-y-2 pt-2">
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
          className="w-full mt-3"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account & Personalize
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
