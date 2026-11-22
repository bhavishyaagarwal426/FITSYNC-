import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shirt, Sparkles, Compass, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function MobileNav() {
  const links = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'Style Me', path: '/style-me', icon: Sparkles, isCenter: true },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;

        if (link.isCenter) {
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className="flex flex-col items-center -mt-6 group focus:outline-none"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95',
                      isActive ? 'bg-burgundy-900 ring-4 ring-cream-100' : 'bg-burgundy-800'
                    )}
                  >
                    <Icon className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] mt-1 font-semibold tracking-tight',
                      isActive ? 'text-burgundy-800' : 'text-charcoal-600'
                    )}
                  >
                    {link.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        }

        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
                isActive ? 'text-burgundy-800 font-semibold' : 'text-charcoal-500 hover:text-charcoal-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5 mb-0.5', isActive ? 'text-burgundy-800' : 'text-charcoal-400')} />
                <span>{link.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
