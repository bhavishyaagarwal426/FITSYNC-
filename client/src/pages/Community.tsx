import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Flame, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { useCommunityStore } from '@/store/communityStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import PostCard from '@/components/community/PostCard';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export default function Community() {
  const { posts, isLoading, filterSort, fetchPosts, votePost } = useCommunityStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts(filterSort, search);
  }, [filterSort, search, fetchPosts]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Fashion Style Community
            </h1>
            <p className="text-xs text-charcoal-500">
              Discuss wardrobe ideas, color palettes, and get feedback from fellow stylists.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/community/create')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            Create Discussion
          </Button>
        </div>

        {/* Controls: Sorting & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-cream-300">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => fetchPosts('latest', search)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterSort === 'latest' ? 'bg-burgundy-800 text-white' : 'text-charcoal-600 hover:bg-cream-100'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => fetchPosts('top', search)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterSort === 'top' ? 'bg-burgundy-800 text-white' : 'text-charcoal-600 hover:bg-cream-100'
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top Rated</span>
            </button>

            <button
              onClick={() => fetchPosts('hot', search)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterSort === 'hot' ? 'bg-burgundy-800 text-white' : 'text-charcoal-600 hover:bg-cream-100'
              )}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hot</span>
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fashion posts..."
              className="w-full bg-cream-50 border border-cream-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
            />
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={(val) => votePost(post.id, val)}
              onReport={() => toast.success('Report submitted for moderator review')}
            />
          ))}

          {posts.length === 0 && !isLoading && (
            <div className="p-12 text-center bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs">
              No community discussions found. Be the first to start a conversation!
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
