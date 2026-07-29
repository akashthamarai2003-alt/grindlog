import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";

export default async function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("premium_level")
    .eq("id", user.id)
    .single();

  if (profile?.premium_level !== "pro") {
    return redirect("/payment");
  }

  return <>{children}</>;
}
