"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { exportWorkoutHistoryCSV } from "@/app/actions/export";
import { toast } from "sonner";

export function WorkoutHistoryExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportWorkoutHistoryCSV();
      if (!result.success || !result.csv) {
        toast.error(result.error || "Failed to export");
        return;
      }
      if (result.rowCount === 0) {
        toast.info("No completed workout sets to export yet.");
        return;
      }

      // Trigger browser download
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `grindlog-workouts-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${result.rowCount} sets to CSV`);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 w-full bg-[#111A10] border border-white/10 hover:border-[#ADFF00]/30 hover:bg-[#ADFF00]/5 transition-all px-4 py-3 rounded-xl disabled:opacity-50"
    >
      {isExporting
        ? <Loader2 className="w-4 h-4 text-[#ADFF00] animate-spin" />
        : <FileSpreadsheet className="w-4 h-4 text-[#ADFF00]" />
      }
      <span className="text-xs font-black text-white/80 uppercase tracking-widest">
        {isExporting ? "Exporting..." : "Export CSV"}
      </span>
      {!isExporting && <Download className="w-3.5 h-3.5 text-white/40 ml-auto" />}
    </button>
  );
}
