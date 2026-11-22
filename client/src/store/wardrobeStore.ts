import { create } from 'zustand';
import api from '@/services/api';
import type { WardrobeItem, WardrobeFilters, PaginatedResponse } from '@/types';

interface WardrobeState {
  items: WardrobeItem[];
  selectedItem: WardrobeItem | null;
  filters: WardrobeFilters;
  isLoading: boolean;
  totalItems: number;
  fetchItems: (filters?: WardrobeFilters) => Promise<void>;
  fetchItemById: (id: string) => Promise<WardrobeItem>;
  uploadItem: (formData: FormData) => Promise<WardrobeItem>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<WardrobeItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  setFilters: (filters: Partial<WardrobeFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: WardrobeFilters = {
  category: 'all',
  sortBy: 'newest',
};

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  selectedItem: null,
  filters: defaultFilters,
  isLoading: false,
  totalItems: 0,

  fetchItems: async (newFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = { ...get().filters, ...newFilters };
      const params: any = {};
      if (activeFilters.category && activeFilters.category !== 'all') params.category = activeFilters.category;
      if (activeFilters.search) params.search = activeFilters.search;
      if (activeFilters.isFavorite) params.favorite = 'true';
      if (activeFilters.sortBy) params.sortBy = activeFilters.sortBy;

      const res: any = await api.get('/wardrobe', { params });
      set({
        items: res.data || [],
        totalItems: res.pagination?.total || 0,
        filters: activeFilters,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchItemById: async (id: string) => {
    set({ isLoading: true });
    try {
      const item: any = await api.get(`/wardrobe/${id}`);
      set({ selectedItem: item, isLoading: false });
      return item;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  uploadItem: async (formData: FormData) => {
    set({ isLoading: true });
    try {
      const res: any = await api.post('/wardrobe/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const createdItem = res.item;
      set((state) => ({
        items: [createdItem, ...state.items],
        totalItems: state.totalItems + 1,
        isLoading: false,
      }));
      return createdItem;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateItem: async (id, updates) => {
    const updated: any = await api.put(`/wardrobe/${id}`, updates);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...updated } : i)),
      selectedItem: state.selectedItem?.id === id ? { ...state.selectedItem, ...updated } : state.selectedItem,
    }));
    return updated;
  },

  deleteItem: async (id: string) => {
    await api.delete(`/wardrobe/${id}`);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      totalItems: Math.max(0, state.totalItems - 1),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    }));
  },

  toggleFavorite: async (id: string) => {
    const res: any = await api.post(`/wardrobe/${id}/favorite`);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, isFavorite: res.isFavorite } : i)),
      selectedItem: state.selectedItem?.id === id ? { ...state.selectedItem, isFavorite: res.isFavorite } : state.selectedItem,
    }));
  },

  toggleAvailability: async (id: string) => {
    const res: any = await api.post(`/wardrobe/${id}/availability`);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, isAvailable: res.isAvailable } : i)),
      selectedItem: state.selectedItem?.id === id ? { ...state.selectedItem, isAvailable: res.isAvailable } : state.selectedItem,
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchItems();
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchItems(defaultFilters);
  },
}));
