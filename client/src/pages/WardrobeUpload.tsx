import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import UploadDropzone from '@/components/wardrobe/UploadDropzone';
import type { WardrobeItem } from '@/types';

export default function WardrobeUpload() {
  const { uploadItem } = useWardrobeStore();
  const [uploadedItems, setUploadedItems] = useState<WardrobeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUploadFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    const results: WardrobeItem[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const item = await uploadItem(formData);
        results.push(item);
      }
      setUploadedItems(results);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to analyze some garments.');
    } finally {
      setIsProcessing(false);
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
        </div>

        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vision Garment Identification</span>
          </div>
          <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
            Upload Clothes to Your Wardrobe
          </h1>
          <p className="text-xs md:text-sm text-charcoal-500 max-w-xl leading-relaxed">
            Snap clear, well-lit photos of individual garments. FITSYNC will automatically identify categories, dominant colors, fabric texture, and styling attributes.
          </p>
        </div>

        {/* Upload Drop Area */}
        <UploadDropzone onUpload={handleUploadFiles} isLoading={isProcessing} />

        {/* Success Feedback Grid */}
        {uploadedItems.length > 0 && (
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-4 animate-slideUp">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Successfully Added {uploadedItems.length} Garment{uploadedItems.length > 1 ? 's' : ''} to Wardrobe!
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {uploadedItems.map((item) => (
                <div key={item.id} className="bg-cream-50 rounded-2xl p-3 border border-cream-200 space-y-2">
                  <div className="aspect-square rounded-xl overflow-hidden bg-cream-100">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-charcoal-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-charcoal-500 capitalize">
                      {item.category} • {item.color}
                    </p>
                    <span className="inline-block text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded mt-1">
                      AI Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
              <Button variant="outline" size="sm" onClick={() => setUploadedItems([])}>
                Upload More
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/wardrobe')}>
                Go to Wardrobe
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/style-me')}
                className="bg-burgundy-900"
              >
                Style with These Items →
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
