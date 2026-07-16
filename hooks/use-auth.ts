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
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUser(data as Profile);
      }
    },
    [supabase, setUser],
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
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

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  const resetPassword = async (email: string) => {
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    });
    if (err) setError(err.message);
    return { success: !err, error: err?.message };
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
