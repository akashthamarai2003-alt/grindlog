"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Eye, EyeOff, Check } from "lucide-react";
import bgImage from "../../../public/login-page.png";
import { useAuth } from "@/hooks/use-auth";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await signIn(form.email, form.password);
    setIsLoading(false);
    if (success) {
      router.push("/dashboard");
    } else {
      setError(authError || "Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center relative px-4 overflow-hidden">
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
          Login
        </h1>
        <p className="text-sm font-medium text-white/90 mb-8">
          Welcome back please login to your account
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type="email"
              placeholder="User Name"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-white/50 bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors focus:border-white focus:bg-white/10"
              required
            />
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" strokeWidth={1.5} />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-12 w-full rounded-xl border border-white/50 bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors focus:border-white focus:bg-white/10"
              required
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

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`flex h-[18px] w-[18px] items-center justify-center rounded bg-white/30 border ${
                rememberMe ? "border-transparent" : "border-white/50"
              } transition-colors`}
            >
              {rememberMe && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>
            <span className="text-sm font-medium text-white">Remember me</span>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#8eb544] to-[#6a8731] text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 disabled:opacity-50 border border-white/20"
          >
            {isLoading ? (
              <motion.div
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[13px] font-medium text-white/90">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-white hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
