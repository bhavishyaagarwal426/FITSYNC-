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
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
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
    <aside className="w-64 h-screen bg-cream-50 border-r border-cream-300 flex flex-col justify-between shrink-0 select-none">
      {/* Top Logo & Navigation */}
      <div className="p-6 pb-2">
        {/* FITSYNC Brand Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img
            src="/logo.png"
            alt="FITSYNC"
            className="w-10 h-10 rounded-full object-cover border border-cream-300 shadow-xs"
          />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-charcoal-900 text-lg leading-tight">
              FIT<span className="text-burgundy-800">SYNC</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold">
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
                      : 'text-charcoal-700 hover:bg-cream-200/80 hover:text-charcoal-950'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={clsx('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-charcoal-500 group-hover:text-burgundy-800')} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase',
                          isActive ? 'bg-white/20 text-white' : 'bg-burgundy-100 text-burgundy-800'
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

      {/* Secondary Links & User Settings */}
      <div className="p-4 space-y-1 border-t border-cream-200">
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
                    ? 'bg-cream-300 text-burgundy-900 font-semibold'
                    : 'text-charcoal-600 hover:bg-cream-200 hover:text-charcoal-900'
                )
              }
            >
              <Icon className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-700" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-red-50 hover:text-red-700 transition-all group"
        >
          <LogOut className="w-4 h-4 text-charcoal-400 group-hover:text-red-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
