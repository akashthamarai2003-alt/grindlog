import { createServerSupabase } from "@/lib/services/supabase/server";
import { getOrCreateAllQuests } from "@/app/actions/gamification";
import { redirect } from "next/navigation";
import { QuestsClient } from "./client";

export default async function QuestsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const allQuests = await getOrCreateAllQuests();

  return <QuestsClient initialQuests={allQuests} />;
}
