import { createAdminClient } from "@/lib/services/supabase/admin";
import { Users, Target, CreditCard, User } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch metrics in parallel
  const [
    { count: usersCount },
    { count: habitsCount },
    { count: proCount },
    { count: coreCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("habits").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true).eq("premium_level", "pro"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true).eq("premium_level", "core")
  ]);

  const metrics = [
    {
      name: "Total Users",
      value: usersCount || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Habits",
      value: habitsCount || 0,
      icon: Target,
      color: "bg-green-500",
    },
    {
      name: "Pro Members",
      value: proCount || 0,
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      name: "Core Members",
      value: coreCount || 0,
      icon: User,
      color: "bg-indigo-500",
    },
  ];

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to the GrindLog admin control panel.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg ${metric.color} flex items-center justify-center text-white shrink-0`}>
                <metric.icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{metric.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Signups</h2>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {recentUsers?.map((user) => (
            <div key={user.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">{user.display_name || "Unnamed"}</span>
                {user.is_premium ? (
                  user.premium_level === "pro" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Pro</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Core</span>
                  )
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Unpaid</span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
              <div className="text-[11px] text-gray-400">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.display_name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.is_premium ? (
                      user.premium_level === "pro" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Pro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Core
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
