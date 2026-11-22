import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <div className="text-xs text-charcoal-400">Effective Date: November 2026</div>
        </div>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-10 shadow-card space-y-8">
          <div className="space-y-2 border-b border-cream-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold rounded-full">
              <FileText className="w-3.5 h-3.5" />
              <span>FITSYNC User Agreement</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-950">
              Terms and Conditions
            </h1>
            <p className="text-xs text-charcoal-500">
              Terms governing the use of the FITSYNC Personal Wardrobe & Styling Platform.
            </p>
          </div>

          <div className="p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Draft Document:</strong> This document is a technical and legal framework draft for development and audit testing. Prior to commercial operation, formal review is required.
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-charcoal-700 space-y-6 text-xs md:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">1. Acceptance & Age Requirements</h2>
              <p>
                By creating an account on FITSYNC, you confirm that you are at least 16 years of age (or the legal age of digital consent in your jurisdiction) and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">2. User-Generated Content & Image Rights</h2>
              <p>
                You retain complete ownership of all clothing photographs uploaded to FITSYNC. You grant FITSYNC a limited, non-exclusive license strictly to store, process, and analyze the images for the purpose of organizing your wardrobe and generating styling recommendations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">3. AI Recommendations & Differentiator</h2>
              <p>
                FITSYNC algorithms are designed to recommend combinations primarily from items you have uploaded. While AI recommendations strive for high aesthetic coherence, styling suggestions are for personal inspiration. FITSYNC makes no guarantee of commercial fashion availability.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">4. Community Conduct & Moderation</h2>
              <p>
                Users participating in the fashion community must behave constructively. Harassment, unauthorized commercial advertising, offensive content, or impersonation will lead to immediate post removal and account suspension.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">5. Termination & Dispute Resolution</h2>
              <p>
                You may terminate your account at any time via the Privacy Dashboard. Disagreements will be governed by the laws of [PLACEHOLDER-JURISDICTION].
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
