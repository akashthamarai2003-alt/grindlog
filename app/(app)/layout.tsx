import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import ClientAppLayout from "./client-layout";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    if (!profile?.is_premium) {
      redirect("/payment");
    }
  }

  return <ClientAppLayout>{children}</ClientAppLayout>;
}
