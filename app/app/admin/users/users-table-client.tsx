"use client";

import { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, Mail, Receipt } from "lucide-react";
import DeleteUserButton from "./delete-user-button";
import SendMailModal from "./send-mail-modal";
import PaymentHistoryModal from "./payment-history-modal";

interface UserWithDetails {
  id: string;
  display_name?: string;
  email?: string;
  xp?: number;
  level?: number;
  created_at: string;
  is_premium?: boolean;
  premium_level?: string;
  premium_tier?: string;
  premium_expires_at?: string;
  subscriptions?: any[];
  paymentId?: string;
  actualPaidAmount: number;
  has_fitness_profile?: boolean;
  fitness_onboarding_completed?: boolean;
  fitness_is_premium?: boolean;
  fitness_premium_tier?: string;
  fitness_premium_level?: string;
  fitness_premium_expires_at?: string;
}

// Unified helper to extract subscription attributes regardless of profile source
function getUserSubscriptionInfo(user: UserWithDetails) {
  const isPremium = Boolean(
    user.fitness_is_premium || 
    user.is_premium || 
    (user.actualPaidAmount && user.actualPaidAmount > 0)
  );
  
  const tier = (user.fitness_premium_tier || user.premium_tier || (isPremium ? "monthly" : "")).toLowerCase();
  const level = (user.fitness_premium_level || user.premium_level || (isPremium ? "pro" : "")).toLowerCase();
  const expiresAt = user.fitness_premium_expires_at || user.premium_expires_at;

  return { isPremium, tier, level, expiresAt };
}

function getPlanName(tier?: string, level?: string) {
  const levelName = level === 'core' ? 'Core' : 'Pro';
  return `Monthly - ${levelName}`;
}

// Calculate remaining duration accurately (days left in 30-day monthly cycle)
function getDurationInfo(isPremium?: boolean, tier?: string, expiresAtStr?: string | null) {
  if (!isPremium) {
    return { status: 'none' as const, text: '-', daysRemaining: 0, totalDays: 0 };
  }
  if (tier === 'lifetime') {
    return { status: 'lifetime' as const, text: 'Lifetime Access', daysRemaining: 0, totalDays: 0 };
  }
  if (!expiresAtStr) {
    return { status: 'none' as const, text: '-', daysRemaining: 0, totalDays: 0 };
  }

  const expiresAt = new Date(expiresAtStr);
  if (isNaN(expiresAt.getTime())) {
    return { status: 'none' as const, text: '-', daysRemaining: 0, totalDays: 0 };
  }

  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { status: 'expired' as const, text: 'Expired', daysRemaining: 0, totalDays: 0 };
  }

  const totalDays = 30; // Fitness OS plans are all monthly (30-day cycles)
  const safeDaysRemaining = Math.min(daysRemaining, totalDays);

  return {
    status: 'active' as const,
    text: `${safeDaysRemaining} of ${totalDays} Days Left`,
    daysRemaining: safeDaysRemaining,
    totalDays
  };
}

// Deterministic date formatting immune to client/SSR locale mismatch
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
}

