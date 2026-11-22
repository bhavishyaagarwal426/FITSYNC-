import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function PrivacyConsent() {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    terms: true,
    privacy: true,
    wardrobe_ai_processing: true,
    community_visibility: true,
    analytics: false,
    marketing: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/privacy/consents').then((res: any) => {
      const records = res?.data || [];
      const updated = { ...consents };
      records.forEach((r: any) => {
        updated[r.consentType] = r.status === 'granted';
      });
      setConsents(updated);
    });
  }, []);

  const handleToggle = async (type: string) => {
    const nextStatus = !consents[type];
    setConsents({ ...consents, [type]: nextStatus });
    try {
      await api.post('/privacy/consents', {
        consentType: type,
        status: nextStatus ? 'granted' : 'withdrawn',
      });
      toast.success(`Updated ${type} permission`);
    } catch {
      toast.error('Failed to update consent status.');
    }
  };

  const consentItems = [
    {
      id: 'terms',
      title: 'Terms of Service Acceptance',
      desc: 'Required for core application access and account maintenance.',
      locked: true,
    },
    {
      id: 'wardrobe_ai_processing',
      title: 'Vision AI Image Analysis & Styling Compatibility',
      desc: 'Allows our vision model to recognize clothing attributes and generate outfit suggestions.',
      locked: false,
    },
    {
      id: 'community_visibility',
      title: 'Fashion Community Participation',
      desc: 'Allows publishing public discussions or comments in the style forum.',
      locked: false,
    },
    {
      id: 'analytics',
      title: 'Anonymous Performance & Reliability Diagnostics',
      desc: 'Helps us identify app latency and upload error rates without tracking individual users.',
      locked: false,
    },
    {
      id: 'marketing',
      title: 'Occasional Editorial Lookbooks & Style Trend Digests',
      desc: 'Receive occasional fashion editorial newsletters with seasonal recommendations.',
      locked: false,
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/privacy')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Privacy Governance</span>
        </button>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Granular Consent Management
            </h1>
            <p className="text-xs text-charcoal-500">
              In accordance with data protection frameworks, you have sovereign control over how your data is processed.
            </p>
          </div>

          <div className="divide-y divide-cream-200">
            {consentItems.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-lg">
                  <h4 className="text-xs font-bold text-charcoal-900">{item.title}</h4>
                  <p className="text-[11px] text-charcoal-500 leading-relaxed">{item.desc}</p>
                </div>

                <button
                  disabled={item.locked}
                  onClick={() => handleToggle(item.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    consents[item.id] ? 'bg-burgundy-800' : 'bg-cream-300'
                  } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                      consents[item.id] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
