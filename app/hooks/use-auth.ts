"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/services/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types";

export function useAuth() {
  const supabase = createClient();
  const { user, isAuthenticated, isLoading, setUser, setLoading, signOut } =
    useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileErr) {
          console.warn("Failed to load user profile:", profileErr.message);
          return;
        }

        if (data) {
          setUser(data as Profile);
        }
      } catch (err) {
        console.warn("Error loading user profile:", err);
      }
    },
    [supabase, setUser],
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile, setUser, setLoading]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) setError(err.message);
    return { success: !err, error: err?.message };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (err) setError(err.message);
    return { success: !err, error: err?.message };
  };

  const signInWithGoogle = async (redirect?: string) => {
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
  };
}
