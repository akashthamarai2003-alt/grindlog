"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { format, addDays } from "date-fns";
import {
  ChevronLeft,
  ShieldCheck,
  Zap,
  Calendar,
  CreditCard,
  ArrowRight,
  Check,
  Sparkles,
  AlertTriangle,
  Receipt,
  Lock,
  ExternalLink,
  Flame,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { FitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/payment";

interface PaymentRecord {
  id: string;
  plan: string;
  amount: number;
  status: string;
  paymentId: string;
  date: string;
  expiresAt?: string | null;
}

interface BillingManagementClientProps {
  subscriptionState: FitnessSubscriptionState;
  paymentHistory: PaymentRecord[];
  proPrice: number;
  corePrice: number;
  userEmail?: string;
  userName?: string;
}

export function BillingManagementClient({
  subscriptionState,
  paymentHistory = [],
  proPrice = 99,
  corePrice = 10,
  userEmail,
  userName,
}: BillingManagementClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    status,
    plan,
    daysRemaining,
    isGracePeriod,
    graceHoursRemaining,
    isExpired,
    expiresAt,
  } = subscriptionState;

  const isPro = plan?.id === "pro";
  const isCore = plan?.id === "starter" || plan?.id === "core";
  const isActive = status === "active" || isGracePeriod;

  // Formatted dates
  const expiryDateFormatted = expiresAt
    ? format(new Date(expiresAt), "dd MMMM yyyy")
    : null;

  // Calculate prospective new expiry date if user extends today (+30 days)
  const prospectiveBaseDate = expiresAt && new Date(expiresAt).getTime() > Date.now()
    ? new Date(expiresAt)
    : new Date();
  const prospectiveNewExpiry = format(addDays(prospectiveBaseDate, 30), "dd MMMM yyyy");

  const handleExtendOrUpgrade = async (targetLevel: "core" | "pro") => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error("Payment gateway is loading. Please try again in a few seconds.");
      }

      const orderResponse = await createRazorpayOrder(
        "monthly",
        targetLevel,
        undefined,
        "fitness_os"
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || "Failed to initiate payment");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResponse.amount,
        currency: orderResponse.currency || "INR",
        name: "Fitness AI OS",
        description: targetLevel === "pro" 
          ? `Fitness OS Pro (+30 Days)` 
          : `Fitness OS Core (+30 Days)`,
        order_id: orderResponse.orderId,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            const verifyRes = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              "monthly",
              targetLevel,
              undefined,
              false,
              "fitness_os"
            );

            if (verifyRes.success) {
              setSuccessMessage("Payment successful! 30 days added onto your subscription.");
              setTimeout(() => {
                window.location.reload();
              }, 1200);
            } else {
              throw new Error(verifyRes.error || "Payment verification failed.");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setErrorMessage(err.message || "Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userName || "Fitness OS Athlete",
          email: userEmail || "",
        },
        theme: {
          color: "#ADFF00",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setErrorMessage(response.error?.description || "Payment was cancelled or failed.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-[#060D06] text-white pb-24">
        {/* Top Header */}
        <div className="sticky top-0 z-30 bg-[#060D06]/90 backdrop-blur-md border-b border-white/5 px-4 py-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black tracking-wide text-white uppercase">
              Billing & Membership
            </h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
          {/* Notifications / Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/40 text-[#ADFF00] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Membership Status Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#ADFF00]/30 bg-gradient-to-br from-[#121E12] via-[#0D170D] to-[#121E12] p-6 shadow-[0_0_40px_rgba(173,255,0,0.1)]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {isActive ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#ADFF00] text-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      Active Membership
                    </span>
                  ) : isGracePeriod ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2.5 py-0.5 rounded-full">
                      Grace Period ({graceHoursRemaining}h left)
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gray-700 text-gray-300 px-2.5 py-0.5 rounded-full">
                      Expired
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {isPro ? "Fitness OS Pro" : isCore ? "Fitness OS Core" : "Free Athlete"}
                  {isPro && <Flame className="w-5 h-5 text-[#ADFF00]" />}
                </h2>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-gray-400 font-medium">Locked Rate</div>
                <div className="text-xl font-black text-[#ADFF00]">
                  ₹{isPro ? proPrice : corePrice}
                  <span className="text-xs text-gray-400 font-normal">/mo</span>
                </div>
              </div>
            </div>

            {/* Validity Timeline */}
            <div className="p-4 rounded-2xl bg-[#081008] border border-white/5 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#ADFF00]" />
                  <span>Valid Until</span>
                </span>
                <span className="font-bold text-white">
                  {expiryDateFormatted || "No active period"}
                </span>
              </div>

              {isActive && daysRemaining > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Time Remaining</span>
                  </span>
                  <span className="font-black text-[#ADFF00]">
                    {daysRemaining} {daysRemaining === 1 ? "Day" : "Days"} Left
                  </span>
                </div>
              )}
            </div>

            {/* Price Lock Guarantee Pill */}
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
              <Lock className="w-3.5 h-3.5 text-[#ADFF00] shrink-0" />
              <span className="text-[11px] leading-tight">
                <strong>Lifetime Price Lock Active:</strong> Your ₹{isPro ? proPrice : corePrice}/mo rate is guaranteed on every renewal.
              </span>
            </div>
          </div>

          {/* 2. Self-Serve Renewal / Extension Action */}
          <div className="p-5 rounded-3xl bg-[#111A10] border border-white/10 space-y-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ADFF00]" />
                  <span>Extend Subscription (+30 Days)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Renew ahead of time to maintain your streak. 30 days are automatically stacked onto your remaining days (new expiry: <strong className="text-white">{prospectiveNewExpiry}</strong>).
                </p>
              </div>
            </div>

            {isCore ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleExtendOrUpgrade("pro")}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#ADFF00] hover:bg-[#bbfb2e] text-black font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.25)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Upgrade to Pro — ₹{proPrice}/mo 🚀</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleExtendOrUpgrade("core")}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Renew Core Only (+30 Days) for ₹{corePrice}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleExtendOrUpgrade("pro")}
                disabled={isProcessing}
                className="w-full py-4 bg-[#ADFF00] hover:bg-[#bbfb2e] text-black font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing with Razorpay...
                  </span>
                ) : (
                  <>
                    <span>⚡ 1-Tap Renew Next Month (+30 Days) — ₹{proPrice}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#ADFF00]" /> 1-Tap UPI (GPay/PhonePe)
              </span>
              <span>•</span>
              <span>No Hidden Autopay Mandates</span>
              <span>•</span>
              <span>Zero Lost Days Guarantee</span>
            </div>
          </div>

          {/* 3. Included Pro Entitlements Checklist */}
          <div className="p-5 rounded-3xl bg-[#0E160E] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Features Included in Your Plan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: "20 Daily AI Generations", desc: "Full daily meal & workout adjustments", active: isPro },
                { title: "Progressive Overload Mesocycle", desc: "Phase recalibration every 4 weeks", active: true },
                { title: "PG/Home Grocery Shopping Haul", desc: "Tailored natural high-protein add-ons", active: isPro },
                { title: "Injury & Recovery Swaps", desc: "Real-time alternative movements", active: true },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#081008] border border-white/5 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[#ADFF00]/15 flex items-center justify-center text-[#ADFF00] shrink-0 mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{feat.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Payment History / Receipts */}
          <div className="p-5 rounded-3xl bg-[#0E160E] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-[#ADFF00]" />
                <span>Payment & Receipt History</span>
              </h4>
              <span className="text-[10px] text-gray-400">100% Tax Compliant</span>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No past transactions found on this account.
              </div>
            ) : (
              <div className="space-y-2">
                {paymentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#081008] border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#ADFF00] shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white capitalize">
                          {item.plan.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {format(new Date(item.date), "dd MMM yyyy, hh:mm a")} • ID: {item.paymentId ? `${item.paymentId.substring(0, 14)}...` : "Direct"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-white">
                        ₹{item.amount || (item.plan.includes("pro") ? proPrice : corePrice)}
                      </div>
                      <span className="text-[9px] font-black uppercase text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded-md">
                        {item.status || "Paid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Support & Security Footer */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-[11px]">256-Bit SSL Encrypted by Razorpay</span>
            </div>
            <Link
              href="/support"
              className="text-[11px] text-[#ADFF00] hover:underline flex items-center gap-1 font-bold"
            >
              <span>Contact Support Desk →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
