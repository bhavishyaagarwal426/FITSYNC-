import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Download, Trash2, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';

export default function Privacy() {
  const [consents, setConsents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/privacy/consents').then((res: any) => setConsents(res?.data || []));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
            Privacy & Personal Data Governance
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Full transparency and user agency over digital wardrobe data and AI processing
          </p>
        </div>

        {/* Core Principles Card */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-burgundy-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
              Our Data Minimization & Privacy Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-600 leading-relaxed">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-bold text-charcoal-900 mb-1">No Biometric or Face Profiling</h4>
              <p>
                FITSYNC only processes photographs of isolated clothing items. We do not require, collect, or analyze full-body photos, faces, or body measurements.
              </p>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-bold text-charcoal-900 mb-1">Zero Third-Party Advertising Trackers</h4>
              <p>
                Your wardrobe is private. We never sell your style habits or wardrobe catalogs to external ad networks or data brokers.
              </p>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-bold text-charcoal-900 mb-1">Portability & Export Rights</h4>
              <p>
                You can download an unencrypted, machine-readable JSON copy of your entire wardrobe and outfit archive at any moment.
              </p>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-bold text-charcoal-900 mb-1">Complete Deletion Workflow</h4>
              <p>
                When you delete your account, images and metadata are permanently scrubbed from our database and storage buckets.
              </p>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <Download className="w-6 h-6 text-burgundy-800 mb-2" />
              <h3 className="text-sm font-bold text-charcoal-900">Download My Data</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Export an archive containing your full digital closet and outfit history.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/privacy/download')}
            >
              Export Archive →
            </Button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <Key className="w-6 h-6 text-burgundy-800 mb-2" />
              <h3 className="text-sm font-bold text-charcoal-900">Consent Management</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Toggle specific permissions for vision AI, analytics, and marketing.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/privacy/consent')}
            >
              Manage Consents →
            </Button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <Trash2 className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="text-sm font-bold text-charcoal-900">Account Deletion</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Initiate full cryptographic account erasure and photograph purge.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate('/privacy/delete')}
            >
              Request Purge →
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
