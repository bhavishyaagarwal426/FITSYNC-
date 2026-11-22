import React from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/ui/Button';

export default function CookieBanner() {
  const { cookieConsent, acceptAllCookies, rejectNonEssentialCookies } = useUIStore();

  if (cookieConsent.decided) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-cream-300 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-charcoal-700 max-w-3xl">
          <p className="font-semibold text-charcoal-900 mb-1">We respect your privacy</p>
          <p>
            FITSYNC uses essential cookies to ensure secure logins and application functionality. With your consent, we also use functional and analytics cookies to personalize styling recommendations and improve performance.{' '}
            <Link to="/cookies" className="text-burgundy-800 underline hover:text-burgundy-900">
              Cookie Policy & Preferences
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Button variant="outline" size="sm" onClick={rejectNonEssentialCookies}>
            Reject Non-Essential
          </Button>
          <Button variant="primary" size="sm" onClick={acceptAllCookies}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
