import { createServerSupabase } from "@/lib/services/supabase/server";
import { getOrCreateDailyQuests } from "@/app/actions/gamification";
import { redirect } from "next/navigation";
import { QuestsClient } from "./client";

export default async function QuestsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const dailyQuests = await getOrCreateDailyQuests();

  return <QuestsClient initialQuests={dailyQuests} />;
}
