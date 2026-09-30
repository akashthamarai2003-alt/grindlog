import { OnboardingFlow } from "@/components/fitness/onboarding/onboarding-flow";
import { OnboardingData } from "@/types/fitness/onboarding";

export const dynamic = "force-dynamic";

export default async function TestOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; filled?: string; step?: string }>;
}) {
  const { mode, filled, step } = await searchParams;
  const isEditing = mode === "edit";
  const parsedStep = step ? parseInt(step, 10) : (filled === "1" ? 15 : undefined);

  const completeMockData: Partial<OnboardingData> = {
    name: "Alex Hunter",
    country: "India",
    preferred_language: "English",
    gender: "Male",
    age: 26,
    height: 178,
    weight: 76.5,
    waist_cm: 82,
    chest_cm: 100,
    arm_cm: 36,
    thigh_cm: 56,
    goal: "Build Muscle",
    target_weight: 80,
    target_deadline_days: 90,
    fitness_level: "Intermediate",
    training_days_per_week: 4,
    training_location: "Gym",
    equipment: ["Full Commercial Gym"],
    workout_duration_minutes: 60,
    preferred_training_time: "Evening",
    plan_start_preference: "monday",
    food_type: "Non-Vegetarian",
    food_environment: "Home",
    meals_per_day: "4 meals",
    nutrition_budget: "₹2,000–5,000",
    available_foods: ["Chicken Breast", "Eggs", "Oats", "Rice", "Paneer"],
    activity_level: "Moderately active",
    daily_steps: "5–10k",
    sleep_duration: "7–8h",
    physical_problems: ["None"],
    previous_injuries: false,
    exercise_limitations: ["None"],
    safety_acknowledged: true,
    target_physique: "Muscular",
  };

  const initialData: Partial<OnboardingData> = filled === "1" ? completeMockData : {};

  return (
    <div className="min-h-screen bg-[#0A1108]">
      <OnboardingFlow 
        initialData={initialData} 
        sessionId="test-session-e2e" 
        isEditing={isEditing}
        initialStep={parsedStep}
        redirectTo="/test-report?subscribed=1"
      />
    </div>
  );
}
