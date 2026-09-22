import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  if (typeof window === "undefined") {
    return createBrowserClient<Database>(url, key) as unknown as SupabaseClient<Database>;
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, key) as unknown as SupabaseClient<Database>;
  }

  return browserClient;
}
