import React from 'react';
import type { Comment } from '@/types';
import Avatar from '@/components/ui/Avatar';

interface CommentThreadProps {
  comments: Comment[];
}

export default function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-charcoal-400">
        No comments yet. Start the fashion discussion!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 bg-cream-50/50 p-3.5 rounded-xl border border-cream-200">
          <Avatar src={comment.user?.avatarUrl} name={comment.user?.displayName || 'User'} size="sm" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-charcoal-900">
                {comment.user?.displayName || 'Anonymous'}
              </span>
              <span className="text-[10px] text-charcoal-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-charcoal-700 leading-relaxed">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
