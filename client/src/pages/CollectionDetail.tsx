import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FolderHeart, Trash2 } from 'lucide-react';
import api from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/collections/${id}`).then((res: any) => {
        setCollection(res);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading || !collection) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-charcoal-400">Loading collection...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/collections')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </button>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-xs text-charcoal-500">{collection.description}</p>
            )}
            <p className="text-[11px] text-charcoal-400">
              {collection.outfitCount || 0} looks in this collection
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/style-me')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Style a New Look for this Collection
          </Button>
        </div>

        {collection.outfits?.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs">
            No outfits added to this collection yet. When generating or saving an outfit, choose this collection!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.outfits?.map((outfit: any) => (
              <div
                key={outfit.id}
                onClick={() => navigate(`/outfit/${outfit.id}`)}
                className="bg-white rounded-3xl border border-cream-300 p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <Badge variant="burgundy" size="sm" className="capitalize">
                    {outfit.occasion?.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-charcoal-700 italic font-serif line-clamp-2">
                    "{outfit.explanation}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-cream-200 flex justify-end">
                  <span className="text-xs font-bold text-burgundy-800">View Look →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
