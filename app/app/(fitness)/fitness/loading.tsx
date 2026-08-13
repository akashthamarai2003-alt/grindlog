import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] gap-4 bg-[#0A1108]">
      <Loader2 className="w-10 h-10 text-[#ADFF00] animate-spin mb-2" />
      <p className="text-xs font-black tracking-widest text-[#ADFF00] uppercase animate-pulse">Loading...</p>
    </div>
  );
}
