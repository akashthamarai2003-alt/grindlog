"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { springs } from "@/animations/springs";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="prose prose-invert max-w-none text-[var(--color-text-secondary)]"
      >
        <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">1. Information We Collect</h2>
        <p className="mt-4 leading-relaxed">
          At GrindLog, we collect information you provide directly to us when you create an account, update your profile, and use our habit tracking features. This may include your name, email address, profile picture, and the habits, logs, and journals you choose to track.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">2. How We Use Your Information</h2>
        <p className="mt-4 leading-relaxed">
          We use the information we collect to operate, maintain, and provide the features of GrindLog. We also use it to communicate with you, personalize your experience, provide customer support, and understand how users interact with our application to improve our services.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">3. Data Storage and Security</h2>
        <p className="mt-4 leading-relaxed">
          Your data is securely stored using industry-standard encryption protocols. We utilize Supabase for robust database management and authentication. While no service is completely secure, we take significant measures to protect your personal information against unauthorized access or disclosure.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">4. Third-Party Services</h2>
        <p className="mt-4 leading-relaxed">
          We do not sell your personal data to third parties. We may use third-party services (such as Vercel for hosting and Supabase for database management) that assist us in operating our application. These providers only have access to the information necessary to perform their functions and are bound by strict confidentiality agreements.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">5. Your Rights</h2>
        <p className="mt-4 leading-relaxed">
          You have the right to access, update, or delete your personal information at any time. You can manage this directly through the GrindLog app under the Profile settings. If you wish to request a complete deletion of your data, you may use the "Delete Account" button or contact our support team.
        </p>

        <h2 className="mt-8 text-xl font-bold text-[var(--color-text-primary)]">6. Contact Us</h2>
        <p className="mt-4 leading-relaxed">
          If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at support@grindlog.app.
        </p>
      </motion.div>
    </div>
  );
}
