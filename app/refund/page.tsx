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

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">2. 7-Day Money Back Guarantee</h2>
        <p className="mt-4 leading-relaxed">
          We want you to be completely satisfied with GrindLog Premium. We offer a 7-day money-back guarantee for first-time subscribers. If you decide the premium features aren't right for you within the first 7 days of your initial purchase, you may request a full refund.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">3. Subscription Cancellations</h2>
        <p className="mt-4 leading-relaxed">
          You can cancel your subscription at any time to prevent future billing. Cancellation will take effect at the end of your current billing cycle. You will retain access to premium features until that cycle concludes. We do not provide prorated refunds for mid-cycle cancellations.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">4. Processing Refunds</h2>
        <p className="mt-4 leading-relaxed">
          Approved refunds will be processed and credited back to your original payment method. Depending on your financial institution, it may take 5 to 10 business days for the funds to appear on your statement.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">5. How to Request a Refund</h2>
        <p className="mt-4 leading-relaxed">
          To request a refund within the eligible 7-day window, or if you believe you were charged in error, please contact us at support@grindlog.app with your account email and purchase receipt.
        </p>
      </motion.div>
    </div>
  );
}
