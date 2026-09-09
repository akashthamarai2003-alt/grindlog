import { createAdminClient } from "@/lib/services/supabase/admin";
import { Users, Activity, CreditCard, Sparkles } from "lucide-react";
import FitnessTableClient, { FitnessUserDetails } from "./fitness-table-client";

export const dynamic = "force-dynamic";

export default async function FitnessAdminDashboard() {
  const supabase = createAdminClient();

  // 1. Fetch fitness profiles ordered by newest first
  const { data: fitnessProfilesRaw } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const fitnessProfiles = fitnessProfilesRaw || [];

  // 2. Fetch AI sessions count
  const { count: aiSessionsCount } = await supabase
    .from("fitness_os_ai_sessions")
    .select("*", { count: "exact", head: true });

  // 3. Fetch user IDs to fetch user profiles and subscriptions
  const userIds = fitnessProfiles.map((p) => p.user_id).filter(Boolean);

  let profilesMap = new Map<string, { display_name?: string | null; email?: string | null }>();
  let subscriptionsMap = new Map<string, { plan?: string; status?: string; current_period_end?: string }>();

  if (userIds.length > 0) {
    const [profilesRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, email").in("id", userIds),
      supabase.from("fitness_os_subscriptions").select("user_id, plan, status, current_period_end").in("user_id", userIds),
    ]);

    if (profilesRes.data) {
      profilesRes.data.forEach((p) => {
        profilesMap.set(p.id, { display_name: p.display_name, email: p.email });
      });
    }

    if (subsRes.data) {
      subsRes.data.forEach((sub) => {
        subscriptionsMap.set(sub.user_id, {
          plan: sub.plan,
          status: sub.status,
          current_period_end: sub.current_period_end,
        });
      });
    }
  }

  // Calculate metrics accurately
  const totalUsers = fitnessProfiles.length;
  const activeSubsCount = fitnessProfiles.filter(
    (p) => p.fitness_is_premium || subscriptionsMap.get(p.user_id)?.status === "active"
  ).length;
  const proSubscribersCount = fitnessProfiles.filter(
    (p) =>
      (p.fitness_is_premium && (p.fitness_premium_tier === "pro" || p.fitness_premium_level === "pro" || p.fitness_premium_tier === "monthly")) ||
      subscriptionsMap.get(p.user_id)?.plan === "pro"
  ).length;

  const metrics = [
    {
      name: "Total Fitness Users",
      value: totalUsers,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Active Subscriptions",
      value: activeSubsCount,
      icon: Activity,
      color: "bg-emerald-500",
    },
    {
      name: "Pro Subscribers",
      value: proSubscribersCount,
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      name: "Total AI Sessions",
      value: aiSessionsCount || 0,
      icon: Sparkles,
      color: "bg-indigo-500",
    },
  ];

  // Map user data into comprehensive FitnessUserDetails
  const fitnessUsers: FitnessUserDetails[] = fitnessProfiles.map((fp) => {
    const ob = (fp.onboarding_data as Record<string, any>) || {};
    const mainProf = profilesMap.get(fp.user_id);
    const sub = subscriptionsMap.get(fp.user_id);

    const rawName = fp.name || ob.name || mainProf?.display_name || "Member";
    const cleanName = String(rawName).trim() || "Member";

    const email = mainProf?.email || ob.email || "No email";
    const gender = fp.gender || ob.gender || "Not specified";
    const age = fp.age || ob.age || "-";
    const language = fp.preferred_language || ob.preferred_language || "English";
    const country = (fp.country || ob.country || "Global").trim() || "Global";

    const goal = fp.goal || ob.goal || "-";
    const fitnessLevel = fp.fitness_level || ob.fitness_level || "-";
    const height = fp.height || ob.height || "-";
    const weight = fp.weight || ob.weight || "-";
    const targetWeight = fp.target_weight || ob.target_weight || "-";
    const bmi = fp.bmi || ob.bmi || "-";

    const dietPreference = fp.diet_preference || ob.food_type || ob.diet_preference || "-";
    const foodEnvironment = fp.food_environment || ob.food_environment || "-";
    const nutritionBudget = fp.nutrition_budget || ob.nutrition_budget || "-";
    const mealsPerDay = fp.meals_per_day || ob.meals_per_day || "-";

    const trainingLocation = fp.training_location || ob.training_location || "-";
    const equipment = Array.isArray(fp.equipment) && fp.equipment.length > 0
      ? fp.equipment
      : Array.isArray(ob.equipment)
      ? ob.equipment
      : [];

    const trainingDaysPerWeek = fp.training_days_per_week || ob.training_days_per_week || "-";
    const workoutDurationMinutes = fp.workout_duration_minutes || ob.workout_duration_minutes || "-";
    const preferredTrainingTime = fp.preferred_training_time || ob.preferred_training_time || "-";

    const physicalProblems = Array.isArray(fp.physical_problems) && fp.physical_problems.length > 0
      ? fp.physical_problems
      : Array.isArray(ob.physical_problems)
      ? ob.physical_problems
      : [];

    const exerciseLimitations = Array.isArray(fp.exercise_limitations) && fp.exercise_limitations.length > 0
      ? fp.exercise_limitations
      : Array.isArray(ob.exercise_limitations)
      ? ob.exercise_limitations
      : [];

    const currentPainSeverity = fp.current_pain_severity ?? ob.current_pain_severity;
    const sleepDuration = fp.sleep_duration || ob.sleep_duration || "-";
    const dailySteps = fp.daily_steps || ob.daily_steps || "-";

    const isPremium = Boolean(fp.fitness_is_premium || sub?.status === "active");
    const premiumTier = fp.fitness_premium_tier || sub?.plan || "monthly";
    const premiumLevel = fp.fitness_premium_level || sub?.plan || "pro";
    const premiumExpiresAt = fp.fitness_premium_expires_at || sub?.current_period_end;

    return {
      userId: fp.user_id,
      name: cleanName,
      email,
      gender,
      age,
      language,
      country,
      goal,
      fitnessLevel,
      height,
      weight,
      targetWeight,
      bmi,
      dietPreference,
      foodEnvironment,
      nutritionBudget,
      mealsPerDay,
      trainingLocation,
      equipment,
      trainingDaysPerWeek,
      workoutDurationMinutes,
      preferredTrainingTime,
      physicalProblems,
      exerciseLimitations,
      currentPainSeverity,
      sleepDuration,
      dailySteps,
      isPremium,
      premiumTier,
      premiumLevel,
      premiumExpiresAt,
      joinedAt: fp.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fitness AI OS Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Monitor and review all onboarded fitness members, their physical profiles, and training plans.
          </p>
        </div>
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

      {/* Fitness Members Table & Detail Modal */}
      <FitnessTableClient users={fitnessUsers} />
    </div>
  );
}
