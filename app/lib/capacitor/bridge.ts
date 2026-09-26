import { Capacitor } from "@capacitor/core";

/**
 * Safely check if the current application is running inside a native wrapper (Android / iOS).
 * Returns false on SSR (Node.js/Next server) and standard desktop/mobile browsers.
 */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {}
  try {
    if ((window as any).Capacitor?.isNativePlatform?.()) return true;
    const ua = window.navigator?.userAgent || "";
    if (ua.includes("GrindLogApp") || ua.includes("CapacitorApp")) return true;
  } catch {}
  return false;
}

/**
 * Safely check if running inside native Android.
 */
export function isAndroidNative(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (Capacitor.getPlatform() === "android") return true;
  } catch {}
  try {
    const ua = window.navigator?.userAgent || "";
    if ((ua.includes("GrindLogApp") || ua.includes("CapacitorApp")) && /Android/i.test(ua)) return true;
  } catch {}
  return false;
}

/**
 * Check if running in a standard web browser.
 */
export function isWebPlatform(): boolean {
  return !isNativePlatform();
}
