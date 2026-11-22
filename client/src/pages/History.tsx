import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useOutfitStore } from '@/store/outfitStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function History() {
  const { history, fetchHistory } = useOutfitStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Outfit Wear History
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Track when you wore each look to avoid repeating outfits too soon
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/style-me')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Style Today's Look
          </Button>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-8 h-8" />}
            title="No Outfit History Logged"
            description="When you wear an outfit recommendation, click 'Wore This' on the outfit screen to track your daily wardrobe journal."
            actionLabel="Browse Saved Outfits"
            onAction={() => navigate('/saved-outfits')}
          />
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate(`/outfit/${entry.outfitId}`)}
                className="bg-white rounded-2xl border border-cream-300 p-4 md:p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 flex flex-col items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-bold">
                      {new Date(entry.wornAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="burgundy" size="sm" className="capitalize">
                        {entry.outfit?.occasion?.replace('_', ' ') || 'Everyday'}
                      </Badge>
                      <span className="text-xs font-semibold text-charcoal-900">
                        {entry.outfit?.style} look
                      </span>
                    </div>
                    {entry.outfit?.explanation && (
                      <p className="text-xs text-charcoal-500 line-clamp-1 italic font-serif">
                        "{entry.outfit.explanation}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Mini-Previews */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3 overflow-hidden">
                    {entry.outfit?.items?.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.imageUrl}
                        alt={item.name}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-burgundy-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform pl-2">
                    <span>Recreate Look</span>
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
