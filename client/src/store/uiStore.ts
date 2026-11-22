import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
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
  cookieConsent: initialConsent,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

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
