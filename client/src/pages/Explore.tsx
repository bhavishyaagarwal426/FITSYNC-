import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bookmark, Heart, Sparkles, RefreshCw, ExternalLink, Link2, CheckCircle2, X } from 'lucide-react';
import { useExploreStore } from '@/store/exploreStore';
import { usePinterestStore } from '@/store/pinterestStore';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { clsx } from 'clsx';

export default function Explore() {
  const { inspirations, isLoading, fetchInspirations, toggleLike, toggleSave } = useExploreStore();
  const { connection, fetchStatus, connectPinterest, syncPinterest, disconnectPinterest, isConnecting, isLoading: isPinterestLoading } = usePinterestStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [pinterestUsername, setPinterestUsername] = useState('');
  const [selectedPresetTheme, setSelectedPresetTheme] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchInspirations(selectedCategory, search);
  }, [selectedCategory, search, fetchInspirations]);

  const categories = [
    { id: 'all', label: 'All Lookbooks' },
    { id: 'pinterest', label: '📌 My Pinterest Feed' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'casual', label: 'Casual Outing' },
    { id: 'formal', label: 'Old Money & Tailored' },
    { id: 'korean', label: 'Korean Street' },
    { id: 'sporty', label: 'Sporty Chic' },
  ];

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await connectPinterest(pinterestUsername || 'fashion_curator', selectedPresetTheme);
    setIsConnectModalOpen(false);
    setSelectedCategory('pinterest');
  };

  const handleRecreateWithWardrobe = (item: any) => {
    const styleParam = item.style || 'casual';
    const occasionParam = item.occasion || 'casual';
    const colorParam = item.colors?.[0] || '';
    navigate(`/style-me?style=${styleParam}&occasion=${occasionParam}&color=${colorParam}&fromPinterest=true`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-charcoal-950 tracking-tight">
                Style Discovery & Inspiration
              </h1>
              <span className="text-[10px] bg-burgundy-100 text-burgundy-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pinterest Sync
              </span>
            </div>
            <p className="text-xs text-charcoal-500 max-w-xl">
              Editorial lookbooks and real Pinterest moodboards researched to give your wardrobe realistic outfit possibilities.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search aesthetics, moodboards..."
              className="w-full bg-cream-50 border border-cream-300 rounded-full pl-9 pr-4 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
            />
          </div>
        </div>

        {/* Pinterest Integration Banner */}
        <div className="bg-gradient-to-r from-red-900 via-burgundy-900 to-charcoal-950 text-white rounded-3xl p-5 md:p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                P
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-200">
                Pinterest Personal Stylist Sync
              </span>
              {connection?.connected && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Synced with @{connection.username}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-cream-100 max-w-2xl leading-relaxed">
              {connection?.connected
                ? `Active moodboard sync: ${connection.pinsCount || 12} saved fashion pins across ${connection.boardsCount || 4} aesthetic boards are actively training your AI stylist recommendations.`
                : 'Link your Pinterest account to automatically sync your fashion pins, train your AI Stylist on your favorite aesthetics, and recreate Pinterest outfits using your owned clothes.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 shrink-0">
            {connection?.connected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncPinterest()}
                  disabled={isPinterestLoading}
                  leftIcon={<RefreshCw className={clsx('w-3.5 h-3.5', isPinterestLoading && 'animate-spin')} />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
                >
                  Sync Moodboards
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnectPinterest()}
                  className="text-red-300 hover:text-red-200 text-xs hover:bg-red-950/40"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConnectModalOpen(true)}
                leftIcon={<Link2 className="w-4 h-4" />}
                className="bg-red-600 hover:bg-red-700 text-white border-none shadow-md text-xs font-bold px-4 py-2"
              >
                Connect Pinterest
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5',
                selectedCategory === cat.id
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'bg-white border border-cream-300 text-charcoal-700 hover:bg-cream-100'
              )}
            >
              {cat.id === 'pinterest' && <span className="text-red-500 font-bold">●</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Masonry Inspiration Grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {inspirations.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all group flex flex-col"
            >
              <div className="relative overflow-hidden bg-cream-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => navigate(`/explore/${item.id}`)}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23242424"/><circle cx="200" cy="220" r="120" fill="none" stroke="%2364172D" stroke-width="4"/><text x="50%" y="45%" font-size="20" font-family="sans-serif" font-weight="bold" fill="%23FAF7F2" text-anchor="middle" letter-spacing="2">FITSYNC EDITORIAL</text><text x="50%" y="55%" font-size="12" font-family="sans-serif" fill="%23E0D5C4" text-anchor="middle">${encodeURIComponent(item.title.toUpperCase())}</text></svg>`;
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {(item.isPinterest || selectedCategory === 'pinterest') && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                      <span>📌 Pinterest</span>
                    </span>
                  )}
                  {item.boardName && (
                    <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-charcoal-800 px-2 py-0.5 rounded-full shadow-xs truncate max-w-[120px]">
                      {item.boardName}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(item.id);
                    }}
                    className={clsx(
                      'p-2 rounded-full backdrop-blur-md shadow-sm transition-all',
                      item.isLiked ? 'bg-burgundy-800 text-white' : 'bg-white/80 text-charcoal-600 hover:bg-white'
                    )}
                    aria-label="Like"
                  >
                    <Heart className={clsx('w-3.5 h-3.5', item.isLiked && 'fill-current')} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item.id);
                    }}
                    className={clsx(
                      'p-2 rounded-full backdrop-blur-md shadow-sm transition-all',
                      item.isSaved ? 'bg-burgundy-800 text-white' : 'bg-white/80 text-charcoal-600 hover:bg-white'
                    )}
                    aria-label="Save"
                  >
                    <Bookmark className={clsx('w-3.5 h-3.5', item.isSaved && 'fill-current')} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4
                    onClick={() => navigate(`/explore/${item.id}`)}
                    className="text-xs font-bold text-charcoal-900 leading-snug group-hover:text-burgundy-800 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-cream-100 text-charcoal-600 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Direct Action: Recreate Look with Owned Clothes */}
                <button
                  onClick={() => handleRecreateWithWardrobe(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 rounded-xl text-xs font-bold transition-colors border border-burgundy-200 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-burgundy-800" />
                  <span>Match with My Wardrobe</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Pinterest Modal */}
        <Modal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          title="Connect Your Pinterest Account"
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-charcoal-500">
              Sync your Pinterest boards to power your digital wardrobe with your personalized fashion inspiration.
            </p>
            <form onSubmit={handleConnectSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-charcoal-700 block mb-1">
                Pinterest Username or Handle
              </label>
              <Input
                placeholder="e.g. style_curator or alex_fits"
                value={pinterestUsername}
                onChange={(e) => setPinterestUsername(e.target.value)}
                required
              />
              <p className="text-[11px] text-charcoal-400 mt-1">
                Enter any public Pinterest handle, or choose one of our verified curated fashion moodboards below.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal-700 block mb-1.5">
                Primary Aesthetic Moodboard to Sync
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', title: '✨ All Curated Boards', sub: 'Minimalist, Street, Old Money' },
                  { id: 'minimalist', title: '🤍 Clean Minimalist', sub: 'Neutrals & Color Sandwiching' },
                  { id: 'formal', title: '🏛️ Old Money & Tailoring', sub: 'Wool Blazers & Loafers' },
                  { id: 'streetwear', title: '🛹 Seoul Streetwear', sub: 'Hoodies & Relaxed Denim' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetTheme(preset.id)}
                    className={clsx(
                      'p-2.5 rounded-xl border text-left transition-all',
                      selectedPresetTheme === preset.id
                        ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900 ring-1 ring-burgundy-800'
                        : 'border-cream-300 bg-white hover:bg-cream-50 text-charcoal-700'
                    )}
                  >
                    <span className="text-xs font-bold block">{preset.title}</span>
                    <span className="text-[10px] text-charcoal-500">{preset.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-[11px] text-charcoal-600 space-y-1">
              <span className="font-bold text-charcoal-900 block">How FITSYNC uses your Pinterest data:</span>
              <p>• Extracts color palettes and silhouette ratios you frequently pin.</p>
              <p>• Assembles realistic outfits from your OWN digital closet that mirror your Pinterest aesthetic.</p>
              <p>• Never posts or modifies anything on your Pinterest account.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsConnectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isConnecting}
                className="bg-red-600 hover:bg-red-700 text-white border-none font-bold"
              >
                Sync & Connect Pinterest
              </Button>
            </div>
          </form>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
