import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shirt, Compass, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-100 text-charcoal-900 font-sans selection:bg-burgundy-100 selection:text-burgundy-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-md border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="FITSYNC"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-cream-300"
            />
            <span className="font-extrabold tracking-wider text-charcoal-900 text-xl">
              FIT<span className="text-burgundy-800">SYNC</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The AI Stylist That Uses Clothes You Actually Own</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-charcoal-950 mb-6 leading-tight">
          Your wardrobe has <br className="hidden sm:block" />
          <span className="text-burgundy-800 italic font-serif">more possibilities</span> than you think.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          FITSYNC digitizes the garments hanging in your closet and pairs them into stunning, effortless outfits tailored to your day, the weather, and your personal taste.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md"
          >
            Create Your Free Digital Closet
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto"
          >
            Explore Demo Account
          </Button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-cream-200 text-burgundy-800 flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">1. Snap & Digitize</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Upload photos of your clothes. Vision AI identifies category, color, material, pattern, and formality automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-burgundy-100 text-burgundy-800 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">2. AI Stylist Reasoning</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Pick occasion, style, and weather. FITSYNC assembles cohesive looks with reasoning on why each combination works.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-cream-200 text-burgundy-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 mb-2">3. Zero Fabricated Items</h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Unlike generic fashion generators, FITSYNC never silently invents clothes you don’t have. It celebrates your real closet.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-300 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-burgundy-800 flex items-center justify-center text-white font-bold text-xs">
              F
            </div>
            <span className="font-bold text-sm text-charcoal-900">FITSYNC</span>
            <span className="text-xs text-charcoal-400">© 2026 AI Wardrobe & Stylist</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal-600">
            <Link to="/about" className="hover:text-burgundy-800">About FITSYNC</Link>
            <Link to="/privacy-policy" className="hover:text-burgundy-800">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-burgundy-800">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-burgundy-800">Cookie Preferences</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
