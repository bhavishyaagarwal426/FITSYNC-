import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, X, Sparkles, User, Settings, LogOut, ShieldAlert, Sun, Moon, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore, CURRENCIES, GlobalCurrency } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen, theme, toggleTheme, currency, setCurrency } = useUIStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/wardrobe?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-cream-50/80 dark:bg-[#16161A]/90 backdrop-blur-md border-b border-cream-300 dark:border-[#272730] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-200 dark:hover:bg-[#25252D] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clothes, colors, outfits or styles..."
            className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-full pl-10 pr-4 py-2 text-xs md:text-sm text-charcoal-900 dark:text-cream-100 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500 focus:outline-none focus:border-burgundy-800 dark:focus:border-burgundy-600 focus:ring-1 focus:ring-burgundy-800 transition-all shadow-sm"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Style Me CTA Shortcut */}
        <button
          onClick={() => navigate('/style-me')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-800 hover:bg-burgundy-900 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Me</span>
        </button>

        {/* Global Currency & Region Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-cream-300 dark:border-[#2D2D38] hover:border-burgundy-800 bg-white/60 dark:bg-[#1E1E24]/60 text-xs font-semibold text-charcoal-800 dark:text-cream-100 transition-colors shadow-2xs"
            title="Select Global Currency & Region"
          >
            <Globe className="w-3.5 h-3.5 text-burgundy-800 dark:text-burgundy-400" />
            <span className="hidden sm:inline">{CURRENCIES[currency].flag}</span>
            <span>{CURRENCIES[currency].code}</span>
          </button>

          {currencyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E24] rounded-2xl shadow-xl border border-cream-300 dark:border-[#2D2D38] py-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-cream-200 dark:border-[#272730] text-[10px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500">
                Global Currency
              </div>
              {(Object.keys(CURRENCIES) as GlobalCurrency[]).map((c) => {
                const item = CURRENCIES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${
                      currency === c
                        ? 'bg-burgundy-50 dark:bg-burgundy-950/40 text-burgundy-800 dark:text-burgundy-300 font-bold'
                        : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-100 dark:hover:bg-[#25252D]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.flag}</span>
                      <span>{item.label}</span>
                    </span>
                    {currency === c && <span className="text-burgundy-800 dark:text-burgundy-400 font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-950 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-[#25252D] rounded-full transition-colors relative"
          aria-label={theme === 'dark' ? 'Switch to light cream mode' : 'Switch to luxury dark mode'}
          title={theme === 'dark' ? 'Switch to light cream mode' : 'Switch to luxury dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-charcoal-700 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-[#25252D] rounded-full transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-burgundy-800 rounded-full absolute top-1.5 right-1.5 ring-2 ring-cream-50 dark:ring-[#16161A]" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 hover:bg-cream-200 dark:hover:bg-[#25252D] rounded-full transition-colors"
          >
            <Avatar src={user?.avatarUrl} name={user?.displayName || 'User'} size="sm" />
            <span className="text-xs font-semibold text-charcoal-900 dark:text-cream-100 hidden md:block max-w-[120px] truncate">
              {user?.displayName || 'My Account'}
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E1E24] rounded-xl shadow-modal border border-cream-300 dark:border-[#2D2D38] py-1.5 z-50 animate-fadeIn"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-cream-200 dark:border-[#272730]">
                <p className="text-xs font-semibold text-charcoal-900 dark:text-cream-100 truncate">{user?.displayName}</p>
                <p className="text-[11px] text-charcoal-400 dark:text-charcoal-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-100 dark:hover:bg-[#272732] hover:text-charcoal-950 dark:hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-charcoal-400 dark:text-charcoal-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 dark:text-charcoal-300 hover:bg-cream-100 dark:hover:bg-[#272732] hover:text-charcoal-950 dark:hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-charcoal-400 dark:text-charcoal-400" />
                <span>Account Settings</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-burgundy-800 dark:text-burgundy-400 hover:bg-cream-100 dark:hover:bg-[#272732] transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <div className="border-t border-cream-200 dark:border-[#272730] my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
