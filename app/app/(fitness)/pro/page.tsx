import { Metadata } from "next";
import { ProPageClient } from "@/components/fitness/subscription/pro-page";
import { FITNESS_PLANS } from "@/lib/fitness/subscription/plans";
import { createClient } from "@/lib/services/supabase/server";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const metadata: Metadata = {
  title: "Upgrade to Pro - Fitness AI OS",
};

export default async function FitnessProPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  let activePlanId = null;
  if (authData?.user) {
    const plan = await getFitnessPlan(authData.user.id);
    if (plan) activePlanId = plan.id;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ProPageClient plans={FITNESS_PLANS} activePlanId={activePlanId} />
    </div>
  );
}
