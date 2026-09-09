"use client";

import { ArrowLeft, AlertTriangle, ShieldCheck, HeartPulse, Scale, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms & Conditions
            </h1>
            <p className="text-xs text-[#ADFF00] font-bold tracking-wider uppercase mt-0.5">
              GrindLog AI Fitness OS
            </p>
          </div>
        </div>

        {/* CRITICAL HEALTH & MEDICAL WARNING ALERT BOX */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-8 flex items-start gap-4 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <HeartPulse size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide mb-1">
              Important: Medical & Physical Health Disclaimer
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              GrindLog is NOT a medical organization, healthcare provider, or clinical dietitian. All AI workouts, exercise splits, nutrition calculations, and fitness suggestions are for informational and self-improvement purposes only. Consult a licensed physician before beginning any workout or diet program.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          {/* Section 1: Acceptance */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">1.</span> Acceptance of Terms & Eligibility
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              By accessing, downloading, or using GrindLog ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree with these terms, you must immediately discontinue using the application.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              You must be at least <strong className="text-white">16 years of age</strong> to use GrindLog. If you are under 18, you represent that you have received consent from a parent or legal guardian to engage in physical exercise and use the platform.
            </p>
          </div>

          {/* Section 2: Comprehensive Health & Physical Risk Disclaimer */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">2.</span> Health, Medical, & Physical Injury Disclaimer
            </h2>
            <div className="space-y-3 text-xs text-gray-400">
              <p>
                <strong className="text-white">A. Not Medical Advice:</strong> GrindLog provides algorithmic, artificial intelligence-assisted workout planning, exercise tracking, and nutritional estimations. GrindLog does not provide medical advice, diagnosis, treatment, or clinical rehabilitation. The content is not intended to be a substitute for professional medical advice.
              </p>
              <p>
                <strong className="text-white">B. Mandatory Physician Consultation:</strong> You must consult a qualified healthcare provider before beginning any resistance training, cardiovascular exercise, or nutritional regimen, especially if you have pre-existing conditions, including but not limited to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-[#1A2619]/60 border border-white/5 text-[11px] text-gray-300">
                <span>• Cardiovascular disease / chest pain</span>
                <span>• High blood pressure (Hypertension)</span>
                <span>• Joint, tendon, or ligament injuries</span>
                <span>• Spinal conditions or herniated discs</span>
                <span>• Asthma or respiratory limitations</span>
                <span>• Chronic illness, diabetes, or surgery history</span>
                <span>• Pregnancy or postpartum recovery</span>
                <span>• History of fainting, dizziness, or seizures</span>
              </div>
              <p>
                <strong className="text-white">C. Assumption of Physical Risk:</strong> Strenuous physical exercise, weightlifting, resistance machines, bodyweight movements, and dietary caloric deficits/surpluses carry inherent risks of bodily injury, including muscle strains, ligament tears, bone fractures, cardiac events, and in severe instances, permanent disability or death. By participating in exercises or routines tracked via GrindLog, <strong className="text-white">you voluntarily and knowingly assume all risks of injury, harm, or damage</strong>.
              </p>
              <p>
                <strong className="text-white">D. Pain & Immediate Cessation:</strong> You agree to listen to your body at all times. If you experience pain, dizziness, lightheadedness, nausea, shortness of breath, joint clicking with pain, or any discomfort during exercise, you must <strong className="text-white">STOP IMMEDIATELY</strong> and seek qualified medical attention.
              </p>
              <p>
                <strong className="text-white">E. Accuracy of Declared Limitations:</strong> You are solely responsible for accurately declaring your physical problems, previous injuries, current pain areas, and exercise limitations during onboarding. GrindLog's AI adapts exercise selection based on your self-reported data, but cannot physically inspect your biomechanics, mobility, or training execution.
              </p>
              <p>
                <strong className="text-white">F. Form, Environment, & Equipment Safety:</strong> You are solely responsible for using proper lifting form, warming up adequately, using safety collars and spotters, and exercising in a secure and suitable environment.
              </p>
            </div>
          </div>

          {/* Section 3: Subscriptions & Strict Non-Refundable Policy */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">3.</span> Subscriptions, Billing, & Strictly Non-Refundable Policy
            </h2>
            <div className="space-y-2.5 text-xs text-gray-400">
              <p>
                • <strong className="text-white">Access Plans:</strong> GrindLog provides monthly subscription tiers (including Core and Pro passes). Subscriptions unlock personalized AI workout splits, macro targets, and workout logging tools.
              </p>
              <p>
                • <strong className="text-white">Manual 1-Tap Renewal:</strong> We do not enforce unannounced bank auto-debits. Subscriptions operate on a transparent manual renewal system where you actively confirm each 30-day billing cycle.
              </p>
              <p>
                • <strong className="text-white">48-Hour Grace Period:</strong> Active members who reach the end of their 30-day billing cycle receive a 48-hour grace period to log workouts while renewing their pass.
              </p>
              <p>
                • <strong className="text-white">Strictly Non-Refundable:</strong> All purchases made on GrindLog are <strong className="text-white">100% non-refundable</strong>. Once digital access is provisioned upon payment confirmation via Razorpay, no refunds, cancellations, chargebacks, or prorated credits will be issued under any circumstances, including personal health issues, disuse, or lack of gym access.
              </p>
              <p>
                For complete details, please read our dedicated <Link href="/refund" className="text-[#ADFF00] underline font-bold">Refund Policy</Link>.
              </p>
            </div>
          </div>

          {/* Section 4: User Accounts & Intellectual Property */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">4.</span> Accounts & Intellectual Property
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              You are responsible for maintaining the confidentiality of your login credentials. You may not share, sell, or rent access to your account.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              All proprietary algorithms, AI training prompts, exercise databases, user interfaces, branding, and source code are the exclusive intellectual property of GrindLog. You agree not to reverse engineer, scrape, copy, or redistribute any portion of the platform without prior written authorization.
            </p>
          </div>

          {/* Section 5: Limitation of Liability */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">5.</span> Complete Limitation of Liability & Waiver
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-2">
              To the maximum extent permitted by applicable law, GrindLog, its founders, developers, officers, contractors, and partners shall NOT be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-400 list-disc pl-5">
              <li>Physical injury, bodily harm, illness, pain, or death resulting from the execution of workouts, weight lifting, or nutritional guidance.</li>
              <li>Damages resulting from reliance on any information, calories, macros, or AI advice generated by the platform.</li>
              <li>Damage to equipment, facilities, personal property, or third-party liabilities during exercise.</li>
              <li>Any interruptions, downtime, data loss, or technical malfunctions of the software.</li>
            </ul>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              You expressly agree to indemnify, defend, and hold harmless GrindLog and its creators from any claims, suits, losses, or legal liabilities arising from your use of the application.
            </p>
          </div>

          {/* Section 6: Governing Law */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">6.</span> Governing Law & Jurisdiction
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              These Terms & Conditions are governed by and construed in accordance with the laws of the <strong className="text-white">Republic of India</strong>. Any disputes, controversies, or claims arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">Tamil Nadu, India</strong>.
            </p>
          </div>

          {/* Section 7: Support & Contact */}
          <div className="p-5 rounded-2xl bg-[#121E12] border border-[#1A2619]">
            <h2 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <span className="text-[#ADFF00]">7.</span> Contact & Customer Support
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              If you have any questions regarding these Terms & Conditions or need assistance with your account, reach out to us:
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
                <span>Support Desk →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GrindLog. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
