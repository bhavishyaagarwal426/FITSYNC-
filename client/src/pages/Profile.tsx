import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shirt, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function Profile() {
  const { user } = useAuthStore();
  const { totalItems, fetchItems } = useWardrobeStore();
  const { savedOutfits, fetchSavedOutfits } = useOutfitStore();
  const [preferences, setPreferences] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchSavedOutfits();
    api.get('/preferences').then((res) => setPreferences(res));
  }, [fetchItems, fetchSavedOutfits]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Avatar
              src={user?.avatarUrl}
              name={user?.displayName || 'User'}
              size="xl"
              className="ring-4 ring-cream-200 shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-charcoal-950">
                  {user?.displayName}
                </h1>
                {user?.role === 'admin' && (
                  <Badge variant="burgundy" size="sm">Admin</Badge>
                )}
              </div>
              <p className="text-xs text-charcoal-400 font-medium">{user?.email}</p>
              <p className="text-xs text-charcoal-500 pt-1">
                Fashion closet member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Edit Settings
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-bold">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{totalItems}</span>
              <span className="text-xs text-charcoal-500">Wardrobe Items</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cream-100 text-charcoal-700 flex items-center justify-center font-bold">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">{savedOutfits.length}</span>
              <span className="text-xs text-charcoal-500">Saved Looks</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-charcoal-950 block">100%</span>
              <span className="text-xs text-charcoal-500">Owned Clothes Match</span>
            </div>
          </div>
        </div>

        {/* Style Preferences Display */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-burgundy-800" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-700">
                Personal Style Preferences
              </h3>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs font-semibold text-burgundy-800 hover:underline"
            >
              Modify
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-charcoal-500 block mb-2">
                Aesthetic Directions
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {preferences?.preferredStyles?.length > 0 ? (
                  preferences.preferredStyles.map((style: string) => (
                    <Badge key={style} variant="burgundy" size="md" className="capitalize">
                      {style}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-charcoal-400">Casual, Minimalist</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-charcoal-500 block mb-2">
                Favorite Colors
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {preferences?.favouriteColours?.length > 0 ? (
                  preferences.favouriteColours.map((color: string) => (
                    <Badge key={color} variant="cream" size="md" className="capitalize">
                      {color}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-charcoal-400">Black, Beige, White</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
