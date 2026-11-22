import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PrivacyPolicy() {
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
              <Shield className="w-3.5 h-3.5" />
              <span>FITSYNC Legal Notice</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-950">
              Privacy Policy & Data Processing Notice
            </h1>
            <p className="text-xs text-charcoal-500">
              Draft document prepared for the FITSYNC AI Personal Wardrobe & Styling Platform.
            </p>
          </div>

          <div className="p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Legal Notice:</strong> This privacy policy is a development draft reflecting actual system architecture and the Indian Digital Personal Data Protection (DPDP) Act, 2023 framework. Formal public launch requires qualified legal counsel review.
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-charcoal-700 space-y-6 text-xs md:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">1. Information We Collect</h2>
              <p>
                In accordance with data minimization principles, FITSYNC collects strictly the data required to render personalized styling recommendations:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Credentials:</strong> Display name, email address, cryptographically hashed passwords.</li>
                <li><strong>Wardrobe Photographs:</strong> Isolated photographs of clothing items uploaded by you.</li>
                <li><strong>Clothing Metadata:</strong> Category, color, style aesthetic, texture, formality, and seasonal suitability extracted via vision AI or modified by you.</li>
                <li><strong>User Preferences:</strong> Style directions and anchor color choices recorded during onboarding or in settings.</li>
              </ul>
              <p className="text-charcoal-500 italic">
                We strictly do NOT collect face photographs, full-body portraits, body measurements, or financial payment details without separate explicit consent.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">2. AI Vision & Stylist Processing</h2>
              <p>
                Uploaded clothing images are submitted to our vision-capable AI provider solely to extract category, color, and textile characteristics. Images are never used to train generalized external foundation models. Outfits are generated using deterministic compatibility algorithms that enforce real wardrobe constraints.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">3. Storage & Security Controls</h2>
              <p>
                All data is isolated per tenant. Private image uploads are stored in restricted object storage accessible exclusively through authenticated session signatures. We maintain encryption in transit and database hashing (Argon2id/bcrypt).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">4. User Rights: Portability & Erasure</h2>
              <p>
                Under our Privacy Governance interface, users may at any time:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Export their complete digital wardrobe archive in portable JSON format.</li>
                <li>Edit or correct any AI-extracted clothing attributes.</li>
                <li>Delete individual garments or initiate complete account erasure.</li>
                <li>Manage granular cookie and analytics consent toggles.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-charcoal-950">5. Grievance Redressal & Contact</h2>
              <p>
                For questions regarding data processing or rights exercise, contact our Data Protection Officer at: <br />
                <span className="font-mono text-burgundy-800">privacy@[PLACEHOLDER-DOMAIN].com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
