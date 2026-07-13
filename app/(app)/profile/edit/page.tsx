"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/services/supabase/client";
import { springs } from "@/animations/springs";

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(user?.display_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      // @ts-ignore
      .update({ display_name: name })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    // Update local state
    setUser({ ...user, display_name: name });
    setIsSaving(false);
    router.push("/profile");
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-40 pt-4 safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex items-center gap-4"
      >
        <Link 
          href="/profile" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Edit Profile
        </h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.1 }}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Display Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-[var(--color-bg-secondary)] px-5 py-4 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] transition-all font-medium placeholder:font-normal"
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Email Address
            </label>
            <input 
              type="email" 
              value={user?.email || ""}
              disabled
              className="w-full rounded-2xl bg-[var(--color-bg-secondary)]/50 px-5 py-4 text-[var(--color-text-secondary)] cursor-not-allowed font-medium"
            />
            <p className="text-xs text-[var(--color-text-tertiary)] px-2">
              Email cannot be changed currently.
            </p>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)] px-2">{error}</p>
          )}

          <button 
            type="submit"
            disabled={isSaving || !name.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] py-4 font-bold text-white shadow-lg shadow-[var(--color-accent-green)]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  );
}
