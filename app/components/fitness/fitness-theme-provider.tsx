"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as FitnessTheme | null;
      if (stored === "white" || stored === "primary") {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        applyTheme("primary");
      }
    } catch {
      applyTheme("primary");
    } finally {
      setMounted(true);
    }
  }, []);

  const applyTheme = (newTheme: FitnessTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (newTheme === "white") {
      root.classList.add("theme-white");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    } else {
      root.classList.remove("theme-white");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    }
  };

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
