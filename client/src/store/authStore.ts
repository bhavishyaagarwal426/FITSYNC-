import { create } from 'zustand';
import api from '@/services/api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('fitsync_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('fitsync_token'),
  isAuthenticated: Boolean(localStorage.getItem('fitsync_token')),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res: any = await api.post('/auth/login', credentials);
      localStorage.setItem('fitsync_token', res.token);
      localStorage.setItem('fitsync_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const res: any = await api.post('/auth/register', credentials);
      localStorage.setItem('fitsync_token', res.token);
      localStorage.setItem('fitsync_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('fitsync_token');
    localStorage.removeItem('fitsync_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (!localStorage.getItem('fitsync_token')) return;
    try {
      const user: any = await api.get('/auth/me');
      localStorage.setItem('fitsync_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  updateProfile: async (data) => {
    const updated: any = await api.put('/auth/me', data);
    const merged = { ...get().user, ...updated };
    localStorage.setItem('fitsync_user', JSON.stringify(merged));
    set({ user: merged });
  },
}));
