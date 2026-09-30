import { NotificationsClient } from "@/components/fitness/notifications/notifications-client";
import { FitnessNotificationItem } from "@/app/actions/fitness-notifications";

export const dynamic = "force-dynamic";

export default async function TestNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "populated" } = await searchParams;

  const mockNotifications: FitnessNotificationItem[] = view === "empty" ? [] : [
    {
      id: "notif-workout-1",
      user_id: "test-user-123",
      title: "Today's Grind: Chest & Triceps Hypertrophy",
      body: "Your daily session is queued and ready. Tap to track your working sets and progressive overload.",
      type: "workout",
      link: "/workout",
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "notif-nutrition-1",
      user_id: "test-user-123",
      title: "Daily Fuel Targets 🎯",
      body: "Daily Target: 2,200 kcal & 150g protein. Log your meals to fuel muscle recovery and energy.",
      type: "nutrition",
      link: "/nutrition",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif-sub-1",
      user_id: "test-user-123",
      title: "⚡ GrindLog Pro Active",
      body: "Your monthly membership is active until Oct 28, 2026. All workouts and AI features are unlocked.",
      type: "subscription",
      link: "/profile/billing",
      read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "notif-support-1",
      user_id: "test-user-123",
      title: "💬 Support Request Resolved",
      body: "Your ticket 'Subscription payment verification' has been marked resolved.",
      type: "support",
      link: "/support",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <NotificationsClient
      initialNotifications={mockNotifications}
      initialUnreadCount={unreadCount}
      userName="Atharva"
    />
  );
}
