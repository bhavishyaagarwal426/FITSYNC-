import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, FileJson } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';

export default function PrivacyDownload() {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const navigate = useNavigate();

  const handleExport = () => {
    setIsExporting(true);
    // Trigger download from backend API
    const token = localStorage.getItem('fitsync_token');
    fetch('/api/privacy/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitsync-personal-archive-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
        setDownloadReady(true);
      })
      .catch(() => {
        setIsExporting(false);
      });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/privacy')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Privacy Governance</span>
        </button>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Export My Personal Wardrobe Archive
            </h1>
            <p className="text-xs text-charcoal-500">
              Download all structured attributes, clothing entries, generated outfits, and consent records.
            </p>
          </div>

          <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-burgundy-800" />
              <div>
                <h4 className="text-xs font-bold text-charcoal-900">Machine-Readable JSON Archive</h4>
                <p className="text-[11px] text-charcoal-500">
                  Includes garment categories, colors, textures, occasions, wear timestamps, and privacy logs.
                </p>
              </div>
            </div>
          </div>

          {downloadReady && (
            <div className="p-4 bg-green-50 text-green-700 text-xs rounded-2xl border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Archive generated and downloaded to your computer!</span>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-cream-200">
            <Button
              variant="primary"
              size="md"
              onClick={handleExport}
              isLoading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Generate & Download JSON
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
