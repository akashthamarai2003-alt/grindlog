import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { redirect } from "next/navigation";
import ClientAppLayout from "./client-layout";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, premium_expires_at")
      .eq("id", user.id)
      .single();

    if (!profile?.is_premium) {
      redirect("/payment");
    }

    // Check if subscription has expired
    if (profile.premium_expires_at && new Date(profile.premium_expires_at) < new Date()) {
      const adminClient = createAdminClient();
      await adminClient
        .from("profiles")
        .update({ is_premium: false, premium_tier: "monthly", premium_level: "core" })
        .eq("id", user.id);
        
      redirect("/payment?expired=true");
    }
  }

  return <ClientAppLayout>{children}</ClientAppLayout>;
}
