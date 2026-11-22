import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOutfitStore } from '@/store/outfitStore';
import AppLayout from '@/components/layout/AppLayout';
import OutfitDisplay from '@/components/styleme/OutfitDisplay';

export default function OutfitView() {
  const { id } = useParams<{ id: string }>();
  const { currentOutfit, fetchOutfitById, giveFeedback, generateOutfit, saveOutfit, markAsWorn } = useOutfitStore();
  const [isLoadingAnother, setIsLoadingAnother] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchOutfitById(id);
    }
  }, [id, fetchOutfitById]);

  if (!currentOutfit) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-charcoal-400">Loading outfit combination...</div>
      </AppLayout>
    );
  }

  const handleLove = async () => {
    await giveFeedback(currentOutfit.id, 'loved');
    toast.success('Saved to your style preferences! We will recommend similar cuts.');
  };

  const handleReject = async () => {
    await giveFeedback(currentOutfit.id, 'rejected');
    toast('Recorded. We will avoid repeating this pairing.', { icon: '👌' });
  };

  const handleTryAnother = async () => {
    setIsLoadingAnother(true);
    try {
      const nextOutfit = await generateOutfit({
        occasion: currentOutfit.occasion,
        style: currentOutfit.style,
        weather: currentOutfit.weather,
      });
      navigate(`/outfit/${nextOutfit.id}`);
    } catch {
      toast.error('No other valid combinations found with these exact filters.');
    } finally {
      setIsLoadingAnother(false);
    }
  };

  const handleSave = async () => {
    await saveOutfit(currentOutfit.id);
    toast.success('Outfit saved to your closet collection!');
  };

  const handleMarkWorn = async () => {
    await markAsWorn(currentOutfit.id);
    toast.success('Logged in your outfit history for today!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `FITSYNC ${currentOutfit.occasion} Look`,
        text: currentOutfit.explanation,
        url: window.location.href,
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Outfit link copied to clipboard!');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/style-me')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stylist Parameters</span>
        </button>

        <OutfitDisplay
          outfit={currentOutfit}
          onLove={handleLove}
          onReject={handleReject}
          onTryAnother={handleTryAnother}
          onSave={handleSave}
          onMarkWorn={handleMarkWorn}
          onShare={handleShare}
          isLoadingAnother={isLoadingAnother}
        />
      </div>
    </AppLayout>
  );
}
