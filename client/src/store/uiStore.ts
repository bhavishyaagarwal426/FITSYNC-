import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  cookieConsent: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    decided: boolean;
  };
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCookieConsent: (consent: Partial<UIState['cookieConsent']>) => void;
  acceptAllCookies: () => void;
  rejectNonEssentialCookies: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const initialTheme = ((): ThemeMode => {
  try {
    const stored = localStorage.getItem('fitsync_theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      applyThemeToDOM(stored as ThemeMode);
      return stored as ThemeMode;
    }
  } catch {}
  const fallback: ThemeMode = 'light';
  applyThemeToDOM(fallback);
  return fallback;
})();

// Listen for system color scheme changes if system mode is active
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try {
      const stored = localStorage.getItem('fitsync_theme');
      if (stored === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {}
  });
}

const initialConsent = (() => {
  try {
    const stored = localStorage.getItem('fitsync_cookie_consent');
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    decided: false,
  };
})();

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: initialTheme,
  cookieConsent: initialConsent,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  setTheme: (theme: ThemeMode) =>
    set(() => {
      try {
        localStorage.setItem('fitsync_theme', theme);
      } catch {}
      applyThemeToDOM(theme);
      return { theme };
    }),

  toggleTheme: () =>
    set((state) => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      const nextTheme: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem('fitsync_theme', nextTheme);
      } catch {}
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),

  setCookieConsent: (consent) =>
    set((state) => {
      const updated = { ...state.cookieConsent, ...consent, essential: true, decided: true };
      localStorage.setItem('fitsync_cookie_consent', JSON.stringify(updated));
      return { cookieConsent: updated };
    }),

  acceptAllCookies: () =>
    set(() => {
      const consent = { essential: true, functional: true, analytics: true, marketing: true, decided: true };
      localStorage.setItem('fitsync_cookie_consent', JSON.stringify(consent));
      return { cookieConsent: consent };
    }),

  rejectNonEssentialCookies: () =>
    set(() => {
      const consent = { essential: true, functional: false, analytics: false, marketing: false, decided: true };
      localStorage.setItem('fitsync_cookie_consent', JSON.stringify(consent));
      return { cookieConsent: consent };
    }),
}));
