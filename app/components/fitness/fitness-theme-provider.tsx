"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type FitnessTheme = "primary" | "white";

interface FitnessThemeContextType {
  theme: FitnessTheme;
  setTheme: (theme: FitnessTheme) => void;
  toggleTheme: () => void;
}

const FitnessThemeContext = createContext<FitnessThemeContextType>({
  theme: "primary",
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "grindlog_fitness_theme";

export function FitnessThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<FitnessTheme>("primary");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isExcludedRoute = (path?: string | null) => {
    if (!path) return false;
    return (
      path.startsWith("/onboarding") ||
      path.startsWith("/auth") ||
      path.startsWith("/landing")
    );
  };

  const applyTheme = (newTheme: FitnessTheme, currentPath?: string | null) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const targetPath = currentPath !== undefined ? currentPath : pathname;
    if (newTheme === "white" && !isExcludedRoute(targetPath)) {
      root.classList.add("theme-white");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    } else {
      root.classList.remove("theme-white");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as FitnessTheme | null;
      if (stored === "white" || stored === "primary") {
        setThemeState(stored);
        applyTheme(stored, pathname);
      } else {
        applyTheme("primary", pathname);
      }
    } catch {
      applyTheme("primary", pathname);
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme, pathname);
  }, [pathname, theme, mounted]);

  const setTheme = (newTheme: FitnessTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore local storage write errors
    }
  };

  const toggleTheme = () => {
    const next = theme === "white" ? "primary" : "white";
    setTheme(next);
  };

  return (
    <FitnessThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </FitnessThemeContext.Provider>
  );
}

export function useFitnessTheme() {
  return useContext(FitnessThemeContext);
}
