"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAdminAction } from "@/app/actions/admin-users";

export default function DeleteUserButton({
  userId,
  userName,
  userEmail,
}: {
  userId: string;
  userName?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const displayName = userName || userEmail || "this user";
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE ${displayName}?\n\nThis action cannot be undone and will delete their account and all associated data from Supabase.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteUserAdminAction(userId);
      if (res.success) {
        toast.success(`User ${displayName} deleted successfully!`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete User"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-semibold border border-red-200 transition-all disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
      ) : (
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      )}
      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
    </button>
  );
}
