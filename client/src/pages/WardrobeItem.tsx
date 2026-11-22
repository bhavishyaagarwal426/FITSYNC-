import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, Edit3, Check, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import type { WardrobeItem as WardrobeItemType } from '@/types';

const getCategoryFallback = (category: string, name: string) => {
  const icon = category === 'tops' ? '👔' : category === 'bottoms' ? '👖' : category === 'footwear' ? '👟' : category === 'outerwear' ? '🧥' : '🧣';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23F4EFE6"/><circle cx="200" cy="180" r="90" fill="%23EADFCB"/><text x="50%" y="46%" font-size="68" text-anchor="middle" dominant-baseline="middle">${icon}</text><text x="50%" y="74%" font-size="14" font-family="system-ui,-apple-system,sans-serif" font-weight="700" fill="%2364172D" text-anchor="middle" letter-spacing="1">${encodeURIComponent((name || category).slice(0, 24).toUpperCase())}</text></svg>`;
};

export default function WardrobeItem() {
  const { id } = useParams<{ id: string }>();
  const { fetchItemById, updateItem, deleteItem, toggleFavorite, toggleAvailability } = useWardrobeStore();
  const [item, setItem] = useState<WardrobeItemType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchItemById(id).then((data) => {
        setItem(data);
        setEditForm({
          name: data.name,
          category: data.category,
          subcategory: data.subcategory,
          color: data.color,
          pattern: data.pattern,
          material: data.material,
          style: data.style,
          formality: data.formality,
          season: data.season,
        });
      });
    }
  }, [id, fetchItemById]);

  if (!item) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-charcoal-400">Loading clothing details...</div>
      </AppLayout>
    );
  }

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updated = await updateItem(item.id, editForm);
      setItem(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this garment from your wardrobe?')) {
      await deleteItem(item.id);
      navigate('/wardrobe');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/wardrobe')}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Wardrobe</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await toggleFavorite(item.id);
                setItem({ ...item, isFavorite: !item.isFavorite });
              }}
              className="p-2 bg-white rounded-xl border border-cream-300 hover:border-cream-400 text-charcoal-600 hover:text-burgundy-800 transition-colors"
            >
              <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current text-burgundy-800' : ''}`} />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 bg-white rounded-xl border border-cream-300 hover:border-red-300 text-charcoal-500 hover:text-red-600 transition-colors"
              title="Delete garment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Garment Details Card */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Garment Image */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shadow-sm relative">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getCategoryFallback(item.category, item.name);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal-900 block">Garment Status</span>
                <span className="text-[11px] text-charcoal-500">
                  {item.isAvailable ? 'Clean & Ready to Wear' : 'Currently in Laundry'}
                </span>
              </div>
              <Button
                variant={item.isAvailable ? 'secondary' : 'primary'}
                size="sm"
                onClick={async () => {
                  await toggleAvailability(item.id);
                  setItem({ ...item, isAvailable: !item.isAvailable });
                }}
              >
                {item.isAvailable ? 'Mark In Laundry' : 'Mark Available'}
              </Button>
            </div>
          </div>

          {/* Right Column: Metadata & Edit Controls */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="burgundy" size="sm" className="capitalize">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-charcoal-400 capitalize">• {item.style}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Attributes'}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <Input
                    label="Garment Name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Category"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    />
                    <Input
                      label="Subcategory / Cut"
                      value={editForm.subcategory || ''}
                      onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                    />
                    <Input
                      label="Color"
                      value={editForm.color || ''}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    />
                    <Input
                      label="Pattern"
                      value={editForm.pattern || ''}
                      onChange={(e) => setEditForm({ ...editForm, pattern: e.target.value })}
                    />
                    <Input
                      label="Material"
                      value={editForm.material || ''}
                      onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                    />
                    <Input
                      label="Formality"
                      value={editForm.formality || ''}
                      onChange={(e) => setEditForm({ ...editForm, formality: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      isLoading={isSaving}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-charcoal-950">{item.name}</h2>

                  {/* Attributes Spec Table */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-cream-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Dominant Color
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800 capitalize">
                        {item.color}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Pattern
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800 capitalize">
                        {item.pattern || 'Solid'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Material & Fabric
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800 capitalize">
                        {item.material || 'Cotton blend'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Formality Rating
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800 capitalize">
                        {item.formality || 'Casual'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Recommended Season
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800 capitalize">
                        {item.season || 'All Season'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                        Times Worn
                      </span>
                      <span className="text-xs font-semibold text-charcoal-800">
                        {item.timesWorn || 0} times
                      </span>
                    </div>
                  </div>

                  {/* AI Confidence Notice */}
                  <div className="flex items-center gap-2 p-3 bg-cream-50 rounded-xl text-xs text-charcoal-600">
                    <Sparkles className="w-4 h-4 text-burgundy-800 shrink-0" />
                    <span>
                      AI Recognition confidence: <strong>95%</strong>. All attributes are fully user-editable at any time.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/style-me')}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="w-full"
            >
              Style Outfits With This Piece
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
