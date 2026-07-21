import { createAdminClient } from "@/lib/services/supabase/admin";
import Razorpay from "razorpay";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

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

  // Helper to estimate paid amount since it wasn't historically tracked in DB
  const getPaidAmount = (tier?: string, level?: string, isPremium?: boolean) => {
    if (!isPremium || !tier || !level) return 0;
    if (tier === 'monthly' && level === 'core') return 49;
    if (tier === 'monthly' && level === 'pro') return 69;
    if (tier === 'six_months' && level === 'core') return 199;
    if (tier === 'six_months' && level === 'pro') return 249;
    if (tier === 'lifetime' && level === 'core') return 599;
    if (tier === 'lifetime' && level === 'pro') return 799;
    return 0;
  };

  const usersWithAmounts = await Promise.all(
    (users || []).map(async (user) => {
      const paymentId = user.razorpay_payment_id || user.subscriptions?.[0]?.razorpay_subscription_id || user.subscriptions?.[0]?.razorpay_payment_id;
      let actualPaidAmount = 0;
      
      if (paymentId && paymentId.startsWith("pay_")) {
        try {
          const payment = await razorpay.payments.fetch(paymentId);
          actualPaidAmount = payment.amount / 100;
        } catch (e) {
          console.error("Failed to fetch Razorpay payment", paymentId);
          actualPaidAmount = getPaidAmount(user.premium_tier, user.premium_level, user.is_premium);
        }
      } else if (user.is_premium) {
         // Fallback if bypassed (100% discount) or missing payment ID
         actualPaidAmount = getPaidAmount(user.premium_tier, user.premium_level, user.is_premium);
      }
      
      return {
        ...user,
        actualPaidAmount,
        paymentId: paymentId || "-"
      };
    })
  );

  const totalRevenue = usersWithAmounts.reduce((acc, user) => acc + user.actualPaidAmount, 0) || 0;

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
                <th className="px-6 py-3">Paid Amount</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {usersWithAmounts.map((user) => {
                const getPlanName = (tier: string, level: string) => {
                  let baseName = 'Pro';
                  if (tier === 'monthly') baseName = 'Monthly';
                  if (tier === 'six_months') baseName = '6 Months';
                  if (tier === 'lifetime') baseName = 'Lifetime';
                  
                  const levelName = level ? (level.charAt(0).toUpperCase() + level.slice(1)) : 'Pro';
                  return `${baseName} - ${levelName}`;
                };
                
                const planName = user.premium_tier ? getPlanName(user.premium_tier, user.premium_level) : 'Pro';
                const paymentId = user.paymentId;
                const paidAmount = user.actualPaidAmount;

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
                            {planName}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">Active</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono">
                        {paymentId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-green-600">
                        {paidAmount > 0 ? `₹${paidAmount}` : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right uppercase text-xs">Total Revenue:</td>
                <td className="px-6 py-4 text-green-600">₹{totalRevenue.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          
          {(!usersWithAmounts || usersWithAmounts.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
