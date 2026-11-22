import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileNav from './MobileNav';
import CookieBanner from '@/components/common/CookieBanner';
import { useUIStore } from '@/store/uiStore';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-[#121214] overflow-hidden text-charcoal-900 dark:text-cream-100 font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-slideIn">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 px-4 md:px-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile Fixed Bottom Nav */}
      <MobileNav />

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}
