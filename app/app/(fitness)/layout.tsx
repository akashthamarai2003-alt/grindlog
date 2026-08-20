import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { FitnessShell } from "@/components/fitness/fitness-shell";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
  }

  return <FitnessShell>{children}</FitnessShell>;
}
