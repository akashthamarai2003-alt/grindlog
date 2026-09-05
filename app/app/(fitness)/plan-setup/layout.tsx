import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { requireFitnessSubscription } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";

export default async function PlanSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/plan-setup");
  }

  const hasSub = await requireFitnessSubscription(user.id);
  if (!hasSub) {
    redirect("/payment?returnTo=/plan-setup&intent=generate_plan");
  }

  return <>{children}</>;
}
