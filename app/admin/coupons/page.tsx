import { createAdminClient } from "@/lib/services/supabase/admin";
import { CreditCard, Plus, Percent, Users, Power, Ticket, RefreshCw } from "lucide-react";
import ClientCouponForm from "./client-form";
import ToggleCouponButton from "./toggle-button";

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-500">Generate discount codes for new users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Generate New Coupon
            </h2>
            <ClientCouponForm />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                Active & Past Coupons
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">CODE</th>
                    <th className="px-6 py-4">DISCOUNT</th>
                    <th className="px-6 py-4">USAGE</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!coupons || coupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No coupons found. Generate one to get started!
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c.id} className={!c.is_active || c.used_count >= c.max_uses ? "opacity-60 bg-gray-50/50" : ""}>
                        <td className="px-6 py-4 font-bold text-gray-900 tracking-wider">
                          {c.code}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                            {c.discount_percentage}% OFF
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${Math.min(100, (c.used_count / c.max_uses) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {c.used_count} / {c.max_uses}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {c.used_count >= c.max_uses ? (
                            <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium">
                              Depleted
                            </span>
                          ) : c.is_active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ToggleCouponButton id={c.id} isActive={c.is_active} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
