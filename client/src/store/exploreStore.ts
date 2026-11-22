import { create } from 'zustand';
import api from '@/services/api';
import type { StyleInspiration } from '@/types';

interface ExploreState {
  inspirations: StyleInspiration[];
  savedInspirations: StyleInspiration[];
  selectedInspiration: StyleInspiration | null;
  isLoading: boolean;
  activeCategory: string;
  fetchInspirations: (category?: string, search?: string) => Promise<void>;
  fetchInspirationById: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
  fetchSaved: () => Promise<void>;
}

export const useExploreStore = create<ExploreState>((set) => ({
  inspirations: [],
  savedInspirations: [],
  selectedInspiration: null,
  isLoading: false,
  activeCategory: 'all',

  fetchInspirations: async (category = 'all', search) => {
    set({ isLoading: true, activeCategory: category });
    try {
      const params: any = {};
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const res: any = await api.get('/explore/inspirations', { params });
      set({ inspirations: res.data || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchInspirationById: async (id: string) => {
    set({ isLoading: true });
    try {
      const item: any = await api.get(`/explore/inspirations/${id}`);
      set({ selectedInspiration: item, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  toggleLike: async (id: string) => {
    const res: any = await api.post(`/explore/inspirations/${id}/like`);
    set((state) => ({
      inspirations: state.inspirations.map((i) => (i.id === id ? { ...i, likes: res.likes, isLiked: true } : i)),
    }));
  },

  toggleSave: async (id: string) => {
    const res: any = await api.post(`/explore/inspirations/${id}/save`);
    set((state) => ({
      inspirations: state.inspirations.map((i) => (i.id === id ? { ...i, isSaved: res.isSaved } : i)),
    }));
  },

  fetchSaved: async () => {
    try {
      const res: any = await api.get('/explore/saved');
      set({ savedInspirations: res.data || [] });
    } catch {}
  },
}));
