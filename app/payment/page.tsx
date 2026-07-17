"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { processMockPayment } from "@/app/actions/payment";

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "six_months" | "lifetime">("six_months");
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "₹49",
      period: "per month",
      icon: <Star className="w-5 h-5 text-blue-400" />,
      features: [
        "Unlimited Habits",
        "Only Core Features",
        "Daily Progress Tracking",
        "Standard Reminders",
      ],
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      activeBorder: "border-blue-400",
      badge: null,
    },
    {
      id: "six_months",
      name: "6 Months",
      price: "₹199",
      period: "every 6 months",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      features: [
        "Everything in Core",
        "Advanced AI Features",
        "AI Personalized Habit Plans",
        "Smart Analytics & Insights",
      ],
      color: "from-yellow-500/20 to-orange-500/20",
      borderColor: "border-yellow-500/30",
      activeBorder: "border-yellow-400",
      badge: "Most Popular",
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "₹599",
      period: "one-time payment",
      icon: <Crown className="w-5 h-5 text-purple-400" />,
      features: [
        "All Premium Features",
        "Lifetime Access",
        "Exclusive VIP Themes",
        "Priority Support",
      ],
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      activeBorder: "border-purple-400",
      badge: "Best Value",
    },
  ];

  const handleContinue = async () => {
    setIsProcessing(true);
    const result = await processMockPayment(selectedPlan);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setIsProcessing(false);
      alert("Payment failed: " + result.error);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/80">Unlock Your Full Potential</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Choose Your Grind
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Upgrade to GrindLog Pro and transform your habits with AI-powered insights, unlimited tracking, and exclusive features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? `${plan.activeBorder} shadow-2xl scale-[1.02]` 
                  : `${plan.borderColor} border-transparent bg-white/5 hover:bg-white/10`
              }`}
            >
              {/* Card Background */}
              {selectedPlan === plan.id && (
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-100`} />
              )}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 inset-x-0 flex justify-center">
                  <div className={`px-4 py-1 rounded-b-xl text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r ${plan.color.replace('/20', '').replace('/20', '')}`}>
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative p-6 pt-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                  <span className="text-sm text-white/50">{plan.period}</span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Radio indicator */}
                <div className="mt-auto flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedPlan === plan.id ? plan.activeBorder : "border-white/20"
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className={`w-3 h-3 rounded-full bg-current ${plan.icon.props.className.split(' ')[2]}`} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <button 
            onClick={handleContinue}
            disabled={isProcessing}
            className="group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-white text-black font-semibold text-lg overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue with {plans.find(p => p.id === selectedPlan)?.name}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
            {!isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
