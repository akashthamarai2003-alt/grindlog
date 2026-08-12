import { createAdminClient } from "@/lib/services/supabase/admin";
import FitnessUsersTableClient from "./fitness-users-table-client";

export const dynamic = "force-dynamic";

export default async function FitnessUsersPage() {
  const supabase = createAdminClient();

  // Fetch ONLY users who have started Fitness OS (exist in fitness_os_profiles)
  const { data: fitnessProfiles } = await supabase
    .from("fitness_os_profiles")
    .select(`
      user_id,
      goal,
      fitness_level,
      onboarding_completed,
      created_at,
      profiles!inner (
        id,
        display_name,
        email,
        is_premium,
        premium_tier,
        premium_level,
        premium_expires_at,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  // Map into the format expected by the client
  const users = (fitnessProfiles || []).map((fp: any) => ({
    id: fp.profiles?.id,
    display_name: fp.profiles?.display_name,
    email: fp.profiles?.email,
    is_premium: fp.profiles?.is_premium,
    premium_tier: fp.profiles?.premium_tier,
    premium_level: fp.profiles?.premium_level,
    premium_expires_at: fp.profiles?.premium_expires_at,
    profile_created_at: fp.profiles?.created_at,
    has_started_fitness: true,
    onboarding_completed: fp.onboarding_completed,
    goal: fp.goal,
    fitness_level: fp.fitness_level,
    fitness_joined_at: fp.created_at,
  }));

  const premiumCount = users.filter((u) => u.is_premium).length;
  const onboardedCount = users.filter((u) => u.onboarding_completed).length;
  const totalCount = users.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fitness OS Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Only users who have opened Fitness OS and started onboarding appear here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fitness Users</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-lime-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-lime-600 uppercase tracking-wider">Fitness Premium</p>
          <p className="text-3xl font-black text-lime-600 mt-1">{premiumCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Onboarding Done</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{onboardedCount}</p>
        </div>
      </div>

      <FitnessUsersTableClient users={users as any} />
    </div>
  );
}
