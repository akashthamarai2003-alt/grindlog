import { Metadata } from "next";
import { CoachHeader } from "@/components/fitness/coach/coach-header";
import { CoachChat } from "@/components/fitness/coach/coach-chat";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { createClient } from "@/lib/services/supabase/server";

export const metadata: Metadata = {
  title: "AI Coach - Fitness AI OS",
  description: "Your personal fitness AI coach.",
};

export default async function CoachPage() {
  // Ensure authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <FitnessGuard requirePro featureName="AI Coach support">
      <FitnessShell>
        <div className="flex flex-col h-[100dvh] max-w-[600px] mx-auto bg-gray-50 shadow-sm relative">
          <CoachHeader />
          <CoachChat />
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
