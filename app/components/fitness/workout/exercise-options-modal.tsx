"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Replace, FileText, PlaySquare, Weight, 
  PlusSquare, SkipForward, AlertTriangle, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExerciseOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  exerciseId?: string;
  sessionId?: string;
  workoutId?: string;
}

type ModalView = 'options' | 'replace_reason' | 'replace_alternatives' | 'pain_warning';

export function ExerciseOptionsModal({ isOpen, onClose, exerciseName, exerciseId, sessionId, workoutId }: ExerciseOptionsModalProps) {
  const router = useRouter();
  const [view, setView] = useState<ModalView>('options');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<{name: string, target: string, match: string}[]>([]);

  const resetAndClose = () => {
    setView('options');
    setSelectedReason(null);
    setAlternatives([]);
    setIsLoading(false);
    onClose();
  };

  const reasons = [
    "No equipment",
    "Too difficult",
    "Don't like it",
    "Pain/discomfort",
    "Other"
  ];

  const handleReasonSelect = async (reason: string) => {
    setSelectedReason(reason);
    if (reason === "Pain/discomfort") {
      setView('pain_warning');
      return;
    } 
    
    // Fetch alternatives
    setView('replace_alternatives');
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exerciseId}/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlternatives(data.alternatives);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate alternatives");
      setView('options'); // Go back on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlternativeSelect = async (altName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exerciseId}/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "replace", newExerciseName: altName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`${altName} replaced successfully`);
      resetAndClose();
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to replace exercise");
      setIsLoading(false);
    }
  };

  const handleAddSet = async () => {
    if (!sessionId || !exerciseId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exerciseId}/sets`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("New set added!");
      resetAndClose();
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to add set");
      setIsLoading(false);
    }
  };

  const handleSkipExercise = async () => {
    if (!sessionId || !exerciseId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exerciseId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Exercise skipped for today");
      resetAndClose();
      router.push(`/fitness/workout/${workoutId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to skip exercise");
      setIsLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    resetAndClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const focusWeightInput = () => {
    resetAndClose();
    setTimeout(() => {
      // Find the first uncompleted weight input
      const inputs = document.querySelectorAll('input[type="number"][placeholder="-"]');
      for (let i = 0; i < inputs.length; i++) {
        if (!inputs[i].hasAttribute('disabled')) {
          (inputs[i] as HTMLInputElement).focus();
          break;
        }
      }
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0A1108] border-t border-white/10 sm:border sm:rounded-[24px] rounded-t-[32px] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />
            
            {/* View: Main Options */}
            {view === 'options' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black text-white tracking-widest uppercase">
                    Exercise Options
                  </h2>
                  <button onClick={resetAndClose} disabled={isLoading} className="p-2 rounded-full hover:bg-white/5">
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setView('replace_reason')} disabled={isLoading} className="w-full flex items-center justify-between p-4 bg-[#111A10] border border-white/5 hover:border-[#ADFF00]/50 rounded-2xl group transition-all">
                    <div className="flex items-center gap-3">
                      <Replace className="w-5 h-5 text-[#ADFF00]" />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Replace Exercise</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#ADFF00] transition-colors" />
                  </button>
                  
                  <button onClick={() => scrollToSection("how-to-perform")} disabled={isLoading} className="w-full flex items-center gap-3 p-4 bg-[#111A10] border border-white/5 hover:bg-white/5 rounded-2xl transition-all">
                    <FileText className="w-5 h-5 text-white/50" />
                    <span className="text-sm font-bold text-white/80 uppercase tracking-wider">View Instructions</span>
                  </button>
                  
                  <button onClick={() => scrollToSection("watch-demo")} disabled={isLoading} className="w-full flex items-center gap-3 p-4 bg-[#111A10] border border-white/5 hover:bg-white/5 rounded-2xl transition-all">
                    <PlaySquare className="w-5 h-5 text-white/50" />
                    <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Watch Demo</span>
                  </button>

                  <div className="w-full h-px bg-white/5 my-2" />

                  <button onClick={focusWeightInput} disabled={isLoading} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all">
                    <Weight className="w-5 h-5 text-white/50" />
                    <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Change Weight</span>
                  </button>
                  
                  <button onClick={handleAddSet} disabled={isLoading} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 text-white/50 animate-spin" /> : <PlusSquare className="w-5 h-5 text-white/50" />}
                    <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Add Set</span>
                  </button>
                  
                  <button onClick={handleSkipExercise} disabled={isLoading} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-2xl transition-all group">
                    {isLoading ? <Loader2 className="w-5 h-5 text-red-500/70 animate-spin" /> : <SkipForward className="w-5 h-5 text-red-500/70 group-hover:text-red-500" />}
                    <span className="text-sm font-bold text-red-500/80 group-hover:text-red-500 uppercase tracking-wider">Skip Exercise</span>
                  </button>
                </div>
              </>
            )}

            {/* View: Replace Reason */}
            {view === 'replace_reason' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h2 className="text-[10px] font-black text-[#ADFF00] tracking-widest uppercase mb-1">
                      Replace {exerciseName}
                    </h2>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      Why?
                    </h3>
                  </div>
                  <button onClick={() => setView('options')} className="p-2 rounded-full hover:bg-white/5">
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {reasons.map((reason) => (
                    <button 
                      key={reason}
                      onClick={() => handleReasonSelect(reason)}
                      className="w-full flex items-center justify-between p-4 bg-[#111A10] border border-white/5 hover:border-white/20 rounded-2xl transition-all"
                    >
                      <span className="text-sm font-bold text-white/90 uppercase tracking-wider">{reason}</span>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* View: Pain Warning */}
            {view === 'pain_warning' && (
              <>
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                    Stop this movement
                  </h2>
                  <p className="text-sm font-medium text-white/60 leading-relaxed mb-8 px-4">
                    If you are experiencing pain or sharp discomfort, please stop performing this exercise immediately. We will skip it for today. We recommend seeking professional assessment before loading this movement pattern again.
                  </p>

                  <button 
                    onClick={handleSkipExercise}
                    disabled={isLoading}
                    className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] transition-all flex justify-center"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Skip Exercise"}
                  </button>
                  
                  <button 
                    onClick={() => handleReasonSelect("Other")} // Fetch alternatives bypassing warning
                    disabled={isLoading}
                    className="w-full mt-3 bg-transparent text-white/50 font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Show Alternatives Anyway
                  </button>
                </div>
              </>
            )}

            {/* View: AI Alternatives */}
            {view === 'replace_alternatives' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h2 className="text-[10px] font-black text-[#ADFF00] tracking-widest uppercase mb-1">
                      Reason: {selectedReason}
                    </h2>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      AI Alternatives
                    </h3>
                  </div>
                  <button onClick={() => { setView('replace_reason'); setIsLoading(false); }} disabled={isLoading} className="p-2 rounded-full hover:bg-white/5">
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 min-h-[200px]">
                  {isLoading && alternatives.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 text-[#ADFF00] animate-spin mb-4" />
                      <p className="text-sm font-bold text-white/50 tracking-wider">Generating alternatives...</p>
                    </div>
                  ) : (
                    alternatives.map((alt, idx) => (
                      <div key={idx} className="w-full flex flex-col p-4 bg-[#111A10] border border-white/5 rounded-2xl group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-wide">{alt.name}</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Target: {alt.target}</span>
                          </div>
                          <span className="text-xs font-black text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-1 rounded-md">{alt.match || "High"} Match</span>
                        </div>
                        
                        <button 
                          onClick={() => handleAlternativeSelect(alt.name)}
                          disabled={isLoading}
                          className="w-full bg-white/5 hover:bg-[#ADFF00] hover:text-black text-white/70 font-black uppercase tracking-widest py-3 rounded-xl transition-all duration-300 text-xs mt-2 disabled:opacity-50"
                        >
                          {isLoading ? "Replacing..." : "Select"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
