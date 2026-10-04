import Link from "next/link";
import { RoadmapView } from "@/components/fitness/roadmap/roadmap-view";
import { getRoadmapData } from "@/lib/services/fitness/roadmap-service";

export const dynamic = "force-dynamic";

export default async function TestRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "loss" } = await searchParams;

  // Mock user scenarios
  const scenarios: Record<string, {
    title: string;
    profile: any;
    plan: any;
    premiumLevel: string;
    hasPlan: boolean;
  }> = {
    loss: {
      title: "Fat Loss (82kg → 74kg, Gym, Non-Veg)",
      profile: {
        id: "mock-loss",
        user_id: "mock-loss-user",
        name: "Rahul S",
        goal: "Lose Fat",
        target_physique: "Lean Athletic",
        fitness_level: "Intermediate",
        training_location: "Gym",
        food_type: "Non-Vegetarian",
        weight: 80.5,
        target_weight: 74,
        starting_weight: 82,
        weight_trend_baseline: 82,
        target_deadline_days: 90,
        onboarding_completed: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(), // Day 15
      },
      plan: {
        id: "plan-loss-1",
        name: "Athletic Cut 12-Week",
        status: "active",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      premiumLevel: "pro",
      hasPlan: true,
    },
    gain: {
      title: "Muscle Gain (62kg → 72kg, Home, Veg)",
      profile: {
        id: "mock-gain",
        user_id: "mock-gain-user",
        name: "Arjun M",
        goal: "Build Muscle",
        target_physique: "Muscular",
        fitness_level: "Beginner",
        training_location: "Home",
        food_type: "Vegetarian",
        weight: 64,
        target_weight: 72,
        starting_weight: 62,
        weight_trend_baseline: 62,
        target_deadline_days: 180,
        onboarding_completed: true,
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(), // Month 2
      },
      plan: {
        id: "plan-gain-1",
        name: "Home Hypertrophy Mastery",
        status: "active",
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      premiumLevel: "pro",
      hasPlan: true,
    },
    recomp: {
      title: "Body Recomposition (Lose Fat + Build Muscle)",
      profile: {
        id: "mock-recomp",
        user_id: "mock-recomp-user",
        name: "Pooja V",
        goal: "Lose Fat + Build Muscle",
        target_physique: "Six Pack",
        fitness_level: "Advanced",
        training_location: "Gym",
        food_type: "Vegetarian",
        weight: 68,
        target_weight: 68,
        starting_weight: 68,
        weight_trend_baseline: 68,
        onboarding_completed: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      plan: {
        id: "plan-recomp-1",
        name: "Recomp Density Block",
        status: "active",
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      premiumLevel: "pro",
      hasPlan: true,
    },
    day1: {
      title: "Brand New User (Day 1 Signup Baseline)",
      profile: {
        id: "mock-day1",
        user_id: "mock-day1-user",
        name: "Vikram K",
        goal: "Lose Fat",
        target_physique: "Strong & Functional",
        fitness_level: "Beginner",
        training_location: "Gym",
        food_type: "Non-Vegetarian",
        weight: 85,
        target_weight: 75,
        starting_weight: 85,
        weight_trend_baseline: 85,
        onboarding_completed: true,
        created_at: new Date().toISOString(), // Just signed up
      },
      plan: {
        id: "plan-day1-1",
        name: "Starter Split",
        status: "active",
        created_at: new Date().toISOString(),
      },
      premiumLevel: "pro",
      hasPlan: true,
    },
    noplan: {
      title: "User with No Active Plan Generated Yet",
      profile: {
        id: "mock-noplan",
        user_id: "mock-noplan-user",
        name: "Aman T",
        goal: "Cut",
        target_physique: "Lean Athletic",
        fitness_level: "Intermediate",
        training_location: "Gym",
        food_type: "Non-Vegetarian",
        weight: 78,
        target_weight: 70,
        starting_weight: 78,
        weight_trend_baseline: 78,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      },
      plan: null,
      premiumLevel: "pro",
      hasPlan: false,
    },
    free: {
      title: "Free Preview User (Phase 2+ Gated)",
      profile: {
        id: "mock-free",
        user_id: "mock-free-user",
        name: "Sneha R",
        goal: "Lose Fat",
        target_physique: "Lean Athletic",
        fitness_level: "Beginner",
        training_location: "Home",
        food_type: "Vegetarian",
        weight: 75,
        target_weight: 65,
        starting_weight: 75,
        weight_trend_baseline: 75,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      },
      plan: {
        id: "plan-free-1",
        name: "Free Preview Plan",
        status: "active",
        created_at: new Date().toISOString(),
      },
      premiumLevel: "free",
      hasPlan: true,
    },
  };

  const activeScenario = scenarios[view] || scenarios.loss;
  const roadmapData = await getRoadmapData(
    activeScenario.profile.user_id,
    activeScenario.profile,
    activeScenario.plan
  );

  return (
    <div className="min-h-screen bg-[#0A1108]">
      {/* Test Bar */}
      <div className="sticky top-0 z-50 bg-[#121E12]/95 backdrop-blur-md border-b border-[#1A2619] px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-bold">
          <span className="text-[#ADFF00] uppercase tracking-wider shrink-0">Test Flow:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {Object.entries(scenarios).map(([key, sc]) => (
              <Link
                key={key}
                href={`/test-roadmap?view=${key}`}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  view === key
                    ? "bg-[#ADFF00] text-black font-black"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {key.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <RoadmapView
        roadmapData={roadmapData}
        profile={activeScenario.profile}
        premiumLevel={activeScenario.premiumLevel}
        hasPlan={activeScenario.hasPlan}
      />
    </div>
  );
}
