import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Check } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Cookies() {
  const { cookieConsent, setCookieConsent, acceptAllCookies, rejectNonEssentialCookies } = useUIStore();

  const handleToggle = (key: 'functional' | 'analytics' | 'marketing') => {
    setCookieConsent({ [key]: !cookieConsent[key] });
    toast.success('Preferences updated');
  };

  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <div className="text-xs text-charcoal-400">Policy Version: 1.0</div>
        </div>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-10 shadow-card space-y-8">
          <div className="space-y-2 border-b border-cream-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold rounded-full">
              <Cookie className="w-3.5 h-3.5" />
              <span>Cookie Policy & Preference Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-950">
              Cookie Management
            </h1>
            <p className="text-xs text-charcoal-500">
              Control the local cookies and storage mechanisms used by FITSYNC.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-cream-50 rounded-2xl border border-cream-200">
            <Button variant="primary" size="sm" onClick={acceptAllCookies}>
              Accept All Cookies
            </Button>
            <Button variant="outline" size="sm" onClick={rejectNonEssentialCookies}>
              Reject Non-Essential
            </Button>
          </div>

          {/* Cookie Categories */}
          <div className="divide-y divide-cream-200 space-y-4">
            {/* Essential */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-charcoal-900">1. Strictly Necessary Cookies</h3>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Required for user authentication sessions, CSRF protection, and core UI layout integrity. These cannot be disabled.
                </p>
              </div>
              <div className="w-10 h-5 bg-burgundy-800 rounded-full flex items-center justify-end px-1 opacity-60 cursor-not-allowed">
                <div className="w-3.5 h-3.5 bg-white rounded-full" />
              </div>
            </div>

            {/* Functional */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <h3 className="text-xs font-bold text-charcoal-900">2. Functional & Preference Cookies</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Remembers your sidebar expansion states, saved outfit filters, and visual theme choices across visits.
                </p>
              </div>
              <button
                onClick={() => handleToggle('functional')}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  cookieConsent.functional ? 'bg-burgundy-800' : 'bg-cream-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    cookieConsent.functional ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Analytics */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <h3 className="text-xs font-bold text-charcoal-900">3. Analytics & Performance Cookies</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Provides aggregated, pseudonymized diagnostics regarding page speed, image upload success rates, and API errors.
                </p>
              </div>
              <button
                onClick={() => handleToggle('analytics')}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  cookieConsent.analytics ? 'bg-burgundy-800' : 'bg-cream-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    cookieConsent.analytics ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <h3 className="text-xs font-bold text-charcoal-900">4. Marketing & Lookbook Outreach</h3>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Used only if you opt-in to tailored promotional fashion lookbooks and seasonal newsletter announcements.
                </p>
              </div>
              <button
                onClick={() => handleToggle('marketing')}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  cookieConsent.marketing ? 'bg-burgundy-800' : 'bg-cream-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    cookieConsent.marketing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
