import { create } from "zustand";
import type { Profile } from "@/types";

export interface AuthState {
  user: Profile | null;
  pendingProfile: Partial<Profile> | null;
  isProfilePending: boolean;
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setPendingProfile: (pendingProfile: Partial<Profile> | null) => void;
  setSession: (session: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  pendingProfile: null,
  isProfilePending: false,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) =>
    set((state) => ({
      user,
      pendingProfile: null,
      isProfilePending: false,
      isAuthenticated: !!user || !!state.session,
      isLoading: false,
    })),
  setPendingProfile: (pendingProfile) =>
    set({
      pendingProfile,
      isProfilePending: !!pendingProfile,
    }),
  setSession: (session) =>
    set((state) => ({
      session,
      isAuthenticated: !!session || !!state.user,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  signOut: () =>
    set({
      user: null,
      pendingProfile: null,
      isProfilePending: false,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
