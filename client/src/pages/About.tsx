import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shirt, Shield, HeartHandshake } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function About() {
  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <span className="text-xs text-charcoal-400">About FITSYNC</span>
        </div>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-10 shadow-card space-y-8">
          <div className="space-y-2 border-b border-cream-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fashion Intelligence</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-950">
              About FITSYNC
            </h1>
            <p className="text-base font-serif italic text-burgundy-800">
              "Your wardrobe has more possibilities than you think."
            </p>
          </div>

          <div className="space-y-6 text-xs md:text-sm text-charcoal-700 leading-relaxed">
            <p>
              Most people wear less than 20% of their closet regularly, repeatedly buying new clothes because pairing existing items feels difficult or repetitive.
            </p>
            <p>
              <strong>FITSYNC was built to solve this:</strong> an AI Personal Wardrobe & Stylist that begins with what you already own. By combining visual discovery (Pinterest), an optional fashion discussion hub (Reddit), and an intelligent personal stylist, FITSYNC unlocks new outfit combinations from your real clothes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <Shirt className="w-6 h-6 text-burgundy-800 mb-2" />
                <h3 className="font-bold text-charcoal-900 mb-1">Authentic Garments</h3>
                <p className="text-xs text-charcoal-500">
                  Recommendations strictly respect owned pieces. We never insert fabricated clothes.
                </p>
              </div>

              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <Sparkles className="w-6 h-6 text-burgundy-800 mb-2" />
                <h3 className="font-bold text-charcoal-900 mb-1">Explainable AI</h3>
                <p className="text-xs text-charcoal-500">
                  Every look explains why colors harmonize and why the cut matches your occasion.
                </p>
              </div>

              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <Shield className="w-6 h-6 text-burgundy-800 mb-2" />
                <h3 className="font-bold text-charcoal-900 mb-1">Zero Exploitative Data</h3>
                <p className="text-xs text-charcoal-500">
                  No body scanning, no face tracking, and zero selling of personal styling habits.
                </p>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="p-6 bg-cream-100/70 rounded-2xl border border-cream-300 mt-8 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                Corporate & Developer Information
              </h3>
              <p className="text-xs text-charcoal-600">
                Operating Entity: <strong>FITSYNC Technologies [PLACEHOLDER-LEGAL-ENTITY]</strong><br />
                Registered Address: <strong>[PLACEHOLDER-REGISTERED-ADDRESS]</strong><br />
                Customer Support: <strong>support@[PLACEHOLDER-DOMAIN].com</strong><br />
                Grievance Officer: <strong>compliance@[PLACEHOLDER-DOMAIN].com</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
