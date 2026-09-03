import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

function ProAccessGate({ featureName }: { featureName: string }) {
  return (
    <div className="min-h-[100dvh] bg-[#0A1108] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#ADFF00]/25 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_48%)] p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ADFF00]/15 text-[#ADFF00]">
          <LockKeyhole size={26} />
        </div>
        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Pro feature</p>
        <h1 className="mt-2 text-2xl font-black">Upgrade to use {featureName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          Core includes your dashboard, workout plan, workout guidance, and calorie/protein targets.
          Upgrade to Pro to unlock this feature.
        </p>
        <Link
          href="/payment?returnTo=/&intent=upgrade_pro"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ADFF00] py-3.5 text-sm font-extrabold text-black transition-colors hover:bg-[#c4ff33]"
        >
          Upgrade to Pro <ArrowRight size={17} />
        </Link>
        <Link href="/" className="mt-4 text-xs font-bold text-gray-500 hover:text-white">Back to dashboard</Link>
      </div>
    </div>
  );
}

export async function FitnessGuard({ children, requirePro = false, featureName = "this feature" }: { children: React.ReactNode, requirePro?: boolean, featureName?: string }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const plan = await getFitnessPlan(user.id);

  if (!plan) {
    redirect("/payment?returnTo=/");
  }

  if (requirePro && plan.id !== "pro") {
    return <ProAccessGate featureName={featureName} />;
  }

  return <>{children}</>;
}
