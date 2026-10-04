import { notFound } from "next/navigation";
import { V2NutritionView } from "@/components/fitness/nutrition/v2-nutrition-view";
import type { V2NutritionDay } from "@/lib/services/nutrition/v2-ui-data";

// Local visual fixture only. The real /nutrition route remains profile gated.
export default function V2NutritionVisualFixture() {
  if (process.env.PLAYWRIGHT_TEST !== "1") notFound();
  const data: V2NutritionDay = {
    date: "2026-10-04", today: "2026-10-04", timezone: "Asia/Kolkata", planId: "fixture-plan",
    consumed: { calories: 470, protein: 26, carbs: 52, fat: 17, water_ml: 1250 },
    targets: { calories: 2105, protein: 104, carbs: 253, fat: 75, water_ml: 2500 },
    logs: [{ id: "fixture-log", mealSlot: "breakfast", plannedMealId: "breakfast",
      name: "Paneer and poha", serving: "1 plate", calories: 470, protein: 26,
      carbs: 52, fat: 17, loggedAt: "2026-10-04T03:20:00Z" }],
    meals: [
      { id: "breakfast", slot: "breakfast", sequence: 1, scheduledTime: "08:30:00",
        status: "LOGGED", sourceType: "TEMPLATE", name: "Hostel Breakfast Plate",
        description: "A balanced mess breakfast.", whyThisMeal: "Uses the mess breakfast with a protein side.",
        prepInstructions: "Serve the listed foods in their planned portions.", prepTimeMin: null,
        imageUrl: "", calories: 470, protein: 26, carbs: 52, fat: 17, cost: 30,
        ingredients: [{ id: "i1", name: "Poha", quantity: "200 g", isProvided: true },
          { id: "i2", name: "Paneer", quantity: "80 g", isProvided: false }],
        logs: [{ id: "fixture-log", mealSlot: "breakfast", plannedMealId: "breakfast",
          name: "Paneer and poha", serving: "1 plate", calories: 470, protein: 26,
          carbs: 52, fat: 17, loggedAt: "2026-10-04T03:20:00Z" }] },
      { id: "lunch", slot: "lunch", sequence: 2, scheduledTime: "13:00:00",
        status: "PLANNED", sourceType: "RECIPE", name: "Dal, Rice and Paneer Bowl",
        description: "A satisfying lunch with protein and slow carbs.", whyThisMeal: null,
        prepInstructions: "Warm the dal. Serve with steamed rice and paneer.", prepTimeMin: 15,
        imageUrl: "https://images.grindlog.in/missing-lunch.jpg", calories: 744,
        protein: 39, carbs: 96, fat: 19, cost: 135,
        ingredients: [{ id: "i3", name: "Dal Tadka", quantity: "220 g", isProvided: true },
          { id: "i4", name: "White Rice", quantity: "180 g", isProvided: true },
          { id: "i5", name: "Paneer", quantity: "100 g", isProvided: false }], logs: [] },
      { id: "dinner", slot: "dinner", sequence: 3, scheduledTime: "19:30:00",
        status: "PLANNED", sourceType: "TEMPLATE", name: "Mess Dinner with Curd",
        description: "Evening meal from the hostel mess.", whyThisMeal: "Uses the provided dinner while staying within budget.",
        prepInstructions: "Serve the mess dinner and add curd on the side.", prepTimeMin: null,
        imageUrl: "", calories: 650, protein: 32, carbs: 84, fat: 20, cost: 28,
        ingredients: [{ id: "i6", name: "Roti", quantity: "2 pieces", isProvided: true },
          { id: "i7", name: "Curd", quantity: "150 g", isProvided: false }], logs: [] },
    ],
  };
  return <main className="min-h-screen bg-[#0A1108] px-4 py-6 text-white sm:px-6"><div className="mx-auto max-w-5xl"><V2NutritionView initialData={data} isPro fixtureMode /></div></main>;
}
