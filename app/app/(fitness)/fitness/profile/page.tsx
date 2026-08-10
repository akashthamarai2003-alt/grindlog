import { FitnessGuard } from "@/components/fitness/layout/fitness-guard";
import { FitnessShell } from "@/components/fitness/layout/fitness-shell";
import { ProfileSubscription } from "@/components/fitness/profile/profile-subscription";
import { createClient } from "@/lib/services/supabase/server";
import { getFitnessSubscription, getFitnessPlan } from "@/lib/fitness/subscription/access";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default async function FitnessProfile() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) return null;

  const userId = authData.user.id;
  const subscription = await getFitnessSubscription(userId);
  const planConfig = await getFitnessPlan(userId);
  const aiLimitInfo = await checkFitnessAILimit(supabase, userId);

  return (
    <FitnessGuard>
      <FitnessShell>
        <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-20 max-w-[600px] mx-auto w-full">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center">
            <Link href="/fitness" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </Link>
            <div className="flex-1 text-center pr-8">
              <div className="flex items-center justify-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" />
                <h1 className="font-bold text-gray-900 text-[17px]">Profile</h1>
              </div>
            </div>
          </div>

          <div className="px-5 pt-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Account & Billing</h2>
            
            <ProfileSubscription 
              planConfig={planConfig}
              status={subscription?.status || null}
              aiLimitInfo={aiLimitInfo}
            />

          </div>
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
