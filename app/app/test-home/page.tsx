import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { FitnessDashboardBottom } from "@/components/fitness/dashboard/fitness-dashboard-bottom";
import { NavigationProvider } from "@/components/fitness/navigation-context";
import { BottomNav } from "@/components/fitness/dashboard/bottom-nav";
import { FITNESS_PLANS } from "@/lib/fitness/subscription/plans";
import { FitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { getSampleFreeWeekDays, SAMPLE_FREE_PLAN, SAMPLE_FREE_WORKOUT } from "@/lib/fitness/sample-free-preview";
import { format, addDays, startOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TestHomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const { view = "pro", date } = await searchParams;

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const targetDateStr = date || todayStr;
  const weekStart = startOfWeek(new Date(targetDateStr), { weekStartsOn: 1 });

  const weekWorkouts = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isPast = dateStr < todayStr;
    return {
      id: `workout-week-${i + 1}`,
      workout_date: dateStr,
      status: isPast ? "completed" : "scheduled",
      name: i === 2 || i === 6 ? "Rest & Recovery" : `Training Day ${i + 1}`,
    };
  });

  const mockWorkout = {
    id: "workout-today-1",
    name: "Push Day Hypertrophy",
    workout_date: targetDateStr,
    duration_minutes: 50,
    status: "scheduled",
    created_at: new Date().toISOString(),
    fitness_os_exercises: [
      {
        id: "ex-1",
        name: "Flat Barbell Bench Press",
        fitness_os_sets: [
          { id: "s-1", completed: false },
          { id: "s-2", completed: false },
          { id: "s-3", completed: false },
        ],
      },
      {
        id: "ex-2",
        name: "Incline Dumbbell Press",
        fitness_os_sets: [
          { id: "s-4", completed: false },
          { id: "s-5", completed: false },
        ],
      },
    ],
  };

  const mockNutrition = {
    daily_calories: 2200,
    protein_grams: 140,
    carbs_grams: 245,
    fat_grams: 65,
    consumed: {
      calories: 1100,
      protein: 75,
      carbs: 120,
      fat: 32,
      water_ml: 2000,
    },
    meals: [
      {
        id: "m-1",
        meal_name: "Breakfast: Besan Cheela & Paneer",
        meal_type: "breakfast",
        time_of_day: "8:30 AM",
        total_calories: 550,
        protein_grams: 35,
        items: ["3 Besan Cheela", "100g Paneer Bhurji"],
      },
      {
        id: "m-2",
        meal_name: "Lunch: Dal Tadka with Phulkas",
        meal_type: "lunch",
        time_of_day: "1:30 PM",
        total_calories: 650,
        protein_grams: 38,
        items: ["2 bowls Yellow Dal", "3 Phulkas", "Curd 100g"],
      },
    ],
  };

  const mockLifestyle = {
    daily_steps_target: 8500,
    water_target_liters: 3.0,
    sleep_target_hours: 8,
  };

  const mockActivity = {
    steps: 6200,
    sleep_hours: 7.5,
    water_liters: 2.0,
  };

  // 1. FREE PREVIEW USER
  if (view === "free") {
    const freeSub: FitnessSubscriptionState = {
      status: "free",
      plan: FITNESS_PLANS.free,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: null,
    };

    return (
      <NavigationProvider>
        <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
          <FitnessDashboard
            user={{ id: "test-user-free", email: "free@grindlog.in", user_metadata: { full_name: "Rohan K" } } as any}
            profile={{ name: "Rohan K", weight: 78, target_weight: 70, weight_trend_baseline: 82 } as any}
            activePlan={SAMPLE_FREE_PLAN}
            todayWorkout={SAMPLE_FREE_WORKOUT}
            weekWorkouts={getSampleFreeWeekDays(new Date(targetDateStr))}
            hasPlan={false}
            nutrition={SAMPLE_FREE_PLAN.plan_data.nutrition}
            lifestyle={SAMPLE_FREE_PLAN.plan_data.lifestyle}
            dailyActivity={{ steps: 4200, sleep_hours: 7.5, water_liters: 1.8 }}
            dayNumber={1}
            premiumLevel="free"
            targetDateStr={targetDateStr}
            subscriptionState={freeSub}
            bottomSlot={
              <FitnessDashboardBottom
                userId="test-user-free"
                nutrition={SAMPLE_FREE_PLAN.plan_data.nutrition}
                lifestyle={SAMPLE_FREE_PLAN.plan_data.lifestyle}
                dailyActivity={{ steps: 4200, sleep_hours: 7.5, water_liters: 1.8 }}
                workoutCompleted={false}
                premiumLevel="free"
                targetDateStr={targetDateStr}
              />
            }
          />
          <BottomNav isPro={false} />
        </div>
      </NavigationProvider>
    );
  }

  // 2. GRACE PERIOD (0-48h after month expiry)
  if (view === "grace_period") {
    const graceSub: FitnessSubscriptionState = {
      status: "grace_period",
      plan: FITNESS_PLANS.pro,
      previousPlan: FITNESS_PLANS.pro,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 36,
      isGracePeriod: true,
      isExpired: false,
      expiresAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    };

    return (
      <NavigationProvider>
        <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
          <FitnessDashboard
            user={{ id: "test-user-grace", email: "grace@grindlog.in", user_metadata: { full_name: "Vikram S" } } as any}
            profile={{ name: "Vikram S", weight: 74, target_weight: 70, weight_trend_baseline: 80 } as any}
            activePlan={{ id: "plan-1", created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString() }}
            todayWorkout={mockWorkout}
            weekWorkouts={weekWorkouts}
            hasPlan={true}
            dayNumber={29}
            premiumLevel="pro"
            targetDateStr={targetDateStr}
            subscriptionState={graceSub}
            bottomSlot={
              <FitnessDashboardBottom
                userId="test-user-grace"
                nutrition={mockNutrition}
                lifestyle={mockLifestyle}
                dailyActivity={mockActivity}
                workoutCompleted={false}
                premiumLevel="pro"
                targetDateStr={targetDateStr}
              />
            }
          />
          <BottomNav isPro={true} />
        </div>
      </NavigationProvider>
    );
  }

  // 3. EXPIRED STATE (>48h after expiry)
  if (view === "expired") {
    const expiredSub: FitnessSubscriptionState = {
      status: "expired",
      plan: FITNESS_PLANS.free,
      previousPlan: FITNESS_PLANS.pro,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: true,
      expiresAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    };

    return (
      <NavigationProvider>
        <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
          <FitnessDashboard
            user={{ id: "test-user-expired", email: "expired@grindlog.in", user_metadata: { full_name: "Vikram S" } } as any}
            profile={{ name: "Vikram S", weight: 73, target_weight: 70, weight_trend_baseline: 80 } as any}
            activePlan={{ id: "plan-1", created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() }}
            todayWorkout={mockWorkout}
            weekWorkouts={weekWorkouts}
            hasPlan={true}
            dayNumber={32}
            premiumLevel="free"
            targetDateStr={targetDateStr}
            subscriptionState={expiredSub}
            bottomSlot={
              <FitnessDashboardBottom
                userId="test-user-expired"
                nutrition={mockNutrition}
                lifestyle={mockLifestyle}
                dailyActivity={mockActivity}
                workoutCompleted={false}
                premiumLevel="free"
                targetDateStr={targetDateStr}
              />
            }
          />
          <BottomNav isPro={false} />
        </div>
      </NavigationProvider>
    );
  }

  // 4. BULKING USER PERSONA
  if (view === "bulking") {
    const proSub: FitnessSubscriptionState = {
      status: "active",
      plan: FITNESS_PLANS.pro,
      daysRemaining: 18,
      hoursRemaining: 432,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return (
      <NavigationProvider>
        <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
          <FitnessDashboard
            user={{ id: "test-user-bulking", email: "bulking@grindlog.in", user_metadata: { full_name: "Arjun M" } } as any}
            profile={{ name: "Arjun M", weight: 68, target_weight: 75, weight_trend_baseline: 65 } as any}
            activePlan={{ id: "plan-1", created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }}
            todayWorkout={mockWorkout}
            weekWorkouts={weekWorkouts}
            hasPlan={true}
            dayNumber={15}
            premiumLevel="pro"
            targetDateStr={targetDateStr}
            subscriptionState={proSub}
            bottomSlot={
              <FitnessDashboardBottom
                userId="test-user-bulking"
                nutrition={mockNutrition}
                lifestyle={mockLifestyle}
                dailyActivity={mockActivity}
                workoutCompleted={false}
                premiumLevel="pro"
                targetDateStr={targetDateStr}
              />
            }
          />
          <BottomNav isPro={true} />
        </div>
      </NavigationProvider>
    );
  }

  // 5. REST DAY VIEW
  if (view === "rest_day") {
    const proSub: FitnessSubscriptionState = {
      status: "active",
      plan: FITNESS_PLANS.pro,
      daysRemaining: 20,
      hoursRemaining: 480,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const restWorkout = {
      id: "workout-rest-1",
      name: "Rest & Active Recovery",
      workout_date: targetDateStr,
      duration_minutes: 0,
      status: "scheduled",
      created_at: new Date().toISOString(),
      fitness_os_exercises: [],
    };

    return (
      <NavigationProvider>
        <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
          <FitnessDashboard
            user={{ id: "test-user-pro", email: "pro@grindlog.in", user_metadata: { full_name: "Vikram S" } } as any}
            profile={{ name: "Vikram S", weight: 75, target_weight: 70, weight_trend_baseline: 82 } as any}
            activePlan={{ id: "plan-1", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }}
            todayWorkout={restWorkout}
            weekWorkouts={weekWorkouts}
            hasPlan={true}
            dayNumber={11}
            premiumLevel="pro"
            targetDateStr={targetDateStr}
            subscriptionState={proSub}
            bottomSlot={
              <FitnessDashboardBottom
                userId="test-user-pro"
                nutrition={mockNutrition}
                lifestyle={mockLifestyle}
                dailyActivity={mockActivity}
                workoutCompleted={false}
                premiumLevel="pro"
                targetDateStr={targetDateStr}
              />
            }
          />
          <BottomNav isPro={true} />
        </div>
      </NavigationProvider>
    );
  }

  // 6. DEFAULT ACTIVE PRO USER
  const proSub: FitnessSubscriptionState = {
    status: "active",
    plan: FITNESS_PLANS.pro,
    daysRemaining: 18,
    hoursRemaining: 432,
    graceHoursRemaining: 0,
    isGracePeriod: false,
    isExpired: false,
    expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <NavigationProvider>
      <div data-testid="home-page-root" className="min-h-screen bg-[#0A1108]">
        <FitnessDashboard
          user={{ id: "test-user-pro", email: "pro@grindlog.in", user_metadata: { full_name: "Vikram S" } } as any}
          profile={{ name: "Vikram S", weight: 75, target_weight: 70, weight_trend_baseline: 82 } as any}
          activePlan={{ id: "plan-1", created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }}
          todayWorkout={mockWorkout}
          weekWorkouts={weekWorkouts}
          hasPlan={true}
          dayNumber={8}
          premiumLevel="pro"
          targetDateStr={targetDateStr}
          subscriptionState={proSub}
          bottomSlot={
            <FitnessDashboardBottom
              userId="test-user-pro"
              nutrition={mockNutrition}
              lifestyle={mockLifestyle}
              dailyActivity={mockActivity}
              workoutCompleted={false}
              premiumLevel="pro"
              targetDateStr={targetDateStr}
            />
          }
        />
        <BottomNav isPro={true} />
      </div>
    </NavigationProvider>
  );
}
