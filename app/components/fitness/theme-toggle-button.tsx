"use client";

import { useFitnessTheme } from "./fitness-theme-provider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleButtonProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggleButton({ className = "", size = "md" }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useFitnessTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-10 h-10 rounded-full border border-white/10 bg-white/5 opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isWhite = theme === "white";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${
        isWhite
          ? "w-10 h-10 bg-white border border-gray-200 text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:bg-gray-50"
          : "w-10 h-10 bg-[#121E12] border border-[#1A2619] text-gray-300 hover:text-white hover:border-[#ADFF00]/40 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
      } ${className}`}
      title={isWhite ? "Switch to Primary (Dark) Theme" : "Switch to White Theme"}
      aria-label={isWhite ? "Switch to Primary (Dark) Theme" : "Switch to White Theme"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isWhite ? (
          <Moon className="w-4 h-4 text-emerald-600 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
