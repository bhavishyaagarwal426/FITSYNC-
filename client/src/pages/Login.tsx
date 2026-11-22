import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('demo@fitsync.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your FITSYNC digital closet and daily stylist"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="you@example.com"
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-burgundy-800 hover:text-burgundy-900 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>

        {/* Demo Quick Fill Hint */}
        <div className="p-3 bg-cream-100 rounded-xl text-center text-xs text-charcoal-600">
          <span>Demo Credentials: </span>
          <strong className="text-burgundy-800">demo@fitsync.com</strong> / <span>password123</span>
        </div>

        <div className="text-center text-xs text-charcoal-600 pt-2 border-t border-cream-200">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-burgundy-800 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
