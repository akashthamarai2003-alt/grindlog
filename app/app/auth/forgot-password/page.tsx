"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Mail, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import bgImage from "../../../public/login-page.png";
import { useAuth } from "@/hooks/use-auth";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const cleanEmail = email.trim();
  const isValidEmail = EMAIL_REGEX.test(cleanEmail);
  const showFieldError = touched && cleanEmail.length > 0 && !isValidEmail;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!cleanEmail) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }

    if (cooldown > 0) return;

    setIsLoading(true);
    setError(null);

    const result = await resetPassword(cleanEmail);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setCooldown(60);
    } else if (result.error) {
      const secMatch = result.error.match(/after (\d+) seconds/i);
      if (secMatch) {
        const secs = parseInt(secMatch[1], 10) || 60;
        setCooldown(secs);
        setError(`Reset email already dispatched! For security, please wait before trying again.`);
      } else {
        setError(result.error);
      }
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
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-[24px] border border-white/40 bg-white/10 p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Forgot Password
        </h1>
        <p className="text-sm font-medium text-white/90 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl bg-amber-500/25 border border-amber-500/60 px-4 py-3 text-sm font-medium text-white flex items-start gap-2.5"
          >
            {cooldown > 0 ? (
              <Clock className="h-4 w-4 shrink-0 text-amber-200 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-200 mt-0.5" />
            )}
            <span className="leading-snug">{error}</span>
          </motion.div>
        )}

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-4"
          >
            <CheckCircle2 className="h-16 w-16 text-[#34C759] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              We've sent a password reset link to <br/>
              <span className="font-bold text-white">{cleanEmail}</span>
            </p>
            <Link 
              href="/auth/signin"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#34C759] text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 border border-white/20"
            >
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error && cooldown <= 0) setError(null);
                  }}
                  onBlur={() => setTouched(true)}
                  className={`h-12 w-full rounded-xl border bg-transparent pl-4 pr-11 text-sm font-medium text-white placeholder:text-white/80 outline-none transition-colors ${
                    showFieldError
                      ? "border-red-400 bg-red-500/10 focus:border-red-300"
                      : "border-white/50 focus:border-white focus:bg-white/10"
                  }`}
                  required
                />
                <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" strokeWidth={1.5} />
              </div>
              {showFieldError && (
                <span className="text-xs font-semibold text-red-200 px-1 pt-0.5">
                  Please enter a valid email address (e.g. name@example.com)
                </span>
              )}
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              disabled={isLoading || !cleanEmail || (touched && !isValidEmail) || cooldown > 0}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#34C759] text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:brightness-110 disabled:opacity-50 border border-white/20"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Sending Link...</span>
                </div>
              ) : cooldown > 0 ? (
                `Resend Link (${cooldown}s)`
              ) : (
                "Send Reset Link"
              )}
            </motion.button>

            <div className="mt-2 text-center">
              <p className="text-[13px] font-medium text-white/90">
                Remember your password?{" "}
                <Link href="/auth/signin" className="font-bold text-white hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
