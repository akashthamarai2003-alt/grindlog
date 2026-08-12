import { createAdminClient } from "@/lib/services/supabase/admin";
import FitnessUsersTableClient from "./fitness-users-table-client";

export const dynamic = "force-dynamic";

export default async function FitnessUsersPage() {
  const supabase = createAdminClient();

  // Fetch ALL users from profiles (shared auth DB)
  // Left join with fitness_os_profiles to show who has started Fitness OS
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      email,
      is_premium,
      premium_tier,
      premium_level,
      premium_expires_at,
      created_at
    `)
    .order("created_at", { ascending: false });

  // Fetch all fitness_os_profiles to check who has started onboarding
  const { data: fitnessProfiles } = await supabase
    .from("fitness_os_profiles")
    .select("user_id, goal, fitness_level, onboarding_completed, created_at");

  const fitnessMap = new Map(
    (fitnessProfiles || []).map((fp: any) => [fp.user_id, fp])
  );

  // Merge: every user gets a fitness_info field (null if not started)
  const users = (allProfiles || []).map((p: any) => {
    const fp = fitnessMap.get(p.id);
    return {
      id: p.id,
      display_name: p.display_name,
      email: p.email,
      is_premium: p.is_premium,
      premium_tier: p.premium_tier,
      premium_level: p.premium_level,
      premium_expires_at: p.premium_expires_at,
      profile_created_at: p.created_at,
      // Fitness OS specific fields
      has_started_fitness: !!fp,
      onboarding_completed: fp?.onboarding_completed ?? false,
      goal: fp?.goal,
      fitness_level: fp?.fitness_level,
      fitness_joined_at: fp?.created_at,
    };
  });

  const premiumCount = users.filter((u) => u.is_premium).length;
  const onboardedCount = users.filter((u) => u.onboarding_completed).length;
  const fitnessStartedCount = users.filter((u) => u.has_started_fitness).length;
  const totalCount = users.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fitness OS Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          All registered users. Grant or revoke Fitness OS access from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-lime-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-lime-600 uppercase tracking-wider">Fitness Premium</p>
          <p className="text-3xl font-black text-lime-600 mt-1">{premiumCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Started Fitness</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{fitnessStartedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Onboarding Done</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{onboardedCount}</p>
        </div>
      </div>

      <FitnessUsersTableClient users={users as any} />
    </div>
  );
}
