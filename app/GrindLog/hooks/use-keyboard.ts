"use client";

import { useState, useEffect } from "react";

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    // If not in a browser, return
    if (typeof window === "undefined") return;
    setViewportHeight(window.visualViewport ? window.visualViewport.height : window.innerHeight);

    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    // Visual Viewport fallback for Android/iOS
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        // If visual viewport is significantly smaller than layout viewport, keyboard is likely open
        if (window.visualViewport.height < window.innerHeight - 150) {
          setIsKeyboardOpen(true);
        } else {
          // Double check if any input is actually active before setting to false
          if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            setIsKeyboardOpen(true);
          } else {
            setIsKeyboardOpen(false);
          }
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return { isKeyboardOpen, viewportHeight };
}
