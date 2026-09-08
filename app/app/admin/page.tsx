import { createAdminClient } from "@/lib/services/supabase/admin";
import { Users, CreditCard, User, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

// Deterministic date formatting immune to client/SSR locale mismatch
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch metrics in parallel directly from Fitness OS profiles and general profiles
  const [
    { data: profiles, count: usersCount },
    { data: fitnessProfiles }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    supabase.from("fitness_os_profiles").select("user_id, onboarding_completed, fitness_is_premium, fitness_premium_tier, fitness_premium_level, fitness_premium_expires_at")
  ]);

  const fitnessMap = new Map((fitnessProfiles || []).map(fp => [fp.user_id, fp]));

  let proCount = 0;
  let coreCount = 0;
  let onboardingCompletedCount = 0;

  (fitnessProfiles || []).forEach(fp => {
    if (fp.fitness_is_premium) {
      const level = (fp.fitness_premium_level || "pro").toLowerCase();
      if (level === "pro") proCount++;
      else if (level === "core") coreCount++;
    }
    if (fp.onboarding_completed) {
      onboardingCompletedCount++;
    }
  });

  const totalUsers = usersCount || profiles?.length || 0;
  const completionRate = totalUsers > 0 ? Math.round((onboardingCompletedCount / totalUsers) * 100) : 0;

  const metrics = [
    {
      name: "Total Users",
      value: totalUsers,
      sublabel: "Registered members",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Pro Members",
      value: proCount,
      sublabel: "Active Monthly Pro",
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      name: "Core Members",
      value: coreCount,
      sublabel: "Active Monthly Core",
      icon: User,
      color: "bg-indigo-500",
    },
    {
      name: "Onboarding Completed",
      value: onboardingCompletedCount,
      sublabel: `${completionRate}% completed assessment`,
      icon: CheckCircle2,
      color: "bg-green-500",
    },
  ];

  // Map recent users with accurate Fitness OS subscription and onboarding data
  const recentUsers = (profiles || []).slice(0, 5).map((u) => {
    const fp = fitnessMap.get(u.id);
    const isPremium = Boolean(fp?.fitness_is_premium || u.is_premium);
    const level = (fp?.fitness_premium_level || u.premium_level || "pro").toLowerCase();
    const onboardingCompleted = Boolean(fp?.onboarding_completed);

    return {
      ...u,
      isPremium,
      level,
      onboardingCompleted,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome to the Fitness OS admin control panel.</p>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all w-fit shadow-xs"
        >
          <span>Manage All Users</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg ${metric.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                <metric.icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{metric.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-[11px] text-gray-400 truncate hidden sm:block">{metric.sublabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Signups</h2>
            <p className="text-xs text-gray-400">Latest members registered on Fitness OS</p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {recentUsers?.map((user) => (
            <div key={user.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shrink-0">
                    {user.display_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="font-semibold text-sm text-gray-900 truncate">{user.display_name || "Unnamed"}</span>
                </div>
                {user.isPremium ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    user.level === "pro" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                  }`}>
                    Monthly - {user.level === "core" ? "Core" : "Pro"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 shrink-0">
                    Unpaid
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>
                  {user.onboardingCompleted ? (
                    <span className="text-green-600 font-semibold">✓ Onboarded</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">Pending Onboarding</span>
                  )}
                </span>
                <span suppressHydrationWarning>Joined: {formatDate(user.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Onboarding</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                        {user.display_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.display_name || "Unnamed"}</div>
                        <div className="text-xs text-gray-500 font-normal">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isPremium ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.level === "core"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}>
                          Monthly - {user.level === "core" ? "Core" : "Pro"}
                        </span>
                        <span className="text-[11px] text-green-600 font-semibold">Active</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.onboardingCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600" suppressHydrationWarning>
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href="/admin/users"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
