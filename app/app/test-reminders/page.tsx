import { RemindersClient } from "@/app/(fitness)/reminders/reminders-client";

export const dynamic = "force-dynamic";

export default async function TestRemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "populated" } = await searchParams;

  const mockReminders = view === "empty" ? [] : [
    {
      id: "rem-1",
      type: "Workout",
      time: "07:30",
      days: [1, 2, 3, 4, 5],
    },
    {
      id: "rem-2",
      type: "Breakfast",
      time: "09:00",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      id: "rem-3",
      type: "Hydration",
      time: "11:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      isWaterSchedule: true,
    },
    {
      id: "rem-4",
      type: "Hydration",
      time: "14:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      isWaterSchedule: true,
    },
    {
      id: "rem-5",
      type: "Dinner",
      time: "20:30",
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  ];

  return (
    <RemindersClient
      initialEnabled={view !== "disabled"}
      initialReminders={mockReminders}
    />
  );
}
