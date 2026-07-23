"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import EditPlanModal from "./users/edit-plan-modal";

interface RecentUser {
  id: string;
  display_name?: string;
  email?: string;
  is_premium?: boolean;
  premium_level?: string;
  premium_tier?: string;
  created_at: string;
}

export default function RecentSignupsClient({ users }: { users: RecentUser[] }) {
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {user.display_name}
                </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  {user.is_premium ? (
                    user.premium_level === "pro" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Pro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Core
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                      Unpaid
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedUser(user)}
                    title="Modify Plan & Payment"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 text-xs font-semibold border border-purple-200 transition-all active:scale-95 shrink-0"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-purple-600" />
                    <span>Edit Plan</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditPlanModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
