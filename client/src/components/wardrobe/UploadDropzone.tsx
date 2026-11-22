import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';

interface UploadDropzoneProps {
  onUpload: (files: File[]) => Promise<void>;
  isLoading?: boolean;
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

export default function UploadDropzone({ onUpload, isLoading = false }: UploadDropzoneProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError('Some files could not be uploaded. Only JPG, PNG, and WebP under 10MB are supported.');
    }

    const newPreviews = acceptedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadSubmit = async () => {
    if (previews.length === 0) return;
    try {
      await onUpload(previews.map((p) => p.file));
      // Cleanup preview URLs
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPreviews([]);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading,
  });

  return (
    <div className="space-y-6">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs select-none',
          isDragActive
            ? 'border-burgundy-800 bg-burgundy-50/50 scale-[1.01]'
            : 'border-cream-400 hover:border-burgundy-800 hover:bg-white',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-2xl bg-cream-200 text-burgundy-800 flex items-center justify-center mb-4 shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-charcoal-900 mb-1">
          {isDragActive ? 'Drop your garments here' : 'Drag & drop clothing photos here'}
        </h3>
        <p className="text-xs md:text-sm text-charcoal-500 max-w-sm mb-4">
          Upload clear photos of tops, bottoms, shoes, or accessories. Supports JPG, PNG, and WebP up to 10MB.
        </p>
        <Button variant="outline" size="sm" type="button">
          Browse Files
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Previews Grid */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Selected Items ({previews.length})
            </h4>
            <button
              onClick={() => {
                previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                setPreviews([]);
              }}
              className="text-xs text-charcoal-500 hover:text-red-600 underline"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {previews.map((item, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-cream-300 bg-cream-100 group shadow-xs">
                <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-charcoal-950/70 hover:bg-charcoal-950 text-white rounded-full transition-colors shadow-xs"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleUploadSubmit}
              isLoading={isLoading}
              className="w-full sm:w-auto px-8"
            >
              {isLoading ? 'AI Analyzing Garments...' : `Upload & Analyze ${previews.length} Item${previews.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
