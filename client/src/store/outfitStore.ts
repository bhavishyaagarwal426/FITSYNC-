import { create } from 'zustand';
import api from '@/services/api';
import type { Outfit, SavedOutfit, Collection, OutfitHistory, GenerateOutfitRequest } from '@/types';

interface OutfitState {
  currentOutfit: Outfit | null;
  savedOutfits: SavedOutfit[];
  collections: Collection[];
  history: OutfitHistory[];
  isLoading: boolean;
  error: string | null;
  generateOutfit: (req: GenerateOutfitRequest) => Promise<Outfit>;
  surpriseMe: () => Promise<Outfit>;
  fetchOutfitById: (id: string) => Promise<Outfit>;
  giveFeedback: (id: string, feedback: 'loved' | 'rejected' | 'saved') => Promise<void>;
  fetchSavedOutfits: () => Promise<void>;
  saveOutfit: (outfitId: string, collectionId?: string, notes?: string) => Promise<void>;
  unsaveOutfit: (savedId: string) => Promise<void>;
  markAsWorn: (outfitId: string, wornDate?: string, notes?: string) => Promise<void>;
  fetchCollections: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  currentOutfit: null,
  savedOutfits: [],
  collections: [],
  history: [],
  isLoading: false,
  error: null,

  generateOutfit: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const outfit: any = await api.post('/outfits/generate', params);
      set({ currentOutfit: outfit, isLoading: false });
      return outfit;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to generate outfit';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  surpriseMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const outfit: any = await api.post('/outfits/surprise');
      set({ currentOutfit: outfit, isLoading: false });
      return outfit;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to surprise you with an outfit';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  fetchOutfitById: async (id: string) => {
    set({ isLoading: true });
    try {
      const outfit: any = await api.get(`/outfits/${id}`);
      set({ currentOutfit: outfit, isLoading: false });
      return outfit;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  giveFeedback: async (id, feedback) => {
    await api.post(`/outfits/${id}/feedback`, { feedback });
    set((state) => ({
      currentOutfit: state.currentOutfit?.id === id ? { ...state.currentOutfit, feedback: { rating: feedback } as any } : state.currentOutfit,
    }));
  },

  fetchSavedOutfits: async () => {
    try {
      const res: any = await api.get('/outfits/saved/all');
      set({ savedOutfits: res.data || [] });
    } catch {}
  },

  saveOutfit: async (outfitId, collectionId, notes) => {
    await api.post(`/outfits/${outfitId}/save`, { collectionId, notes });
    get().fetchSavedOutfits();
  },

  unsaveOutfit: async (savedId) => {
    await api.delete(`/outfits/saved/${savedId}`);
    set((state) => ({
      savedOutfits: state.savedOutfits.filter((s) => s.id !== savedId),
    }));
  },

  markAsWorn: async (outfitId, wornDate, notes) => {
    await api.post(`/outfits/${outfitId}/worn`, { wornDate, notes });
    get().fetchHistory();
    get().fetchSavedOutfits();
  },

  fetchCollections: async () => {
    try {
      const res: any = await api.get('/collections');
      set({ collections: res.data || [] });
    } catch {}
  },

  createCollection: async (name, description) => {
    const col: any = await api.post('/collections', { name, description });
    set((state) => ({ collections: [col, ...state.collections] }));
    return col;
  },

  deleteCollection: async (id) => {
    await api.delete(`/collections/${id}`);
    set((state) => ({ collections: state.collections.filter((c) => c.id !== id) }));
  },

  fetchHistory: async () => {
    try {
      const res: any = await api.get('/history');
      set({ history: res.data || [] });
    } catch {}
  },
}));
