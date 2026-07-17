"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { springs } from "@/animations/springs";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-primary)] px-6 pb-20 pt-8 safe-top">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/profile">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </motion.button>
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
          Refund Policy
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="prose prose-invert max-w-none text-[var(--color-text-secondary)]"
      >
        <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">1. Digital Goods</h2>
        <p className="mt-4 leading-relaxed">
          GrindLog offers digital subscriptions and in-app premium features. Due to the nature of digital goods and immediate access to premium features upon purchase, our products are generally non-refundable unless required by law.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">2. No Refunds</h2>
        <p className="mt-4 leading-relaxed">
          The amount is strictly non-refundable. We do not offer a money-back guarantee. If any issues come up with the app or your account, please reach out to us and we will fix it shortly.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">3. Subscription Cancellations</h2>
        <p className="mt-4 leading-relaxed">
          Subscriptions cannot be cancelled once processed. We do not provide any refunds for subscriptions. If you encounter any issues with your subscription or the app, we will fix it shortly.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">4. Exceptions</h2>
        <p className="mt-4 leading-relaxed">
          Refunds will only be issued in rare cases where required by law or in the event of an accidental duplicate charge. Approved refunds will be processed and credited back to your original payment method within 5 to 10 business days.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">5. How to Report an Issue</h2>
        <p className="mt-4 leading-relaxed">
          If you are experiencing any technical issues, or if you believe you were charged in error, please contact us at support@grindlog.in with your account email and purchase receipt. Our team will work to resolve the issue as quickly as possible.
        </p>
      </motion.div>
    </div>
  );
}
