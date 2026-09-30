import { MyDetailsContent } from "@/components/fitness/profile/my-details-content";

export const dynamic = "force-dynamic";

export default async function TestDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { scenario = "standard" } = await searchParams;

  const isStandard = scenario === "standard";
  const isEmpty = scenario === "empty";

  const mockFitnessProfile = isEmpty
    ? {
        user_id: "test-user-details-uuid",
        name: "Empty Profile User",
        weight: null,
        target_weight: null,
        height: null,
        fitness_level: null,
        training_days_per_week: null,
        goal: null,
        waist_cm: null,
        chest_cm: null,
        arm_cm: null,
        thigh_cm: null,
        physical_problems: null,
        exercise_limitations: null,
        previous_injuries: null,
        equipment: null,
        preferred_training_days: null,
        dietary_preference: null,
        allergies: null,
      }
    : !isStandard
    ? {
        // Edge case: fields stored as non-arrays (e.g. malformed JSON or single string)
        user_id: "test-user-details-uuid",
        name: "Edge Case User",
        weight: 80,
        target_weight: 75,
        height: 180,
        fitness_level: "Advanced",
        training_days_per_week: 4,
        goal: "Muscle Gain",
        waist_cm: 84,
        chest_cm: 102,
        arm_cm: 38,
        thigh_cm: 60,
        physical_problems: "Lower back strain" as any,
        exercise_limitations: "No heavy overhead press" as any,
        injuries: "Old shoulder impingement" as any,
        equipment: "Full Gym" as any,
        preferred_training_days: "Mon, Wed, Fri" as any,
        dietary_preference: "Vegetarian",
        allergies: "None",
      }
    : {
        user_id: "test-user-details-uuid",
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
        physical_problems: ["Mild Lower Back Stiffness"],
        exercise_limitations: ["No heavy deadlifts"],
        previous_injuries: true,
        previous_injury_areas: ["Left Knee Meniscus (Recovered)"],
        equipment: ["Dumbbells", "Barbell", "Pull-up Bar", "Resistance Bands"],
        preferred_training_days: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
        dietary_preference: "High Protein Non-Veg",
        allergies: ["Peanuts", "Shellfish"],
        medical_conditions: ["None"],
      };

  const mockActivePlan = {
    id: "plan-mock-123",
    goal: "Improve Fitness",
    level: "Intermediate",
    days_per_week: 5,
    name: "Hypertrophy & Conditioning Phase 1",
  };

  return (
    <div className="min-h-screen bg-[#060B06] text-white">
      <MyDetailsContent
        fitnessProfile={mockFitnessProfile}
        activePlan={mockActivePlan}
      />
    </div>
  );
}
