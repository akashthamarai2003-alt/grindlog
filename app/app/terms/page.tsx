"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { springs } from "@/animations/springs";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-primary)] px-6 pb-20 pt-8 safe-top">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </motion.button>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
          Terms & Conditions
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="prose prose-invert max-w-none text-[var(--color-text-secondary)]"
      >
        <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">1. Acceptance of Terms</h2>
        <p className="mt-4 leading-relaxed">
          By creating an account and using GrindLog, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue your use of the application immediately.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">2. User Accounts</h2>
        <p className="mt-4 leading-relaxed">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We reserve the right to suspend or terminate accounts that violate our terms.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">3. Acceptable Use</h2>
        <p className="mt-4 leading-relaxed">
          GrindLog is intended for personal habit tracking, productivity, and self-improvement. You agree not to use the app for any illegal or unauthorized purpose. You must not attempt to hack, destabilize, or exploit the platform, or transmit any malware or destructive code.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">4. Premium Subscriptions</h2>
        <p className="mt-4 leading-relaxed">
          Some features of GrindLog are offered as a premium subscription ("GrindLog Premium"). By opting into a premium subscription, you agree to pay the applicable fees. Subscriptions automatically renew unless canceled prior to the renewal date. Prices are subject to change with prior notice.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">5. Intellectual Property</h2>
        <p className="mt-4 leading-relaxed">
          All original content, features, designs, and functionality are owned by GrindLog and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our intellectual property without explicit permission.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">6. Limitation of Liability</h2>
        <p className="mt-4 leading-relaxed">
          GrindLog is provided "as is" and "as available". We do not guarantee that the app will be completely free of errors, uninterrupted, or perfectly secure. We shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the application.
        </p>
      </motion.div>
    </div>
  );
}
