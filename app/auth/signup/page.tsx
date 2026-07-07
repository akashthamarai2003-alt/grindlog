"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sprout,
} from "lucide-react";
import { springs } from "@/animations/springs";
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
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-primary)] safe-top">
      <div className="flex items-center px-4 pt-2">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.default}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Create Account
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)]">
            Start your growth journey today.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.1 }}
        >
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-tertiary)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0078D4">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
            Microsoft
          </button>
        </motion.div>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--color-bg-tertiary)]" />
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-bg-tertiary)]" />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-[var(--color-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-error)]"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.2 }}
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 w-full rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] pl-11 pr-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors focus:border-[var(--color-accent-green)] focus:bg-[var(--color-bg-primary)]"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] pl-11 pr-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors focus:border-[var(--color-accent-green)] focus:bg-[var(--color-bg-primary)]"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12 w-full rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] pl-11 pr-11 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-colors focus:border-[var(--color-accent-green)] focus:bg-[var(--color-bg-primary)]"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              ) : (
                <Eye className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              )}
            </button>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 transition-all hover:brightness-105 disabled:opacity-50"
          >
            {isLoading ? (
              <motion.div
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                Create Account
                <Sprout className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-tertiary)]">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>

      <div className="px-6 pb-8 safe-bottom text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-semibold text-[var(--color-accent-green)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
