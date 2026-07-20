import { create } from "zustand";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "achievement";
  duration?: number;
}

interface UIState {
  theme: "light" | "dark";
  activeTab: string;
  toasts: Toast[];
  isTabBarVisible: boolean;
  notificationsEnabled: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  setActiveTab: (tab: string) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setTabBarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  activeTab: "dashboard",
  toasts: [],
  isTabBarVisible: true,
  notificationsEnabled: true,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  toggleNotifications: () =>
    set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
  setActiveTab: (activeTab) => set({ activeTab }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: crypto.randomUUID() },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setTabBarVisible: (isTabBarVisible) => set({ isTabBarVisible }),
}));
