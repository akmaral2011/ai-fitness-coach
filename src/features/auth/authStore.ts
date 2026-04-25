import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

type AuthState = {
  user: AuthUser | null;
  authModalOpen: boolean;
  setUser: (user: AuthUser) => void;
  signOut: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      authModalOpen: false,
      setUser: (user: AuthUser) => set({ user }),
      signOut: () => set({ user: null }),
      openAuthModal: () => set({ authModalOpen: true }),
      closeAuthModal: () => set({ authModalOpen: false }),
    }),
    {
      name: 'auth',
      partialize: state => ({ user: state.user }),
    }
  )
);
