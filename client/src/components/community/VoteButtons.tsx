import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (val: 'up' | 'down' | 'none') => void;
  direction?: 'vertical' | 'horizontal';
}

export default function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  direction = 'vertical',
}: VoteButtonsProps) {
  const score = upvotes - downvotes;

  const handleUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(userVote === 'up' ? 'none' : 'up');
  };

  const handleDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(userVote === 'down' ? 'none' : 'down');
  };

  return (
    <div
      className={clsx(
        'flex items-center rounded-xl bg-cream-100 border border-cream-300 p-1',
        direction === 'vertical' ? 'flex-col gap-0.5' : 'gap-1'
      )}
    >
      <button
        onClick={handleUp}
        className={clsx(
          'p-1 rounded-lg transition-colors',
          userVote === 'up'
            ? 'bg-burgundy-800 text-white'
            : 'text-charcoal-500 hover:text-burgundy-800 hover:bg-cream-200'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <span
        className={clsx(
          'text-xs font-bold px-1.5 select-none',
          userVote === 'up' ? 'text-burgundy-800' : userVote === 'down' ? 'text-blue-600' : 'text-charcoal-800'
        )}
      >
        {score}
      </span>

      <button
        onClick={handleDown}
        className={clsx(
          'p-1 rounded-lg transition-colors',
          userVote === 'down'
            ? 'bg-blue-600 text-white'
            : 'text-charcoal-500 hover:text-blue-600 hover:bg-cream-200'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
