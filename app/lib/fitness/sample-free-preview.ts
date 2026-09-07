export const SAMPLE_FREE_PLAN = {
  id: "free-preview-plan",
  name: "Upper / Lower Strength & Hypertrophy",
  description: "Preview sample plan designed to build foundational strength, lean muscle mass, and metabolic stamina.",
  goal: "Muscle Growth & Strength",
  created_at: new Date().toISOString(),
  plan_data: {
    nutrition: {
      targets: {
        calories: 2250,
        protein: 145,
        carbs: 250,
        fat: 65,
        water_ml: 3000,
      },
      meals: [
        {
          meal_type: "breakfast",
          name: "High-Protein Oats & Whey",
          calories: 520,
          protein: 38,
          carbs: 65,
          fat: 12,
          items: [
            { name: "Rolled Oats", quantity: "80g", calories: 300, protein: 10, carbs: 54, fat: 5 },
            { name: "Whey Protein Isolate", quantity: "1 scoop", calories: 120, protein: 25, carbs: 2, fat: 1 },
            { name: "Almond Butter", quantity: "1 tbsp", calories: 100, protein: 3, carbs: 9, fat: 6 }
          ]
        },
        {
          meal_type: "lunch",
          name: "Grilled Chicken, Quinoa & Avocado Bowl",
          calories: 680,
          protein: 52,
          carbs: 68,
          fat: 20,
          items: [
            { name: "Chicken Breast", quantity: "180g", calories: 290, protein: 42, carbs: 0, fat: 6 },
            { name: "Cooked Quinoa", quantity: "1.5 cup", calories: 240, protein: 8, carbs: 44, fat: 4 },
            { name: "Avocado", quantity: "1/2 medium", calories: 150, protein: 2, carbs: 24, fat: 10 }
          ]
        },
        {
          meal_type: "dinner",
          name: "Baked Salmon, Sweet Potato & Asparagus",
          calories: 640,
          protein: 42,
          carbs: 58,
          fat: 24,
          items: [
            { name: "Atlantic Salmon", quantity: "170g", calories: 350, protein: 35, carbs: 0, fat: 20 },
            { name: "Roasted Sweet Potato", quantity: "200g", calories: 180, protein: 4, carbs: 42, fat: 0 },
            { name: "Steamed Asparagus", quantity: "150g", calories: 110, protein: 3, carbs: 16, fat: 4 }
          ]
        },
        {
          meal_type: "snack",
          name: "Greek Yogurt & Mixed Berries",
          calories: 410,
          protein: 28,
          carbs: 59,
          fat: 9,
          items: [
            { name: "0% Greek Yogurt", quantity: "200g", calories: 130, protein: 22, carbs: 8, fat: 0 },
            { name: "Mixed Berries", quantity: "1 cup", calories: 80, protein: 1, carbs: 18, fat: 1 },
            { name: "Walnuts", quantity: "30g", calories: 200, protein: 5, carbs: 33, fat: 8 }
          ]
        }
      ]
    },
    lifestyle: {
      steps_target: 8500,
      sleep_target_hours: 8,
    }
  }
};

export const SAMPLE_FREE_WORKOUT = {
  id: "free-preview-workout",
  name: "Upper Body Strength & Hypertrophy",
  workout_date: new Date().toISOString().split("T")[0],
  status: "scheduled",
  duration_minutes: 48,
  exerciseCount: 5,
  fitness_os_exercises: [
    {
      id: "free-ex-1",
      name: "Dumbbell Bench Press",
      muscle: "Chest",
      sets: 3,
      reps: "8–10 reps",
      targetWeight: "24 kg",
      fitness_os_sets: [
        { id: "s1", set_number: 1, reps: 10, weight: 24, completed: false },
        { id: "s2", set_number: 2, reps: 9, weight: 24, completed: false },
        { id: "s3", set_number: 3, reps: 8, weight: 24, completed: false },
      ]
    },
    {
      id: "free-ex-2",
      name: "Incline Dumbbell Fly",
      muscle: "Upper Chest",
      sets: 3,
      reps: "10–12 reps",
      targetWeight: "14 kg",
      fitness_os_sets: [
        { id: "s4", set_number: 1, reps: 12, weight: 14, completed: false },
        { id: "s5", set_number: 2, reps: 11, weight: 14, completed: false },
        { id: "s6", set_number: 3, reps: 10, weight: 14, completed: false },
      ]
    },
    {
      id: "free-ex-3",
      name: "Lat Pulldown",
      muscle: "Back (Lats)",
      sets: 3,
      reps: "10–12 reps",
      targetWeight: "55 kg",
      fitness_os_sets: [
        { id: "s7", set_number: 1, reps: 12, weight: 55, completed: false },
        { id: "s8", set_number: 2, reps: 10, weight: 55, completed: false },
        { id: "s9", set_number: 3, reps: 10, weight: 55, completed: false },
      ]
    },
    {
      id: "free-ex-4",
      name: "Cable Lateral Raise",
      muscle: "Shoulders (Side Delts)",
      sets: 3,
      reps: "12–15 reps",
      targetWeight: "7.5 kg",
      fitness_os_sets: [
        { id: "s10", set_number: 1, reps: 15, weight: 7.5, completed: false },
        { id: "s11", set_number: 2, reps: 14, weight: 7.5, completed: false },
        { id: "s12", set_number: 3, reps: 12, weight: 7.5, completed: false },
      ]
    },
    {
      id: "free-ex-5",
      name: "Rope Triceps Pushdown",
      muscle: "Triceps",
      sets: 3,
      reps: "12–15 reps",
      targetWeight: "22.5 kg",
      fitness_os_sets: [
        { id: "s13", set_number: 1, reps: 15, weight: 22.5, completed: false },
        { id: "s14", set_number: 2, reps: 13, weight: 22.5, completed: false },
        { id: "s15", set_number: 3, reps: 12, weight: 22.5, completed: false },
      ]
    }
  ]
};

export const SAMPLE_FREE_WEEK_DAYS = [
  { day: "Monday", status: "today", isToday: true, name: "Upper Body Strength" },
  { day: "Tuesday", status: "upcoming", isToday: false, name: "Lower Body Hypertrophy" },
  { day: "Wednesday", status: "rest", isToday: false, name: "Rest & Active Recovery" },
  { day: "Thursday", status: "upcoming", isToday: false, name: "Upper Body Hypertrophy" },
  { day: "Friday", status: "upcoming", isToday: false, name: "Lower Body Power" },
  { day: "Saturday", status: "upcoming", isToday: false, name: "Cardio & Core Endurance" },
  { day: "Sunday", status: "rest", isToday: false, name: "Rest & Full Recovery" },
];
