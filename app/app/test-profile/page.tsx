import { ProfileContent } from "@/components/fitness/profile/profile-content";
import { FitnessThemeProvider } from "@/components/fitness/fitness-theme-provider";

export const dynamic = "force-dynamic";

export default async function TestProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; missing?: string }>;
}) {
  const { tier = "pro", missing } = await searchParams;

  const isMissing = missing === "1";
  const now = new Date();
  const futureExpiry = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString();
  const pastExpiry = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

  let subscriptionPlan: { id: "starter" | "core" | "pro" | "free" } | null = { id: "pro" };
  let fitnessPremiumExpiresAt: string | null = futureExpiry;

  if (tier === "core") {
    subscriptionPlan = { id: "core" };
  } else if (tier === "free") {
    subscriptionPlan = { id: "free" };
    fitnessPremiumExpiresAt = null;
  } else if (tier === "expired") {
    subscriptionPlan = { id: "free" };
    fitnessPremiumExpiresAt = pastExpiry;
  }

  const mockUser = {
    id: "test-user-uuid-12345",
    email: "alex.hunter@example.com",
    created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    user_metadata: {
      full_name: isMissing ? "" : "Alex Hunter",
    },
  };

  const mockFitnessProfile = isMissing
    ? {
        user_id: mockUser.id,
        name: "",
        weight: null,
        target_weight: null,
        height: null,
        fitness_level: null,
        training_days_per_week: null,
        goal: null,
        fitness_tier: tier === "free" ? "free" : tier,
        fitness_premium_expires_at: fitnessPremiumExpiresAt,
        reminders_enabled: true,
      }
    : {
        user_id: mockUser.id,
        name: "Alex Hunter",
        weight: 78.5,
        target_weight: 74.0,
        height: 178,
        fitness_level: "Intermediate",
        training_days_per_week: 5,
        goal: "Improve Fitness",
        waist_cm: 82,
        chest_cm: 98,
        arm_cm: 36,
        thigh_cm: 58,
        fitness_tier: tier === "free" ? "free" : tier,
        fitness_premium_expires_at: fitnessPremiumExpiresAt,
        reminders_enabled: true,
        dietary_preference: "High Protein Non-Veg",
        allergies: ["Peanuts"],
        equipment_available: ["Dumbbells", "Barbell", "Bench"],
      };

  const mockMainProfile = {
    id: mockUser.id,
    display_name: isMissing ? "" : "Alex Hunter",
    name: isMissing ? "" : "Alex Hunter",
  };

  const mockActivePlan = {
    id: "plan-mock-123",
    goal: "Improve Fitness",
    level: "Intermediate",
    days_per_week: 5,
    name: "Hypertrophy & Conditioning Phase 1",
  };

  const mockAiLimitInfo = {
    allowed: tier !== "free",
    limit: tier === "pro" ? 50 : 20,
    used: 12,
    remaining: tier === "pro" ? 38 : 8,
  };

  return (
    <FitnessThemeProvider>
      <div className="min-h-screen bg-[#060B06] text-white">
        <ProfileContent
          user={mockUser}
          fitnessProfile={mockFitnessProfile}
          mainProfile={mockMainProfile}
          activePlan={mockActivePlan}
          subscriptionPlan={subscriptionPlan}
          aiLimitInfo={mockAiLimitInfo}
        />
      </div>
    </FitnessThemeProvider>
  );
}
