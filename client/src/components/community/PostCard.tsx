import React from 'react';
import { MessageSquare, Share2, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CommunityPost } from '@/types';
import Avatar from '@/components/ui/Avatar';
import VoteButtons from './VoteButtons';

interface PostCardProps {
  post: CommunityPost;
  onVote: (val: 'up' | 'down' | 'none') => void;
  onReport?: () => void;
}

export default function PostCard({ post, onVote, onReport }: PostCardProps) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/community/${post.id}`)}
      className="bg-white rounded-2xl border border-cream-300 p-4 md:p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex gap-4"
    >
      {/* Left: Voting controls */}
      <div className="shrink-0 hidden sm:block">
        <VoteButtons
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
          onVote={onVote}
        />
      </div>

      {/* Main post body */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Author & Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={post.user?.avatarUrl} name={post.user?.displayName || 'User'} size="sm" />
            <span className="text-xs font-semibold text-charcoal-900">
              {post.user?.displayName || 'Anonymous'}
            </span>
            <span className="text-[11px] text-charcoal-400">•</span>
            <span className="text-[11px] text-charcoal-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          {onReport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport();
              }}
              className="text-charcoal-400 hover:text-red-600 p-1"
              title="Report content"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Title & Preview Content */}
        <div>
          <h3 className="text-sm md:text-base font-bold text-charcoal-950 hover:text-burgundy-800 transition-colors leading-snug">
            {post.title}
          </h3>
          {post.content && (
            <p className="text-xs md:text-sm text-charcoal-600 line-clamp-3 mt-1 leading-relaxed">
              {post.content}
            </p>
          )}
        </div>

        {/* Image Attachment (if any) */}
        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden max-h-80 bg-cream-100 border border-cream-200 mt-2">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center gap-4 pt-2 border-t border-cream-200 text-xs text-charcoal-500">
          <div className="sm:hidden">
            <VoteButtons
              direction="horizontal"
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userVote={post.userVote}
              onVote={onVote}
            />
          </div>

          <div className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount} comments</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(window.location.origin + `/community/${post.id}`);
            }}
            className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
