import { Metadata } from "next";
import { CoachHeader } from "@/components/fitness/coach/coach-header";
import { CoachChat } from "@/components/fitness/coach/coach-chat";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { createClient } from "@/lib/services/supabase/server";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const metadata: Metadata = {
  title: "AI Coach - Fitness AI OS",
  description: "Your personal fitness AI coach.",
};

export default async function CoachPage() {
  // Ensure authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = user ? await getFitnessPlan(user.id) : null;
  const isPro = plan?.id === "pro";

  return (
    <FitnessGuard requirePro={false} featureName="AI Coach support">
      <div className="flex flex-col h-[100dvh] max-w-[600px] mx-auto bg-[#0A1108] text-white shadow-sm relative">
        <CoachHeader />
        <CoachChat isPro={isPro} />
      </div>
    </FitnessGuard>
  );
}
