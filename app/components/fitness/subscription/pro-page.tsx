"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FitnessPlanConfig } from "@/lib/fitness/subscription/types";
import { PricingCard } from "./pricing-card";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface ProPageClientProps {
  plans: Record<string, FitnessPlanConfig>;
  activePlanId?: string | null;
}

export function ProPageClient({ plans, activePlanId }: ProPageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create Checkout
      const checkoutRes = await fetch("/api/fitness-ai/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId })
      });
      const order = await checkoutRes.json();

      if (!checkoutRes.ok) throw new Error(order.error || "Checkout failed");

      // 2. Mock payment verification if server is missing Razorpay keys
      if (order.mock) {
        const verifyRes = await fetch("/api/fitness-ai/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isMock: true })
        });
        
        if (!verifyRes.ok) throw new Error("Mock verification failed");
        
        router.refresh();
        router.push("/");
        return;
      }

      // 3. Real Razorpay Integration
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Fitness AI OS",
        description: `Upgrade to ${plans[planId].name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/fitness-ai/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              router.refresh();
              router.push("/");
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (e) {
            setError("Error verifying payment.");
          }
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <div className="flex-1 text-center pr-8">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h1 className="font-bold text-gray-900 text-[17px]">Plans & Upgrades</h1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-8 pb-10 flex flex-col gap-6 w-full max-w-md mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Unlock Your Potential</h2>
          <p className="text-[15px] text-gray-500 font-medium">Choose the plan that fits your goals.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm font-medium p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <PricingCard 
          plan={plans.starter} 
          isActive={activePlanId === "starter"} 
          onUpgrade={handleUpgrade} 
        />
        
        <PricingCard 
          plan={plans.pro} 
          isActive={activePlanId === "pro"} 
          onUpgrade={handleUpgrade} 
          isPopular
        />
      </div>
    </div>
  );
}
