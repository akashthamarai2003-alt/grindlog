"use client";

import { motion } from "motion/react";
import { ArrowLeft, BellOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
          Notifications
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-20">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-20 w-20 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-6 text-[var(--color-text-tertiary)]"
        >
          <BellOff className="h-8 w-8" strokeWidth={2} />
        </motion.div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">No new notifications</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-center max-w-[250px]">
          You're all caught up! Check back later for updates on your habits and achievements.
        </p>
        
        <Link href="/dashboard">
          <button className="mt-8 rounded-full bg-[var(--color-bg-secondary)] px-6 py-3 text-sm font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
