import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function PrivacyDelete() {
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'DELETE MY ACCOUNT') {
      setError('You must type DELETE MY ACCOUNT exactly as shown to proceed.');
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await api.post('/privacy/delete-account', {
        confirmation,
        reason,
      });
      setSuccess(true);
      setTimeout(async () => {
        await logout();
        navigate('/');
      }, 4000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit account deletion request.');
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/privacy')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Privacy Governance</span>
        </button>

        <div className="bg-white rounded-3xl border border-red-200 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h1 className="text-xl font-bold text-charcoal-950">
              Permanent Account Closure & Data Scrub
            </h1>
          </div>

          <p className="text-xs text-charcoal-600 leading-relaxed">
            This action initiates a permanent deletion workflow. All digital wardrobe photographs, recognized attributes, outfit suggestions, saved boards, and discussions will be irreversibly wiped from active databases and storage clusters.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
              <h3 className="text-sm font-bold text-green-900">
                Deletion Workflow Queued (Status: PENDING)
              </h3>
              <p className="text-xs text-green-700 max-w-sm mx-auto">
                Your account has been deactivated. Image storage scrubbers are executing data eradication. Redirecting to homepage...
              </p>
            </div>
          ) : (
            <form onSubmit={handleDelete} className="space-y-4 pt-2 border-t border-cream-200">
              <Input
                label='To confirm, type "DELETE MY ACCOUNT"'
                required
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Reason for closure (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us improve FITSYNC..."
                  className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="danger"
                  size="md"
                  isLoading={isDeleting}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Confirm Permanent Erasure
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
