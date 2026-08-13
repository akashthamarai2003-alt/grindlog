"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Ruler } from "lucide-react";
import Link from "next/link";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";

export default function LogMeasurementsPage() {
  const [measurements, setMeasurements] = useState({
    waist: "",
    chest: "",
    hip: "",
    neck: "",
    left_arm: "",
    right_arm: "",
    left_thigh: "",
    right_thigh: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    // Only proceed if at least one measurement is filled
    if (Object.values(measurements).every(val => !val)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/fitness/log-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measurements),
      });

      if (!res.ok) throw new Error("Failed to save measurements");
      
      router.push("/fitness/progress");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save measurements. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, field }: { label: string, field: keyof typeof measurements }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl mb-3">
      <span className="text-sm font-bold text-white/80 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={measurements[field]}
          onChange={(e) => setMeasurements({ ...measurements, [field]: e.target.value })}
          placeholder="0.0"
          className="bg-transparent text-xl font-black text-[#ADFF00] outline-none w-20 text-right placeholder:text-[#ADFF00]/20"
        />
        <span className="text-xs font-bold text-white/40">cm</span>
      </div>
    </div>
  );

  return (
    <FitnessGuard>
      <FitnessShell>
        <div className="w-full flex flex-col h-full bg-[#0A1108] p-5 pb-32 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/fitness/progress" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Measurements</h1>
            <div className="w-10" />
          </div>

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Ruler className="w-8 h-8 text-[#ADFF00]" />
            </div>
            <p className="text-xs font-medium text-white/50">Log your tape measurements in centimeters to track your body recomposition accurately.</p>
          </div>

          <div className="flex flex-col">
            <InputField label="Waist" field="waist" />
            <InputField label="Chest" field="chest" />
            <InputField label="Hip" field="hip" />
            <InputField label="Neck" field="neck" />
            <InputField label="Left Arm" field="left_arm" />
            <InputField label="Right Arm" field="right_arm" />
            <InputField label="Left Thigh" field="left_thigh" />
            <InputField label="Right Thigh" field="right_thigh" />
          </div>

          <button 
            onClick={handleSave}
            disabled={isLoading || Object.values(measurements).every(val => !val)}
            className="w-full h-14 mt-6 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Measurements"}
          </button>
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
