import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useCommunityStore } from '@/store/communityStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import VoteButtons from '@/components/community/VoteButtons';
import CommentThread from '@/components/community/CommentThread';

export default function CommunityPost() {
  const { id } = useParams<{ id: string }>();
  const { currentPost, comments, fetchPostById, votePost, addComment } = useCommunityStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchPostById(id);
  }, [id, fetchPostById]);

  if (!currentPost) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-charcoal-400">Loading discussion...</div>
      </AppLayout>
    );
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(currentPost.id, newComment.trim());
      setNewComment('');
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

        {/* Post Card Detail */}
        <article className="bg-white rounded-3xl border border-cream-300 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar src={currentPost.user?.avatarUrl} name={currentPost.user?.displayName || 'User'} size="md" />
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">
                  {currentPost.user?.displayName || 'Anonymous'}
                </span>
                <span className="text-[11px] text-charcoal-400">
                  {new Date(currentPost.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <VoteButtons
              direction="horizontal"
              upvotes={currentPost.upvotes}
              downvotes={currentPost.downvotes}
              userVote={currentPost.userVote}
              onVote={(val) => votePost(currentPost.id, val)}
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-charcoal-950 leading-snug">
              {currentPost.title}
            </h1>
            <p className="text-xs md:text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
              {currentPost.content}
            </p>
          </div>

          {/* Comment submission form */}
          <form onSubmit={handleCommentSubmit} className="pt-6 border-t border-cream-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Join the conversation
            </label>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a constructive fashion response or tip..."
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs md:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Post Reply
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="pt-6 border-t border-cream-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Comments ({comments.length})
            </h3>
            <CommentThread comments={comments} />
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
