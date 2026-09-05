"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AIPlanAnimation } from "@/components/fitness/plan-animation";
import { checkUserPremiumStatusAction } from "@/app/actions/payment";

export function GeneratePlanButton() {
  const router = useRouter();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkUserPremiumStatusAction(undefined, undefined, "fitness_os").then((res) => {
      setIsSubscribed(Boolean(res));
    });
  }, []);

  const handleClick = () => {
    if (isPreparing) return;
    setIsPreparing(true);
  };

  const handleAnimationComplete = () => {
    if (isSubscribed) {
      router.push("/plan-setup");
    } else {
      router.push("/payment?returnTo=/plan-setup&intent=generate_plan");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPreparing}
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ADFF00] py-4 text-lg font-extrabold text-black shadow-[0_0_30px_rgba(173,255,0,0.35)] transition-transform hover:bg-[#c4ff33] active:scale-[0.98] disabled:cursor-wait disabled:opacity-90"
      >
        <span className="relative flex items-center gap-2">
          {isPreparing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Preparing your personalized plan…
            </>
          ) : (
            <>
              Generate My Plan
              <ArrowRight size={20} />
            </>
          )}
        </span>
      </button>

      {isPreparing && (
        <AIPlanAnimation
          isReady={true}
          minDurationMs={12000}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </>
  );
}
