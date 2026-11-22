import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Heart, SlidersHorizontal } from 'lucide-react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid';

export default function Wardrobe() {
  const { items, totalItems, isLoading, fetchItems, toggleFavorite, toggleAvailability } = useWardrobeStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    fetchItems({
      category: currentCategory,
      search: searchQuery,
      isFavorite: showOnlyFavorites,
      sortBy,
    });
  }, [currentCategory, searchQuery, showOnlyFavorites, sortBy, fetchItems]);

  const categoryTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'tops', label: 'Tops' },
    { id: 'bottoms', label: 'Bottoms' },
    { id: 'footwear', label: 'Footwear' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const handleCategoryChange = (catId: string) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Title & Upload Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              My Digital Wardrobe
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {totalItems} total garments cataloged and available for styling
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/wardrobe/upload')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Upload Clothes
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-cream-300 p-3 shadow-xs space-y-3">
          {/* Category Tabs */}
          <Tabs
            tabs={categoryTabs}
            activeTab={currentCategory}
            onChange={handleCategoryChange}
          />

          {/* Search, Favorites & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, color, style..."
                className="w-full bg-cream-50 border border-cream-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showOnlyFavorites
                    ? 'bg-burgundy-50 border-burgundy-300 text-burgundy-800'
                    : 'border-cream-300 text-charcoal-600 hover:bg-cream-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current text-burgundy-800' : ''}`} />
                <span>Favorites Only</span>
              </button>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-cream-50 border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-700 focus:outline-none focus:border-burgundy-800"
              >
                <option value="newest">Recently Added</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clothes Grid */}
        <WardrobeGrid
          items={items}
          isLoading={isLoading}
          onItemClick={(item) => navigate(`/wardrobe/${item.id}`)}
          onToggleFavorite={toggleFavorite}
          onToggleAvailability={toggleAvailability}
          onUploadClick={() => navigate('/wardrobe/upload')}
        />
      </div>
    </AppLayout>
  );
}
