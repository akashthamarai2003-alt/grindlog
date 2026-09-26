"use client";

import { useEffect, useRef, useState } from "react";
import { isNativePlatform } from "@/lib/capacitor/bridge";
import { createClient } from "@/lib/services/supabase/client";
import { getSafeRedirect } from "@/lib/utils/redirect";

// In-memory set to prevent duplicate execution of the same OAuth code or token callback
const processedCodes = new Set<string>();

export function AndroidAuthHandler() {
  const isHandlingRef = useRef(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    const checkOnboardingCompleted = async (supabase: any, userId: string): Promise<boolean> => {
      try {
        const { data: fitnessProfile } = await supabase
          .from("fitness_os_profiles")
          .select("onboarding_completed")
          .eq("user_id", userId)
          .maybeSingle();

        if (fitnessProfile?.onboarding_completed !== undefined) {
          return Boolean(fitnessProfile.onboarding_completed);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .maybeSingle();

        return Boolean(profile?.onboarding_completed ?? true);
      } catch {
        return true; // Default to true on error so existing users are not trapped in onboarding
      }
    };

    const handleAuthUrl = async (rawUrl: string) => {
      if (!rawUrl) return;

      // 1. Strict callback validation: only accept trusted deep link schemes and hosts
      const isCustomScheme =
        rawUrl.startsWith("com.grindlog.app://") ||
        rawUrl.startsWith("grindlog://");
      const isHttpsAppUrl =
        rawUrl.startsWith("https://www.grindlog.in/auth/callback") ||
        rawUrl.startsWith("https://grindlog.in/auth/callback");

      if (!isCustomScheme && !isHttpsAppUrl) {
        return;
      }

      // Prevent concurrent callback executions
      if (isHandlingRef.current) return;
      isHandlingRef.current = true;
      setIsAuthenticating(true);

      try {
        // Attempt to close any open Chrome Custom Tab immediately
        const { Browser } = await import("@capacitor/browser");
        await Browser.close().catch(() => {});
      } catch {
        // Ignore browser close errors
      }

      try {
        // Robust parameter extraction that never throws on custom URI schemes
        let code: string | null = null;
        let next: string | null = null;
        let error: string | null = null;
        let errorDesc: string | null = null;
        let hashFragment = "";

        const queryIndex = rawUrl.indexOf("?");
        const hashIndex = rawUrl.indexOf("#");

        if (queryIndex !== -1) {
          const queryPart =
            hashIndex !== -1 && hashIndex > queryIndex
              ? rawUrl.substring(queryIndex + 1, hashIndex)
              : rawUrl.substring(queryIndex + 1);
          const params = new URLSearchParams(queryPart);
          code = params.get("code");
          next = params.get("next") || params.get("redirect");
          error = params.get("error") || params.get("error_code");
          errorDesc = params.get("error_description");
        }

        if (hashIndex !== -1) {
          hashFragment = rawUrl.substring(hashIndex + 1);
        }

        if (error) {
          const message = errorDesc || error;
          console.warn("OAuth error received in deep-link:", message);
          setIsAuthenticating(false);
          isHandlingRef.current = false;
          window.location.href = `/auth/signin?error=${encodeURIComponent(message)}`;
          return;
        }

        const supabase = createClient();

        // 2. PKCE Code Exchange flow
        if (code) {
          if (processedCodes.has(code)) {
            setIsAuthenticating(false);
            isHandlingRef.current = false;
            return;
          }
          processedCodes.add(code);

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (!exchangeError && data?.session?.user) {
            const isOnboarded = await checkOnboardingCompleted(supabase, data.session.user.id);
            const safeNext = getSafeRedirect(next);
            const destination = !isOnboarded
              ? "/onboarding"
              : safeNext === "/onboarding" || safeNext === "/report"
              ? "/"
              : safeNext;

            window.location.href = destination;
            return;
          }

          if (exchangeError) {
            console.error("OAuth exchange code error:", exchangeError);
            setIsAuthenticating(false);
            isHandlingRef.current = false;
            window.location.href = `/auth/signin?error=${encodeURIComponent(exchangeError.message || "auth_callback_error")}`;
            return;
          }
        }

        // 3. Hash fragment token flow (fallback for implicit OAuth)
        if (hashFragment) {
          const hashParams = new URLSearchParams(hashFragment);
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const tokenKey = `${accessToken.substring(0, 15)}_${refreshToken.substring(0, 15)}`;
            if (processedCodes.has(tokenKey)) {
              setIsAuthenticating(false);
              isHandlingRef.current = false;
              return;
            }
            processedCodes.add(tokenKey);

            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!sessionError && sessionData?.session?.user) {
              const isOnboarded = await checkOnboardingCompleted(supabase, sessionData.session.user.id);
              const safeNext = getSafeRedirect(next);
              const destination = !isOnboarded
                ? "/onboarding"
                : safeNext === "/onboarding" || safeNext === "/report"
                ? "/"
                : safeNext;

              window.location.href = destination;
              return;
            }

            if (sessionError) {
              console.error("OAuth session token error:", sessionError);
              setIsAuthenticating(false);
              isHandlingRef.current = false;
              window.location.href = `/auth/signin?error=${encodeURIComponent(sessionError.message || "auth_callback_error")}`;
              return;
            }
          }
        }
      } catch (err: any) {
        console.error("Error processing auth deep-link URL:", err);
      } finally {
        setIsAuthenticating(false);
        isHandlingRef.current = false;
      }
    };

    import("@capacitor/app")
      .then(({ App }) => {
        // Listen for app opens from external browser or Custom Tab redirects
        const listenerPromise = App.addListener("appUrlOpen", ({ url }) => {
          handleAuthUrl(url);
        });

        // Check if app was cold-launched via deep link
        App.getLaunchUrl()
          .then((launchUrl) => {
            if (launchUrl?.url) {
              handleAuthUrl(launchUrl.url);
            }
          })
          .catch(() => {});

        cleanup = () => {
          listenerPromise.then((handle) => handle.remove()).catch(() => {});
        };
      })
      .catch(() => {});

    return () => {
      cleanup?.();
    };
  }, []);

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0A1108] text-white">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-base font-semibold text-white">Signing you in...</p>
        <p className="text-xs text-neutral-400 mt-1">Please wait a moment</p>
      </div>
    );
  }

  return null;
}
