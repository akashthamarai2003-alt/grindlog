"use client";

import { useState, useMemo } from "react";
import { Search, Dumbbell, X, Check, Filter, RotateCcw } from "lucide-react";
import { grantFitnessOSAction, revokeFitnessOSAction } from "../users/grant-fitness-action";

interface FitnessUser {
  id: string;
  display_name?: string;
  email?: string;
  is_premium?: boolean;
  premium_tier?: string;
  premium_level?: string;
  premium_expires_at?: string;
  profile_created_at: string;
  // Fitness OS fields
  has_started_fitness: boolean;
  onboarding_completed?: boolean;
  goal?: string;
  fitness_level?: string;
  fitness_joined_at?: string;
}

export default function FitnessUsersTableClient({ users }: { users: FitnessUser[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "started">("all");
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ userId: string; text: string; ok: boolean } | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!u.display_name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
      }
      if (statusFilter === "active" && !u.is_premium) return false;
      if (statusFilter === "inactive" && u.is_premium) return false;
      return true;
    });
  }, [users, searchQuery, statusFilter]);

  const handleGrant = async (userId: string) => {
    setGrantingId(userId);
    setMessage(null);
    const res = await grantFitnessOSAction(userId, "monthly", "pro");
    setGrantingId(null);
    setMessage({ userId, text: res.success ? "✅ Fitness OS Pro granted!" : `❌ ${res.error}`, ok: !!res.success });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Revoke Fitness OS access from this user?")) return;
    setGrantingId(userId);
    setMessage(null);
    const res = await revokeFitnessOSAction(userId);
    setGrantingId(null);
    setMessage({ userId, text: res.success ? "✅ Access revoked." : `❌ ${res.error}`, ok: !!res.success });
    setTimeout(() => setMessage(null), 3000);
  };

  const getDaysRemaining = (u: FitnessUser) => {
    if (!u.is_premium) return null;
    if (u.premium_tier === "lifetime") return "Lifetime";
    if (!u.premium_expires_at) return null;
    const diff = new Date(u.premium_expires_at).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Expired";
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">Filter Users</span>
          <span className="text-xs bg-lime-100 text-lime-700 font-bold px-2 py-0.5 rounded-full">
            {users.filter(u => u.is_premium).length} Premium
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
            {filteredUsers.length} of {users.length}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-lime-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-lime-500 text-gray-700"
          >
            <option value="all">All Fitness Users</option>
            <option value="active">Active (Premium)</option>
            <option value="inactive">No Access</option>
          </select>
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Fitness OS</th>
                <th className="px-6 py-3">Goal</th>
                <th className="px-6 py-3">Onboarded</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Expires</th>
                <th className="px-6 py-3">Signed Up</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const daysLeft = getDaysRemaining(user);
                const isExpired = daysLeft === "Expired";
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-lime-100 border-2 border-lime-200 flex items-center justify-center text-lime-700 font-black text-sm shrink-0">
                          {user.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{user.display_name || "—"}</div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Fitness OS Status */}
                    <td className="px-6 py-4">
                      {user.is_premium && !isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-lime-100 text-lime-700 border border-lime-200">
                          <Check className="w-3 h-3" /> Premium
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200">
                          Expired
                        </span>
                      ) : user.has_started_fitness ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-200">
                          <Dumbbell className="w-3 h-3" /> On App
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                          Not Started
                        </span>
                      )}
                    </td>

                    {/* Goal */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {user.goal ? (
                          <>
                            <div className="font-semibold capitalize">{user.goal.replace(/_/g, ' ')}</div>
                            {user.fitness_level && <div className="text-gray-400 capitalize">{user.fitness_level}</div>}
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>

                    {/* Onboarded */}
                    <td className="px-6 py-4">
                      {!user.has_started_fitness ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : user.onboarding_completed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      ) : (
                        <span className="text-xs text-orange-400 font-semibold">In Progress</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      {user.is_premium ? (
                        <div className="text-xs font-semibold text-gray-700 capitalize">
                          {user.premium_tier?.replace("_", " ")} · {user.premium_level?.toUpperCase()}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Expires */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold ${isExpired ? "text-orange-500" : "text-gray-600"}`}>
                        {daysLeft || "—"}
                      </span>
                    </td>

                    {/* Signed Up */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(user.profile_created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {!user.is_premium || isExpired ? (
                          <button
                            onClick={() => handleGrant(user.id)}
                            disabled={grantingId === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-50 hover:bg-lime-100 text-lime-700 text-xs font-bold border border-lime-300 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Dumbbell className="h-3.5 w-3.5" />
                            {grantingId === user.id ? "Granting..." : "Grant Fitness OS"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevoke(user.id)}
                            disabled={grantingId === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            {grantingId === user.id ? "Revoking..." : "Revoke Access"}
                          </button>
                        )}
                        {message?.userId === user.id && (
                          <span className={`text-[10px] font-bold ${message.ok ? "text-lime-600" : "text-red-500"}`}>
                            {message.text}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No users match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
