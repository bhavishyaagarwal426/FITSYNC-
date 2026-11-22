import { create } from 'zustand';
import api from '@/services/api';
import type { BucketListItem, BucketListStats } from '@/types';

export interface BucketListFilters {
  category: string;
  priority: string;
  status: string;
  search: string;
  sortBy: string;
}

interface BucketListState {
  items: BucketListItem[];
  stats: BucketListStats;
  filters: BucketListFilters;
  isLoading: boolean;
  fetchItems: (filters?: Partial<BucketListFilters>) => Promise<void>;
  addItem: (data: FormData | Partial<BucketListItem>) => Promise<BucketListItem>;
  updateItem: (id: string, updates: Partial<BucketListItem>) => Promise<BucketListItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleAcquired: (id: string) => Promise<void>;
  moveToWardrobe: (id: string) => Promise<{ wardrobeItemId: string; message: string }>;
  setFilters: (filters: Partial<BucketListFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: BucketListFilters = {
  category: 'all',
  priority: 'all',
  status: 'all',
  search: '',
  sortBy: 'newest',
};

const defaultStats: BucketListStats = {
  totalItems: 0,
  totalDesiredValue: 0,
  acquiredCount: 0,
  dreamingCount: 0,
};

export const useBucketListStore = create<BucketListState>((set, get) => ({
  items: [],
  stats: defaultStats,
  filters: defaultFilters,
  isLoading: false,

  fetchItems: async (newFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = { ...get().filters, ...newFilters };
      const params: any = {};
      if (activeFilters.category && activeFilters.category !== 'all') params.category = activeFilters.category;
      if (activeFilters.priority && activeFilters.priority !== 'all') params.priority = activeFilters.priority;
      if (activeFilters.status && activeFilters.status !== 'all') params.status = activeFilters.status;
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.sortBy) params.sortBy = activeFilters.sortBy;

      const res: any = await api.get('/bucket-list', { params });
      set({
        items: res.data || [],
        stats: res.stats || defaultStats,
        filters: activeFilters,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  addItem: async (data) => {
    set({ isLoading: true });
    try {
      let res: any;
      if (data instanceof FormData) {
        res = await api.post('/bucket-list', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/bucket-list', data);
      }

      await get().fetchItems();
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true });
    try {
      const res: any = await api.put(`/bucket-list/${id}`, updates);
      await get().fetchItems();
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/bucket-list/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }));
      // Refresh stats
      get().fetchItems();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  toggleAcquired: async (id) => {
    try {
      await api.post(`/bucket-list/${id}/acquire`);
      await get().fetchItems();
    } catch (err) {
      throw err;
    }
  },

  moveToWardrobe: async (id) => {
    try {
      const res: any = await api.post(`/bucket-list/${id}/move-to-wardrobe`);
      await get().fetchItems();
      return res;
    } catch (err) {
      throw err;
    }
  },

  setFilters: (filters) => {
    const nextFilters = { ...get().filters, ...filters };
    get().fetchItems(nextFilters);
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchItems(defaultFilters);
  },
}));
