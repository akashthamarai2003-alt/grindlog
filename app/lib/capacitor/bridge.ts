import { Capacitor } from "@capacitor/core";

/**
 * Safely check if the current application is running inside a native wrapper (Android / iOS).
 * Returns false on SSR (Node.js/Next server) and standard desktop/mobile browsers.
 */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Safely check if running inside native Android.
 */
export function isAndroidNative(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

/**
 * Check if running in a standard web browser.
 */
export function isWebPlatform(): boolean {
  return !isNativePlatform();
}
