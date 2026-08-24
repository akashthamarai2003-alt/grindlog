"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, Dumbbell, Target, ChevronRight, Check, Plus } from "lucide-react";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import Link from "next/link";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

interface LibraryExercise {
  id: string;
  slug: string;
  name: string;
  target_muscle: string;
  equipment: string;
  level: string;
  image_urls: string[];
}

export function ExerciseBrowser() {
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  
  const [showFilters, setShowFilters] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const MUSCLES = ["All", "chest", "shoulders", "biceps", "triceps", "middle back", "lower back", "lats", "abdominals", "glutes", "quadriceps", "hamstrings", "calves", "forearms"];
  const EQUIPMENT = ["All", "body only", "machine", "barbell", "dumbbell", "cable", "bands", "kettlebells"];

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("q", debouncedSearch);
      if (muscleFilter !== "All") params.append("muscle", muscleFilter);
      if (equipmentFilter !== "All") params.append("equipment", equipmentFilter);
      params.append("limit", "100"); // keep it simple for now without pagination

      const res = await fetch(`/api/fitness/exercises?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch (e) {
      console.error(e);
      toast.error("Could not load exercises");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, muscleFilter, equipmentFilter]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/fitness/exercises/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed");
      toast.success(data.message);
      fetchExercises();
    } catch (e: any) {
      toast.error(e.message || "Seed failed");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0A1108] overflow-y-auto pb-32">
      <div className="px-5 pt-8">
        <div className="flex items-center justify-between">
          <WorkoutHeader title="Exercise Library" backUrl="/fitness" />
          <Link 
            href="/fitness/exercises/custom"
            className="flex items-center gap-1.5 bg-[#ADFF00]/10 text-[#ADFF00] border border-[#ADFF00]/20 px-3 py-1.5 rounded-full hover:bg-[#ADFF00]/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Custom</span>
          </Link>
        </div>
        
        {/* Search & Filter Bar */}

        <div className="flex flex-col gap-3 mt-6 sticky top-0 bg-[#0A1108]/90 backdrop-blur-xl z-20 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search exercises..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111A10] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#ADFF00] transition-colors placeholder:text-white/30"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'bg-[#111A10] border-white/10 text-white/50 hover:bg-white/5'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="bg-[#111A10] border border-white/10 rounded-xl p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Muscle</span>
                <div className="flex flex-wrap gap-2">
                  {MUSCLES.map(m => (
                    <button
                      key={m}
                      onClick={() => setMuscleFilter(m)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${muscleFilter === m ? 'bg-[#ADFF00] text-black border-[#ADFF00]' : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      <span className="capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-full h-px bg-white/5" />
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Equipment</span>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map(e => (
                    <button
                      key={e}
                      onClick={() => setEquipmentFilter(e)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${equipmentFilter === e ? 'bg-[#ADFF00] text-black border-[#ADFF00]' : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      <span className="capitalize">{e}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="mt-6 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#ADFF00] animate-spin mb-4" />
            </div>
          ) : exercises.length === 0 ? (
            <div className="bg-[#111A10] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center">
              <Dumbbell className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-lg font-black text-white mb-2">No exercises found</h3>
              <p className="text-sm font-medium text-white/50 mb-6">
                Try adjusting your filters or search term. If the library is empty, you may need to seed the database.
              </p>
              <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-[#baff22] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Seed Exercise Database
              </button>
            </div>
          ) : (
            exercises.map(ex => (
              <Link 
                href={`/fitness/exercises/${ex.slug}`} 
                key={ex.id}
                className="bg-[#111A10] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
              >
                {ex.image_urls && ex.image_urls[0] ? (
                  <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/10">
                    {/* Using standard img to avoid Next.js domains config issues with external URLs */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ex.image_urls[0]} alt={ex.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-6 h-6 text-white/20" />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-black text-white capitalize line-clamp-1">{ex.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#ADFF00]">
                      <Target className="w-3 h-3" /> {ex.target_muscle}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                      <Dumbbell className="w-3 h-3" /> {ex.equipment}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
