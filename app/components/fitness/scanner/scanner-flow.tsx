"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { Camera, Image as ImageIcon, Loader2, ArrowRight, X, Sparkles, ChevronLeft, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BodyScanCameraModal } from "./body-scan-camera-modal";

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
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
          <span>{label}</span>
          {optional && <span className="text-[10px] text-gray-500 lowercase font-normal">(optional)</span>}
        </label>
        {img ? (
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-[#ADFF00]/40 shadow-[0_0_15px_rgba(173,255,0,0.15)] bg-[#121E12]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt={view} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => setCameraModalView(view)}
                className="p-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md rounded-full text-[#ADFF00] hover:bg-[#ADFF00] hover:text-black transition-all border border-white/10 shadow-md cursor-pointer"
                title="Retake with Camera"
              >
                <Camera size={13} />
              </button>
              <button 
                type="button"
                onClick={() => removeImage(view)}
                className="p-1.5 bg-black/75 hover:bg-black/90 backdrop-blur-md rounded-full text-white/80 hover:bg-red-500 hover:text-white transition-all border border-white/10 shadow-md cursor-pointer"
                title="Remove photo"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#1A2619] hover:border-[#ADFF00]/50 bg-[#121E12]/40 transition-all flex flex-col items-center justify-center p-3 text-center">
            <div 
              onClick={() => setCameraModalView(view)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#ADFF00]/15 flex items-center justify-center text-gray-400 hover:text-[#ADFF00] transition-colors mb-1.5 border border-white/5 hover:border-[#ADFF00]/30 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-300">{label}</span>
            <div className="mt-2.5 flex items-center gap-1 w-full">
              <button
                type="button"
                onClick={() => setCameraModalView(view)}
                className="flex-1 py-1.5 px-1.5 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(173,255,0,0.3)] transition-all cursor-pointer"
              >
                <Camera size={11} />
                <span>Camera</span>
              </button>
              <label className="flex-1 py-1.5 px-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer">
                <Upload size={11} />
                <span>Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, view)} />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 text-white">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#121E12] border border-[#1A2619] flex items-center justify-center hover:bg-[#1A2619] transition-colors text-gray-300"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#ADFF00] bg-[#ADFF00]/10 px-3 py-1 rounded-full border border-[#ADFF00]/20">
          <Sparkles size={12} />
          <span>{isRenew ? "Month 2 Renewal Flow" : "Luna AI Vision"}</span>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* 3-Step Linear Funnel Indicator */}
      {isRenew && (
        <div className="grid grid-cols-3 gap-1.5 bg-[#121E12] border border-[#1A2619] rounded-2xl p-2 mb-6 text-center text-[10px] font-bold">
          <div className="bg-[#ADFF00] text-black rounded-xl py-1.5 flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(173,255,0,0.3)]">
            <span>1. Body Scan</span>
          </div>
          <div className="text-gray-400 py-1.5">2. Report</div>
          <div className="text-gray-400 py-1.5">3. Month 2 Plan</div>
        </div>
      )}

      {/* Main Hero Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 uppercase">
          {isRenew ? "Month-End Transformation Scan" : "AI Body Scanner"}
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          {isRenew 
            ? "Upload updated photos to compare your physical transformation against Day 1. Luna AI will analyze muscle definition, posture, and calibrate your Month 2 meso-cycle."
            : "Upload photos for Gemini AI to analyze your posture and body composition. This helps us create a hyper-personalized plan."}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 mb-5 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400">
        <ShieldCheck size={14} className="text-[#ADFF00] shrink-0" />
        <span>100% Private. Photos are analyzed instantly in-memory and never stored on public servers.</span>
      </div>

      {/* Grid of View Uploaders */}
      <div className="grid grid-cols-2 gap-3 mb-6">
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
            className="w-full py-4 bg-[#ADFF00] hover:bg-[#c4ff33] active:scale-[0.98] transition-all text-black font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)] disabled:opacity-70 disabled:cursor-wait"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
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
            className="w-full py-4 bg-[#121E12] hover:bg-[#1A2619] border border-[#1A2619] active:scale-[0.98] transition-all text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
          >
            <span>Skip Photo Scan & Continue</span>
            <ArrowRight size={14} className="text-gray-400" />
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
