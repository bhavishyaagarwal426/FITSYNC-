import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Heart,
  Crown,
  DollarSign,
  Tag,
  ArrowRight,
  Shirt,
  Layers,
  Sparkle,
  Upload,
  Link as LinkIcon,
  ShoppingBag,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { useBucketListStore } from '@/store/bucketListStore';
import type { BucketListItem } from '@/types';
import toast from 'react-hot-toast';

export default function BucketList() {
  const {
    items,
    stats,
    filters,
    isLoading,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    toggleAcquired,
    moveToWardrobe,
    setFilters,
  } = useBucketListStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMoving, setIsMoving] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('dresses');
  const [formBrand, setFormBrand] = useState('');
  const [formTargetPrice, setFormTargetPrice] = useState('');
  const [formCurrency, setFormCurrency] = useState('$');
  const [formProductUrl, setFormProductUrl] = useState('');
  const [formPriority, setFormPriority] = useState<'grail' | 'high' | 'saving' | 'casual'>('high');
  const [formNotes, setFormNotes] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('dresses');
    setFormBrand('');
    setFormTargetPrice('');
    setFormCurrency('$');
    setFormProductUrl('');
    setFormPriority('high');
    setFormNotes('');
    setFormImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: BucketListItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category || 'dresses');
    setFormBrand(item.brand || '');
    setFormTargetPrice(item.targetPrice ? item.targetPrice.toString() : '');
    setFormCurrency(item.currency || '$');
    setFormProductUrl(item.productUrl || '');
    setFormPriority(item.priority || 'high');
    setFormNotes(item.notes || '');
    setFormImageUrl(item.imageUrl || '');
    setImagePreview(item.imageUrl || '');
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a title for your dream piece.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, {
          title: formTitle,
          category: formCategory,
          brand: formBrand,
          targetPrice: parseFloat(formTargetPrice) || 0,
          currency: formCurrency,
          productUrl: formProductUrl,
          priority: formPriority,
          notes: formNotes,
          imageUrl: formImageUrl || editingItem.imageUrl,
        });
        toast.success('Dream piece updated!');
      } else {
        if (imageFile) {
          const formData = new FormData();
          formData.append('title', formTitle);
          formData.append('category', formCategory);
          formData.append('brand', formBrand);
          formData.append('targetPrice', formTargetPrice);
          formData.append('currency', formCurrency);
          formData.append('productUrl', formProductUrl);
          formData.append('priority', formPriority);
          formData.append('notes', formNotes);
          formData.append('image', imageFile);
          await addItem(formData);
        } else {
          await addItem({
            title: formTitle,
            category: formCategory,
            brand: formBrand,
            targetPrice: parseFloat(formTargetPrice) || 0,
            currency: formCurrency,
            productUrl: formProductUrl,
            priority: formPriority,
            notes: formNotes,
            imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
          });
        }
        toast.success('Added to your Style Bucket List! ✨');
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save dream piece.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Remove "${title}" from your bucket list?`)) {
      try {
        await deleteItem(id);
        toast.success('Removed from bucket list');
      } catch {
        toast.error('Failed to remove item');
      }
    }
  };

  const handleToggleAcquired = async (id: string) => {
    try {
      await toggleAcquired(id);
      toast.success('Updated status!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleMoveToWardrobe = async (id: string) => {
    setIsMoving(id);
    try {
      const res = await moveToWardrobe(id);
      toast.success(res.message || 'Transferred to your Digital Wardrobe!');
    } catch {
      toast.error('Failed to move item to wardrobe');
    } finally {
      setIsMoving(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'dresses', label: 'Dresses 👗' },
    { id: 'tops', label: 'Tops 👚' },
    { id: 'bottoms', label: 'Bottoms 👖' },
    { id: 'outerwear', label: 'Outerwear 🧥' },
    { id: 'footwear', label: 'Footwear 👠' },
    { id: 'accessories', label: 'Accessories & Bags 👜' },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'grail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
            <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Holy Grail
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300 border border-burgundy-300 dark:border-burgundy-800/50">
            <Heart className="w-3 h-3 text-burgundy-700 dark:text-burgundy-400 fill-current" />
            Must-Have
          </span>
        );
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50">
            <DollarSign className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Saving Up
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 dark:bg-[#25252D] text-charcoal-700 dark:text-charcoal-300 border border-cream-300 dark:border-[#353540]">
            <Sparkle className="w-3 h-3 text-charcoal-500" />
            Dream Item
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn pb-16">
        {/* Top Editorial Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#1A1A1E] p-6 md:p-8 rounded-3xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300 text-[10px] font-extrabold uppercase tracking-widest">
                Wishlist & Future Wardrobe
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-950 dark:text-cream-100 tracking-tight">
              Style Bucket List
            </h1>
            <p className="text-xs md:text-sm text-charcoal-500 dark:text-charcoal-400 font-medium max-w-2xl">
              Curate and save your dream dresses, holy grails, and future fashion investments. Track target prices and transfer acquired pieces directly to your digital wardrobe!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/explore')}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Discover Ideas
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={openAddModal}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-sm font-semibold"
            >
              Add Dream Dress
            </Button>
          </div>
        </div>

        {/* 4 Stats Ribbon Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1A1E] p-4 md:p-5 rounded-2xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                Total Dream Items
              </span>
              <div className="w-7 h-7 rounded-lg bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-charcoal-900 dark:text-cream-100">{stats.totalItems}</p>
            <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500">In your wishlist</span>
          </div>

          <div className="bg-white dark:bg-[#1A1A1E] p-4 md:p-5 rounded-2xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                Estimated Value
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-charcoal-900 dark:text-cream-100">
              ${stats.totalDesiredValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500">Target budget</span>
          </div>

          <div className="bg-white dark:bg-[#1A1A1E] p-4 md:p-5 rounded-2xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                Acquired & Owned
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-charcoal-900 dark:text-cream-100">{stats.acquiredCount}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Added to wardrobe 🎉
            </span>
          </div>

          <div className="bg-white dark:bg-[#1A1A1E] p-4 md:p-5 rounded-2xl border border-cream-300 dark:border-[#2A2A33] shadow-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                Still Dreaming
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-black text-charcoal-900 dark:text-cream-100">{stats.dreamingCount}</p>
            <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500">Active aspirations</span>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dream dresses, brands, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-full pl-10 pr-4 py-2 text-xs md:text-sm text-charcoal-900 dark:text-cream-100 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500 focus:outline-none focus:border-burgundy-800 transition-colors shadow-xs"
              />
            </form>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-cream-200/70 dark:bg-[#202026] p-1 rounded-full border border-cream-300 dark:border-[#2D2D38]">
              {(['all', 'dreaming', 'acquired'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilters({ status: st })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                    filters.status === st
                      ? 'bg-burgundy-800 text-white shadow-xs'
                      : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Pieces' : st === 'dreaming' ? 'Dreaming 💭' : 'Acquired ✨'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters({ category: cat.id })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  filters.category === cat.id
                    ? 'bg-charcoal-900 dark:bg-cream-100 text-white dark:text-charcoal-950 border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#1A1A1E] text-charcoal-600 dark:text-charcoal-300 border-cream-300 dark:border-[#2D2D38] hover:border-burgundy-700/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dream Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] overflow-hidden animate-pulse h-96"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] p-12 text-center space-y-4 max-w-lg mx-auto shadow-card">
            <div className="w-16 h-16 rounded-full bg-burgundy-100 dark:bg-burgundy-950/80 text-burgundy-800 dark:text-burgundy-300 flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-cream-100">
              Your Style Bucket List is Empty
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
              Start building your dream closet! Save designer dresses, seasonal holy grails, and outfits you are saving up for.
            </p>
            <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
              Add Your First Dream Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1A1A1E] rounded-3xl border border-cream-300 dark:border-[#2A2A33] overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/5] bg-cream-100 dark:bg-[#121214] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent opacity-80" />

                    {/* Priority & Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      {getPriorityBadge(item.priority)}
                      {item.status === 'acquired' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                          ✓ Acquired
                        </span>
                      )}
                    </div>

                    {/* Price Tag Badge */}
                    {item.targetPrice > 0 && (
                      <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#18181C]/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-black text-charcoal-900 dark:text-cream-100 shadow-md">
                        {item.currency}{item.targetPrice.toLocaleString()}
                      </div>
                    )}

                    {/* Product Store Link Button */}
                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1E1E24]/90 backdrop-blur-xs text-charcoal-800 dark:text-cream-100 hover:text-burgundy-800 dark:hover:text-burgundy-400 flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                        title="Open product store link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Content details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-burgundy-800 dark:text-burgundy-400">
                        {item.brand || item.category}
                      </span>
                      <span className="text-[10px] text-charcoal-400 capitalize">{item.category}</span>
                    </div>

                    <h3 className="text-sm font-bold text-charcoal-950 dark:text-cream-100 line-clamp-1 leading-snug">
                      {item.title}
                    </h3>

                    {item.notes && (
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="p-4 pt-0 border-t border-cream-200 dark:border-[#272730] mt-3 flex items-center justify-between gap-2">
                  {item.status === 'acquired' ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> In Wardrobe
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMoveToWardrobe(item.id)}
                      isLoading={isMoving === item.id}
                      className="text-xs py-1 px-3 bg-burgundy-800 hover:bg-burgundy-900 font-semibold"
                    >
                      ⚡ Move to Closet
                    </Button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleAcquired(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        item.status === 'acquired'
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-cream-300 dark:border-[#2D2D38] hover:bg-cream-100 dark:hover:bg-[#25252D] text-charcoal-600 dark:text-charcoal-300'
                      }`}
                      title={item.status === 'acquired' ? 'Mark as Still Dreaming' : 'Mark as Acquired'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg border border-cream-300 dark:border-[#2D2D38] hover:bg-cream-100 dark:hover:bg-[#25252D] text-charcoal-600 dark:text-charcoal-300 transition-colors"
                      title="Edit Item"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg border border-cream-300 dark:border-[#2D2D38] hover:bg-red-50 dark:hover:bg-red-950/40 text-charcoal-400 hover:text-red-600 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Dream Item Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingItem ? 'Edit Dream Piece' : 'Add Dream Dress to Bucket List'}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveItem} className="space-y-4">
            <Input
              label="Item Title *"
              placeholder="e.g. Silk Botanical Flounce Maxi Dress"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-lg px-3.5 py-2.5 text-sm text-charcoal-900 dark:text-cream-100 focus:outline-none focus:border-burgundy-800"
                >
                  <option value="dresses">Dresses 👗</option>
                  <option value="tops">Tops & Blouses 👚</option>
                  <option value="bottoms">Bottoms & Skirts 👖</option>
                  <option value="outerwear">Outerwear & Coats 🧥</option>
                  <option value="footwear">Footwear & Heels 👠</option>
                  <option value="accessories">Bags & Accessories 👜</option>
                </select>
              </div>

              <Input
                label="Brand / Designer"
                placeholder="e.g. Zimmermann, Reformation, Chanel"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Target / Retail Price"
                  type="number"
                  placeholder="e.g. 290"
                  value={formTargetPrice}
                  onChange={(e) => setFormTargetPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                  Priority
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-lg px-3.5 py-2.5 text-sm text-charcoal-900 dark:text-cream-100 focus:outline-none focus:border-burgundy-800"
                >
                  <option value="grail">👑 Holy Grail</option>
                  <option value="high">💖 Must-Have</option>
                  <option value="saving">🎯 Saving For</option>
                  <option value="casual">✨ Casual Dream</option>
                </select>
              </div>
            </div>

            <Input
              label="Store or Product Web Link"
              placeholder="https://..."
              value={formProductUrl}
              onChange={(e) => setFormProductUrl(e.target.value)}
            />

            {/* Photo Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Photo (Image URL or File Upload)
              </label>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste direct Image URL (e.g. from Pinterest or brand site)..."
                  value={formImageUrl}
                  onChange={(e) => {
                    setFormImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-lg px-3.5 py-2 text-xs text-charcoal-900 dark:text-cream-100 focus:outline-none focus:border-burgundy-800"
                />

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-cream-400 dark:border-[#353540] rounded-lg text-xs font-semibold cursor-pointer hover:bg-cream-100 dark:hover:bg-[#25252D] text-charcoal-700 dark:text-charcoal-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {imageFile && <span className="text-xs text-emerald-600 truncate">{imageFile.name}</span>}
                </div>

                {imagePreview && (
                  <div className="w-20 h-24 rounded-xl border border-cream-300 dark:border-[#2D2D38] overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Styling Notes & Occasion Idea
              </label>
              <textarea
                rows={2}
                placeholder="Why do you love this piece? (e.g. Perfect for graduation gala or summer trip)"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-white dark:bg-[#1E1E24] border border-cream-300 dark:border-[#2D2D38] rounded-lg px-3.5 py-2 text-xs text-charcoal-900 dark:text-cream-100 focus:outline-none focus:border-burgundy-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200 dark:border-[#272730]">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                {editingItem ? 'Save Changes' : 'Save to Bucket List'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
