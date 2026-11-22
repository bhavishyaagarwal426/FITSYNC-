import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Compass,
  MessageSquare,
  Bookmark,
  FolderHeart,
  History,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'Style Me', path: '/style-me', icon: Sparkles, badge: 'AI' },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Community', path: '/community', icon: MessageSquare },
    { name: 'Saved Outfits', path: '/saved-outfits', icon: Bookmark },
    { name: 'Collections', path: '/collections', icon: FolderHeart },
    { name: 'Outfit History', path: '/history', icon: History },
  ];

  const secondaryLinks = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    secondaryLinks.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 h-screen bg-cream-50 dark:bg-[#16161A] border-r border-cream-300 dark:border-[#272730] flex flex-col justify-between shrink-0 select-none transition-colors">
      {/* Top Logo & Navigation */}
      <div className="p-6 pb-2 overflow-y-auto">
        {/* FITSYNC Brand Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img
            src="/logo.png"
            alt="FITSYNC"
            className="w-10 h-10 rounded-full object-cover border border-cream-300 dark:border-[#2E2E38] shadow-xs"
          />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-charcoal-900 dark:text-cream-100 text-lg leading-tight">
              FIT<span className="text-burgundy-800 dark:text-burgundy-400">SYNC</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500 font-semibold">
              AI Wardrobe & Stylist
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-burgundy-800 text-white shadow-sm'
                      : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200/80 dark:hover:bg-[#25252D] hover:text-charcoal-950 dark:hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={clsx('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-charcoal-500 dark:text-charcoal-400 group-hover:text-burgundy-800 dark:group-hover:text-burgundy-400')} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase',
                          isActive ? 'bg-white/20 text-white' : 'bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-950/80 dark:text-burgundy-300'
                        )}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Secondary Links & Theme / User Controls */}
      <div className="p-4 space-y-1 border-t border-cream-200 dark:border-[#272730]">
        {/* Quick Theme Switcher in Sidebar */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-charcoal-600 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-[#25252D] hover:text-charcoal-900 dark:hover:text-cream-100 transition-all group"
          title="Toggle Dark / Light Theme"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-charcoal-500 group-hover:text-burgundy-800 transition-colors" />
            )}
            <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cream-200 dark:bg-[#2D2D38] text-charcoal-600 dark:text-charcoal-300">
            {theme === 'dark' ? 'Midnight' : 'Cream'}
          </span>
        </button>

        {secondaryLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-cream-300 dark:bg-[#25252D] text-burgundy-900 dark:text-burgundy-300 font-semibold'
                    : 'text-charcoal-600 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-[#25252D] hover:text-charcoal-900 dark:hover:text-cream-100'
                )
              }
            >
              <Icon className="w-4 h-4 text-charcoal-400 dark:text-charcoal-400 group-hover:text-charcoal-700 dark:group-hover:text-charcoal-200" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-charcoal-500 dark:text-charcoal-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 transition-all group"
        >
          <LogOut className="w-4 h-4 text-charcoal-400 dark:text-charcoal-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
