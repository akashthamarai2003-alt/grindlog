"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  User,
  Globe,
  Target,
  Utensils,
  Dumbbell,
  HeartPulse,
  CreditCard,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Activity,
  Calendar,
  Sparkles
} from "lucide-react";

export interface FitnessUserDetails {
  userId: string;
  name: string;
  email: string;
  gender: string;
  age: number | string;
  language: string;
  country: string;
  goal: string;
  fitnessLevel: string;
  height: number | string;
  weight: number | string;
  targetWeight: number | string;
  bmi?: number | string;
  dietPreference: string;
  foodEnvironment: string;
  nutritionBudget: string;
  mealsPerDay: string;
  trainingLocation: string;
  equipment: string[];
  trainingDaysPerWeek: number | string;
  workoutDurationMinutes: number | string;
  preferredTrainingTime: string;
  physicalProblems: string[];
  exerciseLimitations: string[];
  currentPainSeverity?: number | string;
  sleepDuration: string;
  dailySteps: string;
  isPremium: boolean;
  premiumTier: string;
  premiumLevel: string;
  premiumExpiresAt?: string;
  joinedAt: string;
}

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

export default function FitnessTableClient({ users }: { users: FitnessUserDetails[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<FitnessUserDetails | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query (Name, Email, Language, Goal)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchLang = u.language.toLowerCase().includes(q);
        const matchGoal = u.goal.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchLang && !matchGoal) return false;
      }

      // 2. Gender filter
      if (genderFilter !== "all" && u.gender.toLowerCase() !== genderFilter.toLowerCase()) {
        return false;
      }

      // 3. Goal filter
      if (goalFilter !== "all" && !u.goal.toLowerCase().includes(goalFilter.toLowerCase())) {
        return false;
      }

      // 4. Diet filter
      if (dietFilter !== "all" && !u.dietPreference.toLowerCase().includes(dietFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, genderFilter, goalFilter, dietFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || genderFilter !== "all" || goalFilter !== "all" || dietFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setGenderFilter("all");
    setGoalFilter("all");
    setDietFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter className="w-4 h-4 text-gray-500" />
            <span>Filter Fitness Profiles</span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {filteredUsers.length} of {users.length} Users
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 4-Column Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, language..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:bg-white transition-all text-gray-800 cursor-pointer"
          >
            <option value="all">Gender: All</option>
            <option value="male">Gender: Male</option>
            <option value="female">Gender: Female</option>
          </select>

          {/* Goal Filter */}
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:bg-white transition-all text-gray-800 cursor-pointer"
          >
            <option value="all">Goal: All Goals</option>
            <option value="cut">Goal: Cut / Fat Loss</option>
            <option value="muscle">Goal: Build Muscle</option>
            <option value="gain">Goal: Gain Weight</option>
          </select>

          {/* Diet Filter */}
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-500 focus:bg-white transition-all text-gray-800 cursor-pointer"
          >
            <option value="all">Diet: All Preferences</option>
            <option value="vegetarian">Diet: Vegetarian</option>
            <option value="non-vegetarian">Diet: Non-Vegetarian</option>
            <option value="eggetarian">Diet: Eggetarian</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Demographics</th>
                <th className="px-6 py-4">Goal & Target</th>
                <th className="px-6 py-4">Diet & Meals</th>
                <th className="px-6 py-4">Plan Status</th>
                <th className="px-6 py-4">Joined OS</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  {/* User Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Demographics: Gender, Age, Language */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                        <span>{user.gender}</span>
                        <span>•</span>
                        <span>{user.age} yrs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="font-medium">{user.language}</span>
                        {user.country && <span className="text-gray-400">({user.country.trim()})</span>}
                      </div>
                    </div>
                  </td>

                  {/* Goal & Weight Target */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {user.goal}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {user.weight} → {user.targetWeight}
                      </span>
                    </div>
                  </td>

                  {/* Diet & Food Environment */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {user.dietPreference}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {user.foodEnvironment} • {user.mealsPerDay}
                      </span>
                    </div>
                  </td>

                  {/* Plan Status */}
                  <td className="px-6 py-4">
                    {user.isPremium ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Monthly - {user.premiumLevel === "core" ? "Core" : "Pro"}
                        </span>
                        <span className="text-[11px] text-green-600 font-semibold">Active</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        Free / Unpaid
                      </span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-xs text-gray-600" suppressHydrationWarning>
                    {formatDate(user.joinedAt)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold border border-green-200 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <span>Full Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <p className="text-base font-semibold text-gray-700">No fitness profiles matched</p>
              <p className="text-xs text-gray-400">Try loosening your search or filter options.</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-base shadow-xs">
                  {selectedUser.name.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Section 1: Demographics & Identity */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-green-700">
                  <User className="w-4 h-4" /> Personal & Language
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Gender</span>
                    <span className="font-bold text-gray-800">{selectedUser.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Age</span>
                    <span className="font-bold text-gray-800">{selectedUser.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Language</span>
                    <span className="font-bold text-gray-800">{selectedUser.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Country</span>
                    <span className="font-bold text-gray-800">{selectedUser.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Joined Platform</span>
                    <span className="font-bold text-gray-800" suppressHydrationWarning>{formatDate(selectedUser.joinedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Subscription</span>
                    <span className="font-bold text-purple-700">
                      {selectedUser.isPremium ? `Monthly - ${selectedUser.premiumLevel.toUpperCase()}` : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Body & Biometrics */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-blue-700">
                  <Target className="w-4 h-4" /> Goal & Body Biometrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Primary Goal</span>
                    <span className="font-bold text-blue-700">{selectedUser.goal}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Current Weight</span>
                    <span className="font-bold text-gray-800">{selectedUser.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Target Weight</span>
                    <span className="font-bold text-emerald-600">{selectedUser.targetWeight}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Height / BMI</span>
                    <span className="font-bold text-gray-800">{selectedUser.height} cm (BMI {selectedUser.bmi})</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Workout & Training Setup */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-amber-700">
                  <Dumbbell className="w-4 h-4" /> Workout Setup & Equipment
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Experience Level</span>
                    <span className="font-bold text-gray-800">{selectedUser.fitnessLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Training Location</span>
                    <span className="font-bold text-gray-800">{selectedUser.trainingLocation}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Schedule</span>
                    <span className="font-bold text-gray-800">
                      {selectedUser.trainingDaysPerWeek} days/week • {selectedUser.workoutDurationMinutes} mins
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[11px]">Available Equipment</span>
                    <span className="font-bold text-gray-800">
                      {selectedUser.equipment.length > 0 ? selectedUser.equipment.join(", ") : "Standard Gym Setup"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Preferred Time</span>
                    <span className="font-bold text-gray-800">{selectedUser.preferredTrainingTime}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Nutrition & Diet */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-emerald-700">
                  <Utensils className="w-4 h-4" /> Diet & Nutrition Setup
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Diet Type</span>
                    <span className="font-bold text-gray-800">{selectedUser.dietPreference}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Food Environment</span>
                    <span className="font-bold text-gray-800">{selectedUser.foodEnvironment}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Meals Per Day</span>
                    <span className="font-bold text-gray-800">{selectedUser.mealsPerDay}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Monthly Budget</span>
                    <span className="font-bold text-gray-800">{selectedUser.nutritionBudget}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Sleep Duration</span>
                    <span className="font-bold text-gray-800">{selectedUser.sleepDuration}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Daily Steps Baseline</span>
                    <span className="font-bold text-gray-800">{selectedUser.dailySteps}</span>
                  </div>
                </div>
              </div>

              {/* Section 5: Health & Pain Points */}
              {(selectedUser.physicalProblems.length > 0 || selectedUser.exerciseLimitations.length > 0) && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 text-rose-700">
                    <ShieldAlert className="w-4 h-4" /> Health & Pain Limitations
                  </h4>
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
                    {selectedUser.physicalProblems.length > 0 && (
                      <div>
                        <span className="text-rose-700 font-bold block text-[11px]">Reported Discomfort:</span>
                        <span className="text-gray-700">
                          {selectedUser.physicalProblems.join(", ")} (Pain Severity: {selectedUser.currentPainSeverity}/10)
                        </span>
                      </div>
                    )}
                    {selectedUser.exerciseLimitations.length > 0 && (
                      <div>
                        <span className="text-rose-700 font-bold block text-[11px]">Exercise Limitations:</span>
                        <span className="text-gray-700">{selectedUser.exerciseLimitations.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
