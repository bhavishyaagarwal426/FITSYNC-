import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderHeart, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useOutfitStore } from '@/store/outfitStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function Collections() {
  const { collections, fetchCollections, createCollection, deleteCollection } = useOutfitStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      await createCollection(newTitle.trim(), newDesc.trim());
      setNewTitle('');
      setNewDesc('');
      setModalOpen(false);
      toast.success('Collection created!');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this collection? Outfits inside will remain in your saved closet.')) {
      await deleteCollection(id);
      toast.success('Collection deleted');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Outfit Collections
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Organize looks by season, vacation trips, work capsules, or special events
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            icon={<FolderHeart className="w-8 h-8" />}
            title="No Collections Yet"
            description="Create custom collections like 'Work Week 2026', 'Summer Holiday', or 'Date Nights' to organize your outfits."
            actionLabel="Create First Collection"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => navigate(`/collections/${col.id}`)}
                className="bg-white rounded-3xl border border-cream-300 p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-bold">
                      <FolderHeart className="w-5 h-5" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(col.id, e)}
                      className="text-charcoal-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-charcoal-900 group-hover:text-burgundy-800 transition-colors pt-2">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-xs text-charcoal-500 line-clamp-2">{col.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-6 border-t border-cream-200 text-xs">
                  <span className="font-medium text-charcoal-500">
                    {col.outfitCount || 0} outfit{col.outfitCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-bold text-burgundy-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Create New Outfit Collection"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Collection Name"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Autumn Office Rotation"
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief note about this collection's vibe or occasion..."
                className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs md:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isCreating}>
                Create Collection
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
