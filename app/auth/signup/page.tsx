"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Eye, EyeOff, Mail, Lock } from "lucide-react";
import bgImage from "../../../public/login-page.png";
import { useAuth } from "@/hooks/use-auth";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await signUp(form.email, form.password, form.name);
    setIsLoading(false);
    if (success) {
      router.push("/onboarding/ai-plan");
    } else {
      setError(authError || "Failed to create account");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center relative px-4 overflow-hidden py-10">
      <Image 
        src={bgImage}
        alt="Background Landscape"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/20 z-0" /> {/* Slight dark overlay for readability */}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-[24px] border border-white/40 bg-white/10 p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Sign Up
        </h1>
        <p className="text-sm font-medium text-white/90 mb-8">
          Start your growth journey today
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm font-medium text-white"
          >
            {error}
          </motion.div>
        )}

        <div className="mb-6">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/20 border border-white/40 py-3 text-sm font-bold text-white transition-colors hover:bg-white/30"
          >
            <svg className="h-5 w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/30" />
          <span className="text-xs font-medium text-white/70">or</span>
          <div className="h-px flex-1 bg-white/30" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 w-full rounded-xl border border-white/50 bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors focus:border-white focus:bg-white/10"
              required
            />
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" strokeWidth={1.5} />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-white/50 bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors focus:border-white focus:bg-white/10"
              required
            />
            <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" strokeWidth={1.5} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            disabled={isLoading}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#34C759] text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 disabled:opacity-50 border border-white/20"
          >
            {isLoading ? (
              <motion.div
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-white/70">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
        </p>

        <div className="mt-6 text-center">
          <p className="text-[13px] font-medium text-white/90">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-bold text-white hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
