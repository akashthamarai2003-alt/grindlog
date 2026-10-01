"use client";

import { useState, use } from "react";
import { LokiProActivation } from "@/components/fitness/payment/loki-pro-activation";

export default function TestPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ celebrate?: string; plan?: string }>;
}) {
  const params = use(searchParams);
  const shouldCelebrate = params.celebrate !== "0";
  const plan = params.plan || "pro";
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-[#ADFF00]">Celebration Completed!</h1>
        <p className="text-sm text-gray-400 mt-2">Redirected to /plan-setup?success=true</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1108] text-white p-6">
      <h1 className="text-xl font-bold">Payment Test Bed</h1>
      {shouldCelebrate && (
        <LokiProActivation
          onComplete={() => setCompleted(true)}
          planName={plan}
          orderId="order_test_12345"
        />
      )}
    </div>
  );
}
