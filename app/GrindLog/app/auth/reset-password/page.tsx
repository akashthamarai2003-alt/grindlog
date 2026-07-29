"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import bgImage from "../../../public/login-page.png";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/services/supabase/client";
import { useEffect } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase SSR uses PKCE by default and ignores implicit flow (hash) tokens.
    // Since our custom Resend reset link uses generateLink (implicit flow),
    // we need to manually extract the tokens from the URL hash and set the session.
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (error) {
            console.error("Failed to set session from hash:", error);
            setError("Session expired or invalid. Please request a new link.");
          } else {
            // Clean up the URL hash so it's not visible/copied
            window.history.replaceState(null, "", window.location.pathname);
          }
        });
      }
    }
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const result = await updatePassword(password);
    setIsLoading(false);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to update password");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center relative px-4 py-8 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <Image 
          src={bgImage}
          alt="Background Landscape"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Slight dark overlay for readability */}
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-[24px] border border-white/40 bg-white/10 p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Update Password
        </h1>
        <p className="text-sm font-medium text-white/90 mb-8">
          Enter your new password below.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm font-medium text-white"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/50 bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors focus:border-white focus:bg-white/10"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/80" strokeWidth={1.5} />
              ) : (
                <Eye className="h-5 w-5 text-white/80" strokeWidth={1.5} />
              )}
            </button>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={isLoading || !password}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#34C759] text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 disabled:opacity-50 border border-white/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <span>Updating...</span>
              </div>
            ) : (
              "Update Password"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
