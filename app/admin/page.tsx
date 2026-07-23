import { createAdminClient } from "@/lib/services/supabase/admin";
import { Users, Target, CreditCard, User } from "lucide-react";
import RecentSignupsClient from "./recent-signups-client";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center text-white`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Signups</h2>
        </div>
        <RecentSignupsClient users={recentUsers || []} />
      </div>
    </div>
  );
}
