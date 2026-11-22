import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { useOutfitStore } from '@/store/outfitStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function SavedOutfits() {
  const { savedOutfits, fetchSavedOutfits, unsaveOutfit, markAsWorn } = useOutfitStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedOutfits();
  }, [fetchSavedOutfits]);

  const handleUnsave = async (savedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await unsaveOutfit(savedId);
    toast.success('Outfit removed from saved closet');
  };

  const handleWorn = async (outfitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsWorn(outfitId);
    toast.success('Marked as worn today!');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Saved Outfits
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Your favorite curated combinations ready to be worn again
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/style-me')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Create New Outfit
          </Button>
        </div>

        {savedOutfits.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="w-8 h-8" />}
            title="No Saved Outfits Yet"
            description="When you generate a look you love, tap 'Save Look' to store it here for easy access."
            actionLabel="Generate an Outfit"
            onAction={() => navigate('/style-me')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map((saved) => (
              <div
                key={saved.id}
                onClick={() => navigate(`/outfit/${saved.outfit.id}`)}
                className="bg-white rounded-3xl border border-cream-300 p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="burgundy" size="sm" className="capitalize">
                      {saved.outfit.occasion.replace('_', ' ')}
                    </Badge>
                    <button
                      onClick={(e) => handleUnsave(saved.id, e)}
                      className="text-charcoal-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Collage of Garments */}
                  <div className="grid grid-cols-3 gap-2">
                    {saved.outfit.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="aspect-square rounded-xl bg-cream-100 overflow-hidden border border-cream-200">
                        <img
                          src={item.wardrobeItem.imageUrl}
                          alt={item.wardrobeItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-charcoal-700 italic font-serif line-clamp-2">
                    "{saved.outfit.explanation}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-cream-200">
                  <button
                    onClick={(e) => handleWorn(saved.outfit.id, e)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Worn {saved.wornCount || 0}x</span>
                  </button>

                  <span className="text-xs font-bold text-burgundy-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Look</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
