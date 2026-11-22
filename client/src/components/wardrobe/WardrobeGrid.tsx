import React from 'react';
import type { WardrobeItem } from '@/types';
import WardrobeItemCard from './WardrobeItemCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Shirt } from 'lucide-react';

interface WardrobeGridProps {
  items: WardrobeItem[];
  isLoading?: boolean;
  onItemClick?: (item: WardrobeItem) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  onUploadClick?: () => void;
}

export default function WardrobeGrid({
  items,
  isLoading,
  onItemClick,
  onToggleFavorite,
  onToggleAvailability,
  onUploadClick,
}: WardrobeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="card" className="aspect-square h-auto" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Shirt className="w-8 h-8" />}
        title="Your Wardrobe is Empty"
        description="Snap or upload photos of your clothes to organize your digital closet and unlock AI styling."
        actionLabel="Upload First Item"
        onAction={onUploadClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
      {items.map((item) => (
        <WardrobeItemCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
          onToggleFavorite={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(item.id);
          }}
          onToggleAvailability={(e) => {
            e.stopPropagation();
            onToggleAvailability?.(item.id);
          }}
        />
      ))}
    </div>
  );
}
