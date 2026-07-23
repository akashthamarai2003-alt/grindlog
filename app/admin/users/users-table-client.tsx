"use client";

import { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, Crown, Shield, Calendar, DollarSign, Mail } from "lucide-react";
import DeleteUserButton from "./delete-user-button";
import SendMailModal from "./send-mail-modal";

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
  subscriptions?: any[];
  paymentId: string;
  actualPaidAmount: number;
}

export default function UsersTableClient({ users }: { users: UserWithDetails[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | "pro" | "core">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "monthly" | "six_months" | "lifetime">("all");
  const [selectedMailUser, setSelectedMailUser] = useState<UserWithDetails | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.display_name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      // 2. Status filter
      if (statusFilter === "paid" && !user.is_premium) return false;
      if (statusFilter === "unpaid" && user.is_premium) return false;

      // 3. Level filter
      if (levelFilter === "pro" && (!user.is_premium || user.premium_level !== "pro")) return false;
      if (levelFilter === "core" && (!user.is_premium || user.premium_level !== "core")) return false;

      // 4. Tier filter
      if (tierFilter === "monthly" && (!user.is_premium || user.premium_tier !== "monthly")) return false;
      if (tierFilter === "six_months" && (!user.is_premium || user.premium_tier !== "six_months")) return false;
      if (tierFilter === "lifetime" && (!user.is_premium || user.premium_tier !== "lifetime")) return false;

      return true;
    });
  }, [users, searchQuery, statusFilter, levelFilter, tierFilter]);

  const filteredRevenue = useMemo(() => {
    return filteredUsers.reduce((acc, user) => acc + (user.actualPaidAmount || 0), 0);
  }, [filteredUsers]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || levelFilter !== "all" || tierFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLevelFilter("all");
    setTierFilter("all");
  };

  const getPlanName = (tier?: string, level?: string) => {
    let baseName = 'Pro';
    if (tier === 'monthly') baseName = 'Monthly';
    if (tier === 'six_months') baseName = '6 Months';
    if (tier === 'lifetime') baseName = 'Lifetime';
    
    const levelName = level ? (level.charAt(0).toUpperCase() + level.slice(1)) : 'Pro';
    return `${baseName} - ${levelName}`;
  };

  const getDurationString = (user: UserWithDetails) => {
    if (!user.is_premium) return "-";
    if (user.premium_tier === 'lifetime') return "Lifetime";
    if (!user.premium_expires_at) return "-";

    const expiresAt = new Date(user.premium_expires_at);
    const now = new Date();
    
    let totalDays = 30;
    if (user.premium_tier === 'six_months') totalDays = 180;
    
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return "Expired";
    
    const daysElapsed = totalDays - daysLeft;
    const safeDaysElapsed = Math.max(0, Math.min(daysElapsed, totalDays));
    
    return `${safeDaysElapsed}/${totalDays} Days`;
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter className="w-4 h-4 text-gray-500" />
            <span>Filter Users</span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredUsers.length} of {users.length}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex flex-col gap-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800"
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
              className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800"
            >
              <option value="all">Level: All Levels (Pro & Core)</option>
              <option value="pro">Level: Pro Tier</option>
              <option value="core">Level: Core Tier</option>
            </select>
          </div>

          {/* Plan Duration / Tier Dropdown */}
          <div className="flex flex-col gap-1">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800"
            >
              <option value="all">Duration: All Tiers</option>
              <option value="monthly">Duration: Monthly</option>
              <option value="six_months">Duration: 6 Months</option>
              <option value="lifetime">Duration: Lifetime</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Stats</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Paid Amount</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const planName = user.premium_tier ? getPlanName(user.premium_tier, user.premium_level) : 'Pro';
                const paymentId = user.paymentId;
                const paidAmount = user.actualPaidAmount;
                const durationString = getDurationString(user);

                return (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
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
                      <div className="flex flex-col text-xs space-y-1">
                        <span>XP: {user.xp || 0}</span>
                        <span>Level: {user.level || 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_premium ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                              {planName}
                            </span>
                          </div>
                          
                          {/* Render AI Message Top Ups if they exist */}
                          {user.subscriptions?.filter((s: any) => s.plan === 'ai_messages_10').map((sub: any, i: number) => (
                             <span key={sub.id || i} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                               + AI Messages (₹10)
                             </span>
                          ))}
                          <span className="text-xs text-gray-400 capitalize mt-0.5">Active</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            Unpaid
                          </span>
                          
                          {/* Render AI Message Top Ups if they exist */}
                          {user.subscriptions?.filter((s: any) => s.plan === 'ai_messages_10').map((sub: any, i: number) => (
                             <span key={sub.id || i} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                               + AI Messages (₹10)
                             </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-700">
                        {durationString}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono flex flex-col gap-1">
                        {paymentId.split(", ").map((pid: string, i: number) => (
                          <span key={i}>{pid}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-green-600">
                        {paidAmount > 0 ? `₹${paidAmount}` : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMailUser(user)}
                          title="Send Email to User"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 text-xs font-semibold border border-blue-200 transition-all active:scale-95 shrink-0"
                        >
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                          <span>Send Mail</span>
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
                <td colSpan={4} className="px-6 py-4 text-right uppercase text-xs">Filtered Revenue:</td>
                <td className="px-6 py-4 text-green-600">₹{filteredRevenue.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <p className="text-base font-semibold text-gray-700">No matching users found</p>
              <p className="text-xs text-gray-400">Try adjusting or resetting your filter criteria.</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Mail Modal */}
      {selectedMailUser && (
        <SendMailModal
          user={selectedMailUser}
          onClose={() => setSelectedMailUser(null)}
        />
      )}
    </div>
  );
}
