import { create } from 'zustand';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { PinterestConnection } from '@/types';

interface PinterestState {
  connection: PinterestConnection | null;
  isLoading: boolean;
  isConnecting: boolean;
  fetchStatus: () => Promise<void>;
  connectPinterest: (username: string, preferredTheme?: string) => Promise<void>;
  syncPinterest: () => Promise<void>;
  disconnectPinterest: () => Promise<void>;
}

export const usePinterestStore = create<PinterestState>((set, get) => ({
  connection: null,
  isLoading: false,
  isConnecting: false,

  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const res: any = await api.get('/pinterest/status');
      set({ connection: res, isLoading: false });
    } catch {
      set({ connection: { connected: false }, isLoading: false });
    }
  },

  connectPinterest: async (username: string, preferredTheme = 'all') => {
    set({ isConnecting: true });
    try {
      const res: any = await api.post('/pinterest/connect', { username, preferredTheme });
      set({
        connection: {
          connected: true,
          username: res.username,
          boardsCount: res.boardsCount,
          pinsCount: res.pinsCount,
          aestheticTags: res.aestheticTags,
          colorPalette: res.colorPalette,
          lastSyncedAt: new Date().toISOString(),
        },
        isConnecting: false,
      });
      toast.success(res.message || 'Connected to Pinterest successfully!');
    } catch (err: any) {
      set({ isConnecting: false });
      toast.error(err?.response?.data?.error || 'Failed to connect Pinterest account.');
      throw err;
    }
  },

  syncPinterest: async () => {
    set({ isLoading: true });
    try {
      const res: any = await api.post('/pinterest/sync');
      const cur = get().connection;
      if (cur) {
        set({
          connection: {
            ...cur,
            pinsCount: res.pinsCount || cur.pinsCount,
            lastSyncedAt: res.lastSyncedAt || new Date().toISOString(),
          },
          isLoading: false,
        });
      }
      toast.success('Synced latest Pinterest pins & moodboards!');
    } catch (err: any) {
      set({ isLoading: false });
      toast.error(err?.response?.data?.error || 'Failed to sync Pinterest.');
    }
  },

  disconnectPinterest: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/pinterest/disconnect');
      set({ connection: { connected: false }, isLoading: false });
      toast.success('Pinterest account disconnected.');
    } catch {
      set({ isLoading: false });
      toast.error('Failed to disconnect Pinterest.');
    }
  },
}));
