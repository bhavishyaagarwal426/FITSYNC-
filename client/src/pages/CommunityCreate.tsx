import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useCommunityStore } from '@/store/communityStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CommunityCreate() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createPost } = useCommunityStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Post title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        title,
        content,
        postType: 'text',
      });
      navigate(`/community/${post.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discussions</span>
        </button>

        <div className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Create a Community Discussion
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Ask for style advice, discuss seasonal trends, or share feedback on outfits.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Post Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How would you style beige wide-leg trousers for a casual autumn office day?"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Post Content & Context
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, specific questions, or styling dilemmas..."
                className="w-full bg-white border border-cream-300 rounded-xl p-3.5 text-xs md:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-cream-200">
              <span className="text-[11px] text-charcoal-400">
                Participation is optional. Your private wardrobe is never published without your explicit consent.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Publish Discussion
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
