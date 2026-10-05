"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, Loader2, X, User, Calendar, CheckCircle2, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { progressClientCache } from "@/lib/api/progress-cache";
import { BodyScanCameraModal } from "@/components/fitness/scanner/body-scan-camera-modal";
import frontImg from "@/assets/images/placeholder-front.png";
import backImg from "@/assets/images/placeholder-back.png";
import leftImg from "@/assets/images/placeholder-left.png";
import rightImg from "@/assets/images/placeholder-right.png";

function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AddScanPage() {
  const [images, setImages] = useState<{ front?: string; left?: string; right?: string; back?: string }>({});
  const [scanDate, setScanDate] = useState(() => getLocalDateString());
  const [isLoading, setIsLoading] = useState(false);
  const [processingField, setProcessingField] = useState<'front' | 'left' | 'right' | 'back' | null>(null);
  const [cameraModalField, setCameraModalField] = useState<'front' | 'left' | 'right' | 'back' | null>(null);
  const router = useRouter();
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

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
      progressClientCache.clear();
      progressClientCache.notifyUpdated();
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
      <div className="relative group">
        <div 
          className={`relative w-full aspect-[3/4] rounded-2xl border transition-all overflow-hidden flex flex-col items-center justify-center ${
            hasImage 
              ? 'border-[#ADFF00] bg-[#ADFF00]/5 shadow-[0_0_20px_rgba(173,255,0,0.12)]' 
              : 'border-white/10 bg-[#0E160E] hover:border-[#ADFF00]/40'
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

          {/* Top Label Badge */}
          <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
              hasImage 
                ? 'bg-[#ADFF00]/20 border-[#ADFF00]/40 text-[#ADFF00]' 
                : 'bg-black/60 border-white/10 text-gray-300'
            }`}>
              {title}
            </span>
            {hasImage && (
              <span className="w-5 h-5 rounded-full bg-[#ADFF00] text-black flex items-center justify-center shadow-md">
                <CheckCircle2 size={11} strokeWidth={3} />
              </span>
            )}
          </div>
          
          {images[field] ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[field]} className="w-full h-full object-cover rounded-xl" alt={title} />
              
              {/* Top-Right Floating Actions */}
              <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/15 p-1 rounded-full shadow-lg">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCameraModalField(field); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#ADFF00] hover:bg-[#ADFF00] hover:text-black transition-all cursor-pointer"
                  title="Retake photo with camera"
                >
                  <Camera size={11} strokeWidth={2.5} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(field); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  title="Remove photo"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Silhouette Reference with dark gradient overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-xl pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resolvedSrc}
                  alt={`${title} Reference`}
                  className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isProcessing ? 'opacity-10 blur-sm' : 'opacity-40 group-hover:opacity-60'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
              </div>

              {/* Viewfinder corner brackets */}
              <div className="absolute inset-2.5 pointer-events-none border border-white/5 rounded-xl">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#ADFF00]/40 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ADFF00]/40 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ADFF00]/40 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#ADFF00]/40 rounded-br-sm" />
              </div>

              {/* Unified Glass Capsule Action Dock */}
              <div className="absolute bottom-2.5 inset-x-2 z-10 flex items-center justify-center">
                <div className="flex items-center gap-1 bg-black/85 backdrop-blur-xl border border-white/15 p-1 rounded-xl shadow-xl w-full">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraModalField(field);
                    }}
                    className="flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#ADFF00]/15 hover:bg-[#ADFF00] text-[#ADFF00] hover:text-black transition-all cursor-pointer active:scale-95 disabled:opacity-50 group"
                  >
                    <Camera size={12} className="shrink-0 transition-transform group-hover:scale-110" />
                    <span>Camera</span>
                  </button>

                  <div className="w-px h-3.5 bg-white/10 shrink-0" />

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerUpload(field);
                    }}
                    className="flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50 group"
                  >
                    {isProcessing ? (
                      <Loader2 size={12} className="animate-spin text-[#ADFF00]" />
                    ) : (
                      <Upload size={11} className="shrink-0 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                    <span>Upload</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white p-5 pb-28 max-w-lg mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center gap-3.5 mb-5">
        <Link href="/progress" className="w-10 h-10 rounded-full bg-[#1A2619] flex items-center justify-center hover:bg-[#ADFF00] hover:text-black transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black">Add Body Scan</h1>
          <p className="text-xs text-white/50 font-medium">Capture your physique to track visual progress</p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-[#111A10] border border-white/10 rounded-2xl p-3.5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} className="text-[#ADFF00]" />
            <span>Scan Date</span>
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Logged in progress history</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setScanDate(todayStr)}
            className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scanDate === todayStr 
                ? 'bg-[#ADFF00] text-black shadow-sm font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setScanDate(yesterdayStr)}
            className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scanDate === yesterdayStr 
                ? 'bg-[#ADFF00] text-black shadow-sm font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yesterday
          </button>
          <input
            type="date"
            value={scanDate}
            max={todayStr}
            onChange={(e) => setScanDate(e.target.value)}
            className="bg-transparent text-center text-xs text-gray-200 font-bold focus:outline-none cursor-pointer py-1"
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

      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <PhotoSlot title="Front View" field="front" inputRef={frontInputRef} />
        <PhotoSlot title="Left Side" field="left" inputRef={leftInputRef} />
        <PhotoSlot title="Right Side" field="right" inputRef={rightInputRef} />
        <PhotoSlot title="Back View" field="back" inputRef={backInputRef} />
      </div>

      {/* Upload Button */}
      <button 
        onClick={handleSave}
        disabled={isLoading || uploadedCount === 0}
        className={`w-full h-14 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg ${
          uploadedCount > 0 
            ? "bg-[#ADFF00] hover:bg-[#baff22] active:scale-[0.98] text-black shadow-[0_0_25px_rgba(173,255,0,0.35)] cursor-pointer" 
            : "bg-white/10 text-gray-500 cursor-not-allowed opacity-50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving Scan...</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>Save Body Scan {uploadedCount > 0 ? `(${uploadedCount}/4)` : ""}</span>
          </>
        )}
      </button>

      {/* AI Body Scan Live Camera Modal */}
      {cameraModalField && (
        <BodyScanCameraModal
          isOpen={Boolean(cameraModalField)}
          onClose={() => setCameraModalField(null)}
          onCapture={(base64) => {
            setImages((prev) => ({ ...prev, [cameraModalField]: base64 }));
            setCameraModalField(null);
            toast.success(`${cameraModalField.charAt(0).toUpperCase() + cameraModalField.slice(1)} view captured`);
          }}
          viewType={cameraModalField}
          title={`${cameraModalField.toUpperCase()} VIEW BODY SCAN`}
        />
      )}
    </div>
  );
}
