import React from 'react';
import { Link, Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <img
            src="/logo.png"
            alt="FITSYNC"
            className="w-12 h-12 rounded-full object-cover shadow-sm border border-cream-300"
          />
          <span className="font-extrabold tracking-wider text-charcoal-900 text-2xl">
            FIT<span className="text-burgundy-800">SYNC</span>
          </span>
        </Link>
        {title && <h2 className="text-2xl font-bold tracking-tight text-charcoal-950 mt-2">{title}</h2>}
        {subtitle && <p className="mt-1 text-sm text-charcoal-500">{subtitle}</p>}
      </div>

      {/* Card container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card sm:rounded-2xl sm:px-10 border border-cream-300">
          {children || <Outlet />}
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-charcoal-400 space-x-4">
          <Link to="/privacy-policy" className="hover:text-charcoal-700 underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-charcoal-700 underline">Terms of Service</Link>
          <span>•</span>
          <Link to="/about" className="hover:text-charcoal-700 underline">About FITSYNC</Link>
        </div>
      </div>
    </div>
  );
}
