"use client";

import { ArrowLeft, ShieldAlert, AlertCircle, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60 z-0" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 pt-8 pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#121E12] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Refund Policy
            </h1>
            <p className="text-xs text-[#ADFF00] font-bold tracking-wider uppercase mt-0.5">
              Strictly Non-Refundable Policy
            </p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-300 uppercase tracking-wide mb-1">
              Important: All Purchases Are Final & Non-Refundable
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Due to the immediate digital provisioning of proprietary AI workouts, personalized nutritional calculations, and training software access upon payment, all fees paid for GrindLog memberships are strictly non-refundable.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">1.</span> Immediate Digital Delivery
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              GrindLog provides digital subscription services, including AI workout programming, exercise volume tracking, custom metabolic meal plans, and virtual coach feedback. Because digital software and personalized training protocols are delivered immediately upon transaction verification via Razorpay, <strong className="text-white">our services are consumed immediately upon purchase and cannot be returned</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">2.</span> Strictly Non-Refundable & No Chargebacks
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              We operate under a strict <strong className="text-white">No-Refund Policy</strong>:
            </p>
            <ul className="space-y-2 text-xs text-gray-400 list-disc pl-5">
              <li><strong className="text-white">No Money-Back Guarantee:</strong> We do not offer satisfaction-based refunds, trial reversals, or money-back guarantees.</li>
              <li><strong className="text-white">No Prorated or Partial Refunds:</strong> If you discontinue using the application, uninstall the app, or stop following your training regimen before your 30-day billing cycle concludes, no prorated refunds or credits will be issued for remaining days.</li>
              <li><strong className="text-white">Non-Transferable:</strong> Subscription passes and accounts cannot be transferred, exchanged, or assigned to other individuals.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">3.</span> Health Issues, Injuries, & Medical Conditions
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              We understand that physical health, injuries, and medical conditions can change unpredictably:
            </p>
            <div className="p-3.5 rounded-xl bg-[#1A2619]/50 border border-white/5 space-y-2 text-xs text-gray-300">
              <p>
                • <strong className="text-white">Inability to Exercise:</strong> If you sustain an injury, fall ill, develop a medical condition, or become physically unable to work out or visit the gym, subscription payments remain <strong className="text-white">non-refundable</strong>.
              </p>
              <p>
                • <strong className="text-white">Medical Clearance:</strong> It is solely your responsibility to seek medical clearance from a physician prior to purchasing a plan. GrindLog cannot refund memberships due to pre-existing or newly acquired injuries.
              </p>
              <p>
                • <strong className="text-white">Account Pause Assistance:</strong> In documented medical emergencies, our support team may, at its sole discretion, offer to freeze or adjust your plan dates upon review of medical documentation, but monetary refunds will not be granted.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">4.</span> Manual 1-Tap Renewal Protection
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              GrindLog protects users from hidden recurring auto-debits. We utilize a <strong className="text-white">Manual 1-Tap Renewal</strong> mechanism. You are never automatically charged or debited without your active authorization. When your 30-day membership concludes, you retain complete autonomy to decide whether to renew your pass for Month 2.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">5.</span> Duplicate Technical Charges
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              The only permitted exception is a verified duplicate charge caused by a payment gateway or network error:
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <p>
                If your bank account or UPI was debited multiple times for the <strong className="text-white">exact same billing period</strong> due to a network glitch, notify us within <strong className="text-white">48 hours</strong> of the transaction.
              </p>
              <p>
                Upon verification with Razorpay, the duplicate excess transaction will be reversed back to your original source of payment within <strong className="text-white">5 to 7 business days</strong>.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">6.</span> Official Support Contact
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              If you have any billing questions, encounter technical difficulties with your membership, or require account assistance, our team is here to help:
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="mailto:grindlogapp6@gmail.com"
                className="flex-1 p-3 rounded-xl bg-[#1A2619] border border-white/5 flex items-center gap-2.5 hover:border-[#ADFF00]/40 transition-all text-xs font-bold text-white"
              >
                <Mail size={16} className="text-[#ADFF00]" />
                <span>grindlogapp6@gmail.com</span>
              </a>
              <Link
                href="/support"
                className="flex-1 p-3 rounded-xl bg-[#ADFF00] text-[#0A1108] flex items-center justify-center gap-2 font-black text-xs hover:bg-[#9BE600] active:scale-95 transition-all text-center"
              >
                <span>Open In-App Support Desk →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GrindLog. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
