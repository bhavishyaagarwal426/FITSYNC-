import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Bell, Shield, Cookie, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateProfile, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/preferences').then((res: any) => {
      setPreferredStyles(res.preferredStyles || []);
    });
  }, []);

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

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
            Account & Application Settings
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Manage your personal styling profile, notifications, and privacy preferences
          </p>
        </div>

        {/* 1. Account Details */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <User className="w-4 h-4 text-burgundy-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-cream-100 border border-cream-300 rounded-lg px-3.5 py-2.5 text-xs text-charcoal-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-charcoal-400 mt-1">
                Your email is used exclusively for account verification and password recovery.
              </p>
            </div>

            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </form>
        </section>

        {/* 2. Pinterest & Moodboard Integration */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center">
                P
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
                Pinterest Moodboard & Feed Integration
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-burgundy-800 hover:text-burgundy-900"
            >
              Explore Pinterest Lookbooks →
            </Link>
          </div>

          <p className="text-xs text-charcoal-600 leading-relaxed max-w-2xl">
            Link your Pinterest account to automatically sync your fashion pins, train your AI Stylist with your favorite aesthetic moodboards, and recreate Pinterest outfits using your owned clothes.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/explore')}
              className="border-red-200 text-red-800 hover:bg-red-50 text-xs font-bold"
            >
              Manage Pinterest Sync in Explore
            </Button>
          </div>
        </section>

        {/* 2. Privacy & Data Rights */}
        <section className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Shield className="w-4 h-4 text-burgundy-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
              Privacy, Consent & Data Rights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/privacy"
              className="p-4 rounded-2xl bg-cream-50 border border-cream-300 hover:border-burgundy-800 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-burgundy-800 mb-1">
                  Privacy Dashboard
                </h4>
                <p className="text-[11px] text-charcoal-500 leading-relaxed">
                  Review personal records, active consent items, and data processing statuses.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 pt-3">Open Dashboard →</span>
            </Link>

            <Link
              to="/privacy/download"
              className="p-4 rounded-2xl bg-cream-50 border border-cream-300 hover:border-burgundy-800 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-burgundy-800 mb-1">
                  Download My Data
                </h4>
                <p className="text-[11px] text-charcoal-500 leading-relaxed">
                  Export complete digital wardrobe metadata and outfits in portable JSON format.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 pt-3">Export JSON →</span>
            </Link>

            <Link
              to="/cookies"
              className="p-4 rounded-2xl bg-cream-50 border border-cream-300 hover:border-burgundy-800 transition-all flex flex-col justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-charcoal-900 group-hover:text-burgundy-800 mb-1">
                  Cookie Preferences
                </h4>
                <p className="text-[11px] text-charcoal-500 leading-relaxed">
                  Granular control over essential, analytics, and personalization cookies.
                </p>
              </div>
              <span className="text-xs font-bold text-burgundy-800 pt-3">Manage Cookies →</span>
            </Link>
          </div>
        </section>

        {/* 3. Danger Zone */}
        <section className="bg-red-50/50 rounded-3xl border border-red-200 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-900">
              Danger Zone • Account Closure
            </h2>
          </div>

          <p className="text-xs text-charcoal-600 max-w-xl leading-relaxed">
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
