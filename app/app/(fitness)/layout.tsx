import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
  }

  const plan = await getFitnessPlan(user.id);

  return <FitnessShell isPro={plan?.id === "pro"}>{children}</FitnessShell>;
}
