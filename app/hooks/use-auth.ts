"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/services/supabase/client";
import { isNativePlatform } from "@/lib/capacitor/bridge";

import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// In-flight promise map and cache across hook instances to deduplicate profile requests
const inFlightProfiles = new Map<string, Promise<Profile | null>>();
let cachedProfile: Profile | null = null;
let cachedUserId: string | null = null;
let isNativeOAuthInProgress = false;


async function fetchProfileDeduped(
  supabase: SupabaseClient<Database>,
  userId: string,
  authUser?: User | null,
  force = false
): Promise<Profile | null> {
  const store = useAuthStore.getState();

  // Return cached profile if already loaded for this user and not forcing refresh
  if (!force && cachedUserId === userId && cachedProfile) {
    store.setUser(cachedProfile);
    return cachedProfile;
  }

  // Deduplicate concurrent requests for the same userId
  if (inFlightProfiles.has(userId)) {
    const existing = await inFlightProfiles.get(userId);
    if (existing) {
      store.setUser(existing);
    }
    return existing ?? null;
  }

  const fetchPromise = (async () => {
    try {
      // 1. First attempt: immediate query
      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!profileErr && data) {
        const confirmed = data as Profile;
        cachedProfile = confirmed;
        cachedUserId = userId;
        store.setUser(confirmed);
        return confirmed;
      }

      // 2. If row not found yet (trigger handle_new_user latency), set pendingProfile
      if (authUser) {
        store.setPendingProfile({
          id: authUser.id,
          email: authUser.email,
          display_name:
            authUser.user_metadata?.name ||
            authUser.user_metadata?.display_name ||
            "",
        });
      }

      // 3. Non-blocking background reconciliation retries for trigger latency
      const retryDelays = [300, 800, 1500];
      for (const delay of retryDelays) {
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Abort if session was terminated in the meantime
        if (!useAuthStore.getState().session) {
          return null;
        }

        const { data: retryData, error: retryErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (!retryErr && retryData) {
          const confirmed = retryData as Profile;
          cachedProfile = confirmed;
          cachedUserId = userId;
          store.setUser(confirmed);
          return confirmed;
        }
      }

      return null;
    } catch (err) {
      console.warn("Error loading user profile:", err);
      return null;
    } finally {
      inFlightProfiles.delete(userId);
    }
  })();

  inFlightProfiles.set(userId, fetchPromise);
  return fetchPromise;
}

// Global listener ref-counting to ensure only 1 active onAuthStateChange subscription
let activeListenerCount = 0;
let authSubscription: { unsubscribe: () => void } | null = null;

function setupAuthListener(supabase: SupabaseClient<Database>) {
  if (authSubscription) return;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState();
    try {
      store.setSession(session);
      if (session?.user) {
        await fetchProfileDeduped(supabase, session.user.id, session.user);
      } else {
        store.setUser(null);
      }
    } catch (err) {
      console.warn("Auth state change error:", err);
    } finally {
      store.setLoading(false);
    }
  });

  authSubscription = subscription;
}

function teardownAuthListener() {
  if (activeListenerCount <= 0 && authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
    activeListenerCount = 0;
  }
}

export function useAuth() {
  const supabase = createClient();
  const {
    user,
    pendingProfile,
    isProfilePending,
    session,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    signOut,
  } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string, authUser?: User | null, force = false) => {
      return fetchProfileDeduped(supabase, userId, authUser, force);
    },
    [supabase],
  );

  useEffect(() => {
    activeListenerCount++;
    setupAuthListener(supabase);

    return () => {
      activeListenerCount--;
      if (activeListenerCount <= 0) {
        teardownAuthListener();
      }
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
    if (data?.session) {
      useAuthStore.getState().setSession(data.session);
      if (data.user) {
        loadProfile(data.user.id, data.user);
      }
    }
    return { success: true, error: undefined };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (err) {
        setError(err.message);
        return {
          success: false,
          error: err.message,
          session: null,
          requiresConfirmation: false,
        };
      }

      const session = data?.session ?? null;
      const authUser = data?.user ?? null;
      const requiresConfirmation = !session && !!authUser;

      if (session) {
        useAuthStore.getState().setSession(session);
        if (authUser) {
          useAuthStore.getState().setPendingProfile({
            id: authUser.id,
            email: authUser.email,
            display_name: name.trim(),
          });
          // Non-blocking load and trigger reconciliation
          loadProfile(authUser.id, authUser);
        }
      }

      return {
        success: true,
        session,
        user: authUser,
        requiresConfirmation,
        error: undefined,
      };
    } catch (err: any) {
      const msg = err?.message || "Failed to sign up";
      setError(msg);
      return {
        success: false,
        error: msg,
        session: null,
        requiresConfirmation: false,
      };
    }
  };

  const signInWithGoogle = async (redirect?: string) => {
    if (isNativePlatform()) {
      if (isNativeOAuthInProgress) return;
      isNativeOAuthInProgress = true;

      try {
        const callbackUrl = "com.grindlog.app://auth/callback";

        const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
            skipBrowserRedirect: true,
          },
        });

        if (oauthErr) {
          isNativeOAuthInProgress = false;
          setError(oauthErr.message);
          return;
        }

        if (data?.url) {
          const { Browser } = await import("@capacitor/browser");

          const finishedListener = await Browser.addListener("browserFinished", () => {
            isNativeOAuthInProgress = false;
            finishedListener.remove();
          });

          await Browser.open({
            url: data.url,
            toolbarColor: "#0A1108",
          });
        } else {
          isNativeOAuthInProgress = false;
        }
      } catch (err: any) {
        isNativeOAuthInProgress = false;
        setError(err?.message || "Failed to start Google sign-in");
      }
      return;
    }


    let callbackUrl = `${location.origin}/auth/callback`;
    if (redirect) {
      callbackUrl += `?redirect=${encodeURIComponent(redirect)}`;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  };


  const signOutUser = async () => {
    await supabase.auth.signOut();
    cachedProfile = null;
    cachedUserId = null;
    inFlightProfiles.clear();
    signOut();
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }
      return { success: true, error: undefined };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updatePassword = async (password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    return { success: !err, error: err?.message };
  };

  return {
    user,
    pendingProfile,
    isProfilePending,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    resetPassword,
    updatePassword,
    setUser,
    loadProfile,
  };
}
