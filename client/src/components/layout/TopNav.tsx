import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, X, Sparkles, User, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <header className="h-16 bg-cream-50/80 backdrop-blur-md border-b border-cream-300 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal-700 hover:bg-cream-200 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clothes, colors, outfits or styles..."
            className="w-full bg-white border border-cream-300 rounded-full pl-10 pr-4 py-2 text-xs md:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 transition-all shadow-sm"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Style Me CTA Shortcut */}
        <button
          onClick={() => navigate('/style-me')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-800 text-white text-xs font-semibold rounded-full hover:bg-burgundy-900 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Style Me</span>
        </button>

        {/* Notifications */}
        <button
          className="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 rounded-full transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-burgundy-800 rounded-full absolute top-1.5 right-1.5 ring-2 ring-cream-50" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 hover:bg-cream-200 rounded-full transition-colors"
          >
            <Avatar src={user?.avatarUrl} name={user?.displayName || 'User'} size="sm" />
            <span className="text-xs font-semibold text-charcoal-900 hidden md:block max-w-[120px] truncate">
              {user?.displayName || 'My Account'}
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-modal border border-cream-300 py-1.5 z-50 animate-fadeIn"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-cream-200">
                <p className="text-xs font-semibold text-charcoal-900 truncate">{user?.displayName}</p>
                <p className="text-[11px] text-charcoal-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-950 transition-colors"
              >
                <User className="w-4 h-4 text-charcoal-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-950 transition-colors"
              >
                <Settings className="w-4 h-4 text-charcoal-400" />
                <span>Account Settings</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-burgundy-800 hover:bg-cream-100 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <div className="border-t border-cream-200 my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
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
