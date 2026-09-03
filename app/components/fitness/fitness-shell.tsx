"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { FitnessChatbot } from "./chatbot/fitness-chatbot";

export function FitnessShell({ children, isPro = false }: { children: React.ReactNode; isPro?: boolean }) {
  const pathname = usePathname();
  
  // Pages that are part of the onboarding/setup flow should NOT have the bottom nav or chatbot
  const isSetupFlow = pathname?.includes("/onboarding") || 
                      pathname?.includes("/report") || 
                      pathname?.includes("/plan-setup") || 
                      pathname?.includes("/roadmap") ||
                      pathname?.includes("/generating") ||
                      pathname?.includes("/payment");

  return (
    <div className="flex justify-center min-h-screen bg-[#0A1108]">
      <div className="w-full min-h-[100dvh] relative flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`flex-1 ${isSetupFlow ? '' : 'pb-24'}`}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        {!isSetupFlow && (
          <>
            {isPro && <FitnessChatbot />}
            <BottomNav isPro={isPro} />
          </>
        )}
      </div>
    </div>
  );
}
