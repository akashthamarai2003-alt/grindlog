"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, Loader2, X, User, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import frontImg from "@/assets/images/placeholder-front.png";
import backImg from "@/assets/images/placeholder-back.png";
import leftImg from "@/assets/images/placeholder-left.png";
import rightImg from "@/assets/images/placeholder-right.png";

export default function AddScanPage() {
  const [images, setImages] = useState<{ front?: string; left?: string; right?: string; back?: string }>({});
  const [scanDate, setScanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingField, setProcessingField] = useState<'front' | 'left' | 'right' | 'back' | null>(null);
  const router = useRouter();
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (event) => {
        const img = new window.Image();
        img.onerror = reject;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 900;
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

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (field: 'front' | 'left' | 'right' | 'back') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingField(field);
    try {
      const compressedBase64 = await compressImage(file);
      setImages(prev => ({ ...prev, [field]: compressedBase64 }));
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} photo added`);
    } catch (err) {
      console.error("Compression failed", err);
      toast.error("Failed to process photo. Please try a different photo.");
    } finally {
      setProcessingField(null);
    }
  };

  const removeImage = (field: 'front' | 'left' | 'right' | 'back') => {
    setImages(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const uploadedCount = [images.front, images.left, images.right, images.back].filter(Boolean).length;

  const handleSave = async () => {
    if (uploadedCount === 0) {
      toast.error("Please add at least one photo (front view recommended)");
      return;
    }
    
    setIsLoading(true);
    const toastId = toast.loading("Saving your body scan...");

    try {
      const res = await fetch("/api/fitness/add-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImage: images.front,
          leftImage: images.left,
          rightImage: images.right,
          backImage: images.back,
          scanDate: scanDate,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload scan");
      }
      
      toast.success("Body scan saved successfully!", { id: toastId });
      router.push("/progress");
      router.refresh();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload scans. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerUpload = (field: 'front' | 'left' | 'right' | 'back') => {
    if (field === 'front') frontInputRef.current?.click();
    if (field === 'left') leftInputRef.current?.click();
    if (field === 'right') rightInputRef.current?.click();
    if (field === 'back') backInputRef.current?.click();
  };

  const PhotoSlot = ({ title, field, inputRef }: { title: string; field: 'front' | 'left' | 'right' | 'back'; inputRef: React.RefObject<HTMLInputElement | null> }) => {
    const placeholderSrc = field === 'front' ? frontImg : field === 'back' ? backImg : field === 'left' ? leftImg : rightImg;
    const resolvedSrc = typeof placeholderSrc === 'string' ? placeholderSrc : (placeholderSrc as any).src;
    const isProcessing = processingField === field;
    const hasImage = Boolean(images[field]);

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</label>
          {hasImage && <CheckCircle2 className="w-3.5 h-3.5 text-[#ADFF00]" />}
        </div>
        <div 
          onClick={() => !images[field] && !isProcessing && triggerUpload(field)}
          className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
            hasImage 
              ? 'border-[#ADFF00] bg-[#ADFF00]/10 cursor-default' 
              : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50 cursor-pointer'
          }`}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange(field)} 
            className="hidden" 
            disabled={isProcessing}
          />
          
          {images[field] ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[field]} className="w-full h-full object-cover rounded-xl" alt={title} />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(field); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500/90 transition-colors z-20 backdrop-blur-sm shadow-md"
                title="Remove photo"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <div className="absolute inset-0 z-0 overflow-hidden rounded-xl pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resolvedSrc}
                  alt={`${title} Reference`}
                  className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isProcessing ? 'opacity-10 blur-sm' : 'opacity-25 hover:opacity-50'}`}
                />
              </div>
              <div className="absolute bottom-4 z-10 flex flex-col items-center justify-center px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-xl transition-all hover:bg-black/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#ADFF00] rounded-full flex items-center justify-center text-black shadow-[0_0_10px_rgba(173,255,0,0.4)]">
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">{isProcessing ? "Loading" : "+ Upload"}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white p-6 pb-28 max-w-lg mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/progress" className="w-10 h-10 rounded-full bg-[#1A2619] flex items-center justify-center hover:bg-[#ADFF00] hover:text-black transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black">Add Body Scan</h1>
          <p className="text-xs text-white/50 font-medium">Capture your physique to track visual progress</p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-[#111A10] border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#ADFF00]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Scan Date</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScanDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              scanDate === todayStr 
                ? 'bg-[#ADFF00] text-black font-extrabold shadow-sm' 
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setScanDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              scanDate === yesterdayStr 
                ? 'bg-[#ADFF00] text-black font-extrabold shadow-sm' 
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            Yesterday
          </button>
          <input
            type="date"
            value={scanDate}
            max={todayStr}
            onChange={(e) => setScanDate(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ADFF00]/50"
          />
        </div>
      </div>

      {/* Photo Grid */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Physique Photos ({uploadedCount}/4)
        </span>
        <span className="text-[11px] text-white/40">Front required, others optional</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <PhotoSlot title="Front View" field="front" inputRef={frontInputRef} />
        <PhotoSlot title="Left Side" field="left" inputRef={leftInputRef} />
        <PhotoSlot title="Right Side" field="right" inputRef={rightInputRef} />
        <PhotoSlot title="Back View" field="back" inputRef={backInputRef} />
      </div>

      {/* Upload Button */}
      <button 
        onClick={handleSave}
        disabled={isLoading || uploadedCount === 0}
        className="w-full h-14 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-[#baff22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#ADFF00]/10"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving Scan...</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>Save Body Scan</span>
          </>
        )}
      </button>
    </div>
  );
}