export default function UsersTableClient({ users }: { users: UserWithDetails[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | "core" | "pro">("all");
  const [validityFilter, setValidityFilter] = useState<"all" | "active" | "expiring_soon" | "expired">("all");

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedMailUsers, setSelectedMailUsers] = useState<UserWithDetails[] | null>(null);
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<UserWithDetails | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchName = user.display_name?.toLowerCase().includes(query);
        const matchEmail = user.email?.toLowerCase().includes(query);
        if (!matchName && !matchEmail) return false;
      }

      const sub = getUserSubscriptionInfo(user);
      const durationInfo = getDurationInfo(sub.isPremium, sub.tier, sub.expiresAt);

      // 2. Status filter
      if (statusFilter === "paid" && !sub.isPremium) return false;
      if (statusFilter === "unpaid" && sub.isPremium) return false;

      // 3. Plan Level filter
      if (levelFilter === "pro" && (!sub.isPremium || sub.level !== "pro")) return false;
      if (levelFilter === "core" && (!sub.isPremium || sub.level !== "core")) return false;

      // 4. Validity filter
      if (validityFilter === "active" && durationInfo.status !== "active" && durationInfo.status !== "lifetime") return false;
      if (validityFilter === "expiring_soon" && (durationInfo.status !== "active" || durationInfo.daysRemaining > 7)) return false;
      if (validityFilter === "expired" && durationInfo.status !== "expired") return false;

      return true;
    });
  }, [users, searchQuery, statusFilter, levelFilter, validityFilter]);

  const filteredRevenue = useMemo(() => {
    return filteredUsers.reduce((acc, user) => acc + (user.actualPaidAmount || 0), 0);
  }, [filteredUsers]);

  // Compute active filters
  const activeFilterCount = (searchQuery.trim() !== "" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (levelFilter !== "all" ? 1 : 0) +
    (validityFilter !== "all" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLevelFilter("all");
    setValidityFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100 min-h-[36px]">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter className="w-4 h-4 text-gray-500" />
            <span>Filter Users</span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredUsers.length} of {users.length}
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                {activeFilterCount} Active Filter{activeFilterCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Reset Filters Button: Always visible, active styling when filters applied */}
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
              hasActiveFilters
                ? "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 cursor-pointer"
                : "text-gray-400 bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
            }`}
            title={hasActiveFilters ? "Reset all filters to default" : "No active filters to reset"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter Inputs Grid (4 columns evenly distributed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className={`w-full pl-9 pr-8 py-2 text-xs font-medium rounded-lg outline-none transition-all placeholder:text-gray-400 ${
                searchQuery.trim() !== ""
                  ? "bg-blue-50/40 border-2 border-blue-500 text-blue-900 font-semibold"
                  : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex flex-col gap-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg outline-none transition-all cursor-pointer ${
                statusFilter !== "all"
                  ? "bg-blue-50/40 border-2 border-blue-500 text-blue-900"
                  : "bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white"
              }`}
            >
              <option value="all">Status: All (Paid & Unpaid)</option>
              <option value="paid">Status: Paid Members</option>
              <option value="unpaid">Status: Unpaid / Free</option>
            </select>
          </div>

          {/* Plan Level Dropdown */}
          <div className="flex flex-col gap-1">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg outline-none transition-all cursor-pointer ${
                levelFilter !== "all"
                  ? "bg-blue-50/40 border-2 border-blue-500 text-blue-900"
                  : "bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white"
              }`}
            >
              <option value="all">Level: All Levels (Pro & Core)</option>
              <option value="pro">Level: Pro Tier</option>
              <option value="core">Level: Core Tier</option>
            </select>
          </div>

          {/* Subscription Validity Filter Dropdown (Replaces legacy 6-month/lifetime duration) */}
          <div className="flex flex-col gap-1">
            <select
              value={validityFilter}
              onChange={(e) => setValidityFilter(e.target.value as any)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg outline-none transition-all cursor-pointer ${
                validityFilter !== "all"
                  ? "bg-blue-50/40 border-2 border-blue-500 text-blue-900"
                  : "bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:bg-white"
              }`}
            >
              <option value="all">Validity: All Members</option>
              <option value="active">Validity: Active Subscriptions</option>
              <option value="expiring_soon">Validity: Expiring Soon (≤ 7 Days)</option>
              <option value="expired">Validity: Expired Subscriptions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedUserIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs sm:text-sm font-bold text-blue-800">{selectedUserIds.size} User(s) Selected</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedUserIds(new Set())}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => {
                const usersToMail = users.filter(u => selectedUserIds.has(u.id));
                setSelectedMailUsers(usersToMail);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex-1 sm:flex-none cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Bulk Mail</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-10 text-center">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id))}
                    onChange={(e) => {
                      const newSet = new Set(selectedUserIds);
                      if (e.target.checked) {
                        filteredUsers.forEach(u => newSet.add(u.id));
                      } else {
                        filteredUsers.forEach(u => newSet.delete(u.id));
                      }
                      setSelectedUserIds(newSet);
                    }}
                  />
                </th>
                <th className="px-6 py-4 w-[250px]">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Onboarding</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Paid Amount</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const sub = getUserSubscriptionInfo(user);
                const planName = getPlanName(sub.tier, sub.level);
                const durationInfo = getDurationInfo(sub.isPremium, sub.tier, sub.expiresAt);

                return (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedUserIds.has(user.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedUserIds);
                          if (e.target.checked) newSet.add(user.id);
                          else newSet.delete(user.id);
                          setSelectedUserIds(newSet);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                          {user.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.display_name}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.isPremium ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            {planName}
                          </span>
                          <span className="text-[11px] text-green-600 font-semibold">Active</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.fitness_onboarding_completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                          ✓ Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4" suppressHydrationWarning>
                      {durationInfo.status === 'lifetime' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Lifetime Access
                        </span>
                      ) : durationInfo.status === 'expired' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Expired
                        </span>
                      ) : durationInfo.status === 'active' ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">
                            {durationInfo.text}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {durationInfo.daysRemaining} days remaining
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono flex flex-col gap-1">
                        {(user.paymentId || "-").split(", ").map((pid: string, i: number) => (
                          <span key={i}>{pid}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-green-600">
                        {user.actualPaidAmount > 0 ? `₹${user.actualPaidAmount}` : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600" suppressHydrationWarning>
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedHistoryUser(user)}
                          title="View Payment History"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 text-xs font-semibold border border-green-200 transition-all active:scale-95 shrink-0 cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>History</span>
                        </button>
                        <button
                          onClick={() => setSelectedMailUsers([user])}
                          title="Send Email to User"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 text-xs font-semibold border border-blue-200 transition-all active:scale-95 shrink-0 cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>Mail</span>
                        </button>
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.display_name}
                          userEmail={user.email}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
              <tr>
                <td colSpan={6} className="px-6 py-4 text-right uppercase text-xs text-gray-600">
                  Filtered Revenue:
                </td>
                <td className="px-6 py-4 text-green-600 font-bold text-sm">
                  ₹{filteredRevenue.toLocaleString()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <p className="text-base font-semibold text-gray-700">No matching users found</p>
              <p className="text-xs text-gray-400">
                No users match the currently selected filter criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Mail Modal */}
      {selectedMailUsers && (
        <SendMailModal
          users={selectedMailUsers}
          onClose={() => setSelectedMailUsers(null)}
        />
      )}

      {/* Payment History Modal */}
      {selectedHistoryUser && (
        <PaymentHistoryModal
          user={selectedHistoryUser}
          onClose={() => setSelectedHistoryUser(null)}
        />
      )}
    </div>
  );
}
