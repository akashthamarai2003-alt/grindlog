"use client";

import { useEffect } from "react";
import { isNativePlatform } from "@/lib/capacitor/bridge";

export function AndroidBackButtonHandler() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    import("@capacitor/app").then(({ App }) => {
      const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
        const path = window.location.pathname;
        if (path === "/" || path === "/auth/signin") {
          App.exitApp();
        } else if (canGoBack || window.history.length > 1) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      cleanup = () => {
        listenerPromise.then((handle) => handle.remove()).catch(() => {});
      };
    }).catch(() => {});

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
