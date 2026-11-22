import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-3xl bg-burgundy-100 text-burgundy-800 flex items-center justify-center mb-6 shadow-sm">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      <h1 className="text-5xl font-extrabold text-charcoal-950 mb-2">404</h1>
      <h2 className="text-xl font-bold text-charcoal-800 mb-3">Out of Style / Page Not Found</h2>
      <p className="text-xs md:text-sm text-charcoal-500 max-w-sm mb-8 leading-relaxed">
        The look or page you were looking for doesn't exist or has moved into another collection.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
