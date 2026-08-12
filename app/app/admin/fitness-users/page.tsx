import { createAdminClient } from "@/lib/services/supabase/admin";
import FitnessUsersTableClient from "./fitness-users-table-client";

export const dynamic = "force-dynamic";

export default async function FitnessUsersPage() {
  const supabase = createAdminClient();

  // Fetch all users who have fitness-related premium status
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      email,
      is_premium,
      premium_tier,
      premium_level,
      premium_expires_at,
      created_at,
      subscriptions (
        id,
        plan,
        status,
        started_at,
        expires_at,
        razorpay_payment_id
      )
    `)
    .order("created_at", { ascending: false });

  const fitnessUsers = (users || []).map((u) => ({
    ...u,
    hasFitnessAccess: !!u.is_premium,
  }));

  const premiumCount = fitnessUsers.filter((u) => u.hasFitnessAccess).length;
  const totalCount = fitnessUsers.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fitness OS Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and grant Fitness OS access independently from GrindLog.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-lime-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-lime-600 uppercase tracking-wider">Fitness Active</p>
          <p className="text-3xl font-black text-lime-600 mt-1">{premiumCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Free Users</p>
          <p className="text-3xl font-black text-gray-400 mt-1">{totalCount - premiumCount}</p>
        </div>
      </div>

      <FitnessUsersTableClient users={fitnessUsers as any} />
    </div>
  );
}
