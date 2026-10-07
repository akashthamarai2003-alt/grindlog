"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { Camera, Image as ImageIcon, Loader2, ArrowRight, X, Sparkles, ChevronLeft, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BodyScanCameraModal } from "./body-scan-camera-modal";
import { useFitnessTheme } from "@/components/fitness/fitness-theme-provider";

type ScanImage = {
  file: File;
  previewUrl: string;
};

const base64ToFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface ScannerFlowProps {
  isRenew?: boolean;
}

export function ScannerFlow({ isRenew: propIsRenew }: ScannerFlowProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useFitnessTheme();
  const isWhite = theme === "white";
  
  const isRenew = propIsRenew ?? (typeof window !== "undefined" && window.location.search.includes("renew=true"));

  const [images, setImages] = useState<{
    front: ScanImage | null;
    side: ScanImage | null;
    back: ScanImage | null;
    goal: ScanImage | null;
  }>({
    front: null,
    side: null,
    back: null,
    goal: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraModalView, setCameraModalView] = useState<keyof typeof images | null>(null);

  const handleCameraCapture = (base64: string) => {
    if (!cameraModalView) return;
    const file = base64ToFile(base64, `${cameraModalView}.jpg`);
    setImages(prev => ({
      ...prev,
      [cameraModalView]: { file, previewUrl: base64 }
    }));
    setCameraModalView(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, view: keyof typeof images) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size is 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImages(prev => ({
      ...prev,
      [view]: { file, previewUrl }
    }));
  };

  const removeImage = (view: keyof typeof images) => {
    setImages(prev => ({ ...prev, [view]: null }));
  };

  const handleSkip = () => {
    router.push(isRenew ? "/report?renew=true" : "/report");
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Compress images to Base64
      const base64Images: Record<string, string> = {};
      const views: (keyof typeof images)[] = ['front', 'side', 'back', 'goal'];

      for (const view of views) {
        const img = images[view];
        if (img) {
          const compressed = await compressImage(img.file);
          base64Images[view] = compressed;
        }
      }

      // Call API to analyze with Gemini Vision
      const queryParam = isRenew ? "?mode=checkin" : "";
      const res = await fetch(`/api/fitness-ai/scanner${queryParam}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-checkin": isRenew ? "true" : "false"
        },
        body: JSON.stringify({ images: base64Images })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze photos.");
      }

      toast.success(isRenew ? "Month-end scan complete! Preparing your progress report..." : "Analysis complete! Preparing your report...");
      router.push(isRenew ? "/report?renew=true" : "/report");

    } catch (error: any) {
      toast.error(error.message || "An error occurred during photo analysis.");
      setIsProcessing(false);
    }
  };

  const hasAnyImage = !!images.front || !!images.side || !!images.back || !!images.goal;

  const ViewUploader = ({ view, label, optional }: { view: keyof typeof images, label: string, optional?: boolean }) => {
    const img = images[view];
    const isReady = !!img;

    return (
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
          isWhite ? "text-gray-700" : "text-gray-300"
        }`}>
          <span className="flex items-center gap-1.5">
            {label}
            {isReady && <span className={`text-[10px] font-mono font-normal ${isWhite ? "text-emerald-600 font-bold" : "text-[#ADFF00]"}`}>✓ Ready</span>}
          </span>
          {optional && <span className="text-[10px] text-gray-400 lowercase font-normal">(optional)</span>}
        </label>

        <div className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden border transition-all ${
          isReady
            ? isWhite
              ? "border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.15)] bg-emerald-50/30"
              : "border-[#ADFF00]/50 shadow-[0_0_20px_rgba(173,255,0,0.18)] bg-[#0A100A]"
            : isWhite
              ? "border-gray-200 hover:border-emerald-500/50 bg-white shadow-xs"
              : "border-white/10 hover:border-white/20 bg-gradient-to-b from-[#111611] to-[#0A0D0A]"
        }`}>
          {isReady ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt={view} className="w-full h-full object-cover" />
              
              {/* Top-Right Floating Retake/Delete Controls */}
              <div className={`absolute top-2 right-2 z-30 flex items-center gap-1 backdrop-blur-md border p-1 rounded-full shadow-lg ${
                isWhite ? "bg-white/95 border-gray-200" : "bg-black/80 border-white/15"
              }`}>
                <button 
                  type="button"
                  onClick={() => setCameraModalView(view)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isWhite
                      ? "text-emerald-700 hover:bg-emerald-600 hover:text-white"
                      : "text-[#ADFF00] hover:bg-[#ADFF00] hover:text-black"
                  }`}
                  title="Retake photo with camera"
                >
                  <Camera size={11} strokeWidth={2.5} />
                </button>
                <button 
                  type="button"
                  onClick={() => removeImage(view)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  title="Remove photo"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>

              {/* Ready Badge bottom indicator */}
              <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md ${
                  isWhite ? "bg-emerald-600 text-white" : "bg-[#ADFF00] text-black"
                }`}>
                  <CheckCircle2 size={10} strokeWidth={3} />
                  Captured
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Viewfinder Corner Reticles */}
              <div className="absolute inset-2 pointer-events-none border border-transparent rounded-xl">
                <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l rounded-tl-sm ${
                  isWhite ? "border-emerald-600/50" : "border-[#ADFF00]/40"
                }`} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r rounded-tr-sm ${
                  isWhite ? "border-emerald-600/50" : "border-[#ADFF00]/40"
                }`} />
                <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l rounded-bl-sm ${
                  isWhite ? "border-emerald-600/50" : "border-[#ADFF00]/40"
                }`} />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r rounded-br-sm ${
                  isWhite ? "border-emerald-600/50" : "border-[#ADFF00]/40"
                }`} />
              </div>

              {/* Center subtle scan icon placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 shadow-inner border ${
                  isWhite
                    ? "bg-gray-50 border-gray-200 text-gray-500"
                    : "bg-white/[0.03] border-white/10 text-gray-400"
                }`}>
                  <Camera size={20} strokeWidth={1.75} className={isWhite ? "text-gray-500" : "text-gray-400"} />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isWhite ? "text-gray-700" : "text-gray-300"
                }`}>
                  {label}
                </span>
                <span className={`text-[9px] font-mono mt-0.5 ${
                  isWhite ? "text-gray-400" : "text-gray-500"
                }`}>
                  TAP TO CAPTURE
                </span>
              </div>

              {/* Floating Glass Capsule Action Dock */}
              <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-center">
                <div className={`flex items-center gap-1 backdrop-blur-xl border p-1 rounded-xl shadow-lg w-full ${
                  isWhite
                    ? "bg-white/95 border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    : "bg-black/85 border-white/15 shadow-xl"
                }`}>
                  <button
                    type="button"
                    onClick={() => setCameraModalView(view)}
                    className={`flex-1 min-w-0 py-1.5 px-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 group ${
                      isWhite
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white"
                        : "bg-[#ADFF00]/15 hover:bg-[#ADFF00] text-[#ADFF00] hover:text-black"
                    }`}
                  >
                    <Camera size={11} className="shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Camera</span>
                  </button>

                  <div className={`w-px h-3 shrink-0 ${isWhite ? "bg-gray-200" : "bg-white/10"}`} />

                  <label className={`flex-1 min-w-0 py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 group ${
                    isWhite
                      ? "text-gray-700 hover:text-black hover:bg-gray-100"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}>
                    <Upload size={11} className={`shrink-0 transition-colors ${
                      isWhite ? "text-gray-500 group-hover:text-black" : "text-gray-400 group-hover:text-white"
                    }`} />
                    <span className="truncate">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, view)}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto px-4 sm:px-5 pb-8 transition-colors ${
      isWhite ? "text-gray-900" : "text-white"
    }`}>
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => router.back()}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
            isWhite
              ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-xs"
              : "bg-[#121E12] border-[#1A2619] text-gray-300 hover:bg-[#1A2619]"
          }`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
          isWhite
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-[#ADFF00] bg-[#ADFF00]/10 border-[#ADFF00]/20"
        }`}>
          <Sparkles size={12} />
          <span>{isRenew ? "Month 2 Renewal Flow" : "Luna AI Vision"}</span>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* 3-Step Linear Funnel Indicator */}
      {isRenew && (
        <div className={`grid grid-cols-3 gap-1.5 border rounded-2xl p-1.5 mb-5 text-center text-[10px] font-bold ${
          isWhite ? "bg-white border-gray-200" : "bg-[#121E12] border-[#1A2619]"
        }`}>
          <div className={`rounded-xl py-1.5 flex items-center justify-center gap-1 shadow-xs ${
            isWhite ? "bg-emerald-600 text-white" : "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)]"
          }`}>
            <span>1. Body Scan</span>
          </div>
          <div className={`py-1.5 ${isWhite ? "text-gray-500" : "text-gray-400"}`}>2. Report</div>
          <div className={`py-1.5 ${isWhite ? "text-gray-500" : "text-gray-400"}`}>3. Month 2 Plan</div>
        </div>
      )}

      {/* Main Hero Title */}
      <div className="mb-5">
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight mb-1.5 uppercase ${
          isWhite ? "text-gray-900" : "text-white"
        }`}>
          {isRenew ? "Month-End Transformation Scan" : "AI Body Scanner"}
        </h1>
        <p className={`text-xs leading-relaxed ${isWhite ? "text-gray-500" : "text-gray-400"}`}>
          {isRenew 
            ? "Upload updated photos to compare your physical transformation against Day 1. Luna AI will analyze muscle definition, posture, and calibrate your Month 2 meso-cycle."
            : "Upload photos for Gemini AI to analyze your posture and body composition. This helps us create a hyper-personalized plan."}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className={`flex items-center gap-2 mb-4 p-2.5 rounded-xl border text-[11px] ${
        isWhite ? "bg-white border-gray-200 text-gray-600" : "bg-black/40 border-white/5 text-gray-400"
      }`}>
        <ShieldCheck size={14} className={`shrink-0 ${isWhite ? "text-emerald-600" : "text-[#ADFF00]"}`} />
        <span>100% Private. Photos are analyzed instantly in-memory and never stored on public servers.</span>
      </div>

      {/* Grid of View Uploaders */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
        <ViewUploader view="front" label="Front View" />
        <ViewUploader view="side" label="Side View" optional={isRenew} />
        <ViewUploader view="back" label="Back View" optional />
        <ViewUploader view="goal" label="Goal Physique" optional />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-8">
        {hasAnyImage ? (
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className={`w-full py-3.5 active:scale-[0.98] transition-all font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-lg ${
              isWhite
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                : "bg-[#ADFF00] hover:bg-[#c4ff33] text-black shadow-[0_0_25px_rgba(173,255,0,0.35)]"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${isWhite ? "text-white" : "text-black"}`} />
                <span>Analyzing Transformation with Gemini AI...</span>
              </>
            ) : (
              <>
                <span>Analyze Progress & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className={`w-full py-3.5 border active:scale-[0.98] transition-all font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 ${
              isWhite
                ? "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                : "bg-[#121E12] hover:bg-[#1A2619] border-[#1A2619] text-gray-300 hover:text-white"
            }`}
          >
            <span>Skip Photo Scan & Continue</span>
            <ArrowRight size={14} className={isWhite ? "text-gray-500" : "text-gray-400"} />
          </button>
        )}

        {hasAnyImage && (
          <button
            onClick={handleSkip}
            disabled={isProcessing}
            className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium"
          >
            Skip photo analysis and use workout data only
          </button>
        )}
      </div>

      {/* AI Body Scan Live Camera Modal */}
      {cameraModalView && (
        <BodyScanCameraModal
          isOpen={Boolean(cameraModalView)}
          onClose={() => setCameraModalView(null)}
          onCapture={handleCameraCapture}
          viewType={cameraModalView === "goal" ? "goal" : cameraModalView === "front" ? "front" : cameraModalView === "back" ? "back" : "side"}
          title={`${cameraModalView.toUpperCase()} VIEW BODY SCAN`}
        />
      )}
    </div>
  );
}
