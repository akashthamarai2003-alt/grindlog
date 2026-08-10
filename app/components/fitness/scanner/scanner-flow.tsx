"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/services/supabase/client";
import { Camera, Image as ImageIcon, Loader2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type ScanImage = {
  file: File;
  previewUrl: string;
  path?: string; // Path in supabase storage
};

export function ScannerFlow() {
  const router = useRouter();
  const supabase = createClient();
  
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
    router.push("/fitness/plan/generating");
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload images to Supabase Storage
      const uploadedPaths: Record<string, string> = {};
      const views: (keyof typeof images)[] = ['front', 'side', 'back', 'goal'];

      for (const view of views) {
        const img = images[view];
        if (img) {
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${view}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('fitness_os_scans')
            .upload(fileName, img.file, { 
              upsert: true,
              contentType: img.file.type
            });

          if (uploadError) {
            console.error(`Upload error for ${view}:`, uploadError);
            throw new Error(`Failed to upload ${view} photo.`);
          }
          
          uploadedPaths[view] = fileName;
        }
      }

      // Call API to analyze with Gemini
      const res = await fetch("/api/fitness-ai/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: uploadedPaths })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze photos.");
      }

      toast.success("Analysis complete! Generating your personalized plan...");
      router.push("/fitness/plan/generating");

    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
      setIsProcessing(false);
    }
  };

  const hasAnyImage = !!images.front || !!images.side || !!images.back || !!images.goal;

  const ViewUploader = ({ view, label, optional }: { view: keyof typeof images, label: string, optional?: boolean }) => {
    const img = images[view];
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          {label} {optional && <span className="text-gray-400 font-normal">(Optional)</span>}
        </label>
        {img ? (
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt={view} className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(view)}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 mb-2" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-emerald-600">Upload Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, view)} />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Body Scanner</h1>
        <p className="text-gray-500">
          Upload photos for Gemini AI to analyze your posture and body composition. 
          This helps us create a hyper-personalized plan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <ViewUploader view="front" label="Front View" />
        <ViewUploader view="side" label="Side View" />
        <ViewUploader view="back" label="Back View" />
        <ViewUploader view="goal" label="Goal Physique" optional />
      </div>

      <div className="space-y-4">
        {hasAnyImage ? (
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                Analyze & Generate Plan <ArrowRight size={20} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-white font-bold rounded-2xl flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(17,24,39,0.2)]"
          >
            Skip & Generate Plan
          </button>
        )}
      </div>
    </div>
  );
}
