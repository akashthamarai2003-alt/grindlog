import { create } from "zustand";
import type { Profile } from "@/types";

interface AuthState {
  user: Profile | null;
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ isLoading: loading }),
  signOut: () =>
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
