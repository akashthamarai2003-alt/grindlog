import { createAdminClient } from "@/lib/services/supabase/admin";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  // Fetch all users with their active subscriptions if any
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      subscriptions (
        id,
        plan,
        status,
        started_at,
        expires_at,
        razorpay_subscription_id,
        razorpay_payment_id
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">View all registered users and their payment statuses.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Stats</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => {
                // Get the most relevant subscription (active if exists, otherwise the first one)
                const activeSub = user.subscriptions?.find((s: any) => s.status === 'active') || user.subscriptions?.[0];

                return (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {user.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.display_name}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs space-y-1">
                        <span>XP: {user.xp || 0}</span>
                        <span>Level: {user.level || 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_premium ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {activeSub?.plan || 'Premium'}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{activeSub?.status || 'Active'}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono">
                        {activeSub?.razorpay_subscription_id || activeSub?.razorpay_payment_id || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {(!users || users.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
