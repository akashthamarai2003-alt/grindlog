"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Camera, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";

export default function AddScanPage() {
  const [images, setImages] = useState<{ front?: string, side?: string, back?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (field: 'front' | 'side' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Data URL (base64)
    const reader = new FileReader();
    reader.onload = (event) => {
      setImages(prev => ({ ...prev, [field]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field: 'front' | 'side' | 'back') => {
    setImages(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    if (!images.front && !images.side && !images.back) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/fitness/add-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImage: images.front,
          sideImage: images.side,
          backImage: images.back,
        }),
      });

      if (!res.ok) throw new Error("Failed to upload scans");
      
      router.push("/fitness/progress");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to upload scans. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const PhotoSlot = ({ title, field, inputRef }: { title: string, field: 'front' | 'side' | 'back', inputRef: React.RefObject<HTMLInputElement> }) => {
    const hasImage = !!images[field];
    
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">{title}</span>
        
        <div 
          onClick={() => !hasImage && inputRef.current?.click()}
          className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 transition-all ${
            hasImage ? 'border-[#ADFF00] bg-black' : 'border-white/10 bg-white/5 border-dashed cursor-pointer hover:bg-white/10'
          }`}
        >
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[field]} alt={title} className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(field); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-white/20 mb-2" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tap to Add</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={inputRef} 
            onChange={handleFileChange(field)}
            className="hidden" 
          />
        </div>
      </div>
    );
  };

  return (
    <FitnessGuard>
      <FitnessShell>
        <div className="w-full flex flex-col h-full bg-[#0A1108] p-5 pb-32 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/fitness/progress" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Body Scan</h1>
            <div className="w-10" />
          </div>

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-[#ADFF00]" />
            </div>
            <p className="text-xs font-medium text-white/50 px-4">Upload a front, side, or back photo to track your visual transformation. For best results, use similar lighting.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <PhotoSlot title="Front View" field="front" inputRef={frontInputRef} />
            <PhotoSlot title="Side View" field="side" inputRef={sideInputRef} />
          </div>
          <div className="grid grid-cols-2 gap-4 justify-center">
            <PhotoSlot title="Back View" field="back" inputRef={backInputRef} />
          </div>

          <button 
            onClick={handleSave}
            disabled={isLoading || (!images.front && !images.side && !images.back)}
            className="w-full h-14 mt-8 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Upload Scans"}
          </button>
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
