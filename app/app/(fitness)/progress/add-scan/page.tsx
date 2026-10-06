"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, Loader2, X, User, Calendar, CheckCircle2, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { progressClientCache } from "@/lib/api/progress-cache";
import { BodyScanCameraModal } from "@/components/fitness/scanner/body-scan-camera-modal";
import { useFitnessTheme } from "@/components/fitness/fitness-theme-provider";
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
  const { theme } = useFitnessTheme();
  const isWhite = theme === "white";
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
          className={`relative w-full aspect-[4/5] rounded-2xl border transition-all overflow-hidden flex flex-col items-center justify-center ${
            hasImage 
              ? isWhite
                ? 'border-emerald-500 bg-emerald-50/30 shadow-[0_4px_16px_rgba(16,185,129,0.15)]'
                : 'border-[#ADFF00] bg-[#ADFF00]/5 shadow-[0_0_20px_rgba(173,255,0,0.12)]' 
              : isWhite
                ? 'border-gray-200 bg-white hover:border-emerald-500/50 shadow-xs'
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
          <div className="absolute top-2 inset-x-2 z-20 flex items-center justify-between pointer-events-none">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
              hasImage 
                ? isWhite
                  ? 'bg-emerald-100/90 border-emerald-300 text-emerald-800'
                  : 'bg-[#ADFF00]/20 border-[#ADFF00]/40 text-[#ADFF00]' 
                : isWhite
                  ? 'bg-white/95 border-gray-200 text-gray-700 shadow-xs'
                  : 'bg-black/70 border-white/10 text-gray-300'
            }`}>
              {title}
            </span>
            {hasImage && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                isWhite ? 'bg-emerald-600 text-white' : 'bg-[#ADFF00] text-black'
              }`}>
                <CheckCircle2 size={11} strokeWidth={3} />
              </span>
            )}
          </div>
          
          {images[field] ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[field]} className="w-full h-full object-cover rounded-xl" alt={title} />
              
              {/* Top-Right Floating Actions */}
              <div className={`absolute top-2 right-2 z-30 flex items-center gap-1 backdrop-blur-md border p-1 rounded-full shadow-lg ${
                isWhite
                  ? 'bg-white/95 border-gray-200'
                  : 'bg-black/80 border-white/15'
              }`}>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCameraModalField(field); }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isWhite
                      ? 'text-emerald-700 hover:bg-emerald-600 hover:text-white'
                      : 'text-[#ADFF00] hover:bg-[#ADFF00] hover:text-black'
                  }`}
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
              {/* Silhouette Reference with theme-adaptive gradient overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-xl pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resolvedSrc}
                  alt={`${title} Reference`}
                  className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                    isProcessing 
                      ? 'opacity-10 blur-sm' 
                      : isWhite 
                        ? 'opacity-85 group-hover:opacity-95' 
                        : 'opacity-45 group-hover:opacity-65'
                  }`}
                />
                <div className={`absolute inset-0 pointer-events-none ${
                  isWhite
                    ? 'bg-gradient-to-t from-white/95 via-white/30 to-transparent'
                    : 'bg-gradient-to-t from-black/90 via-black/20 to-black/35'
                }`} />
              </div>

              {/* Viewfinder corner brackets */}
              <div className="absolute inset-2 pointer-events-none border border-transparent rounded-xl">
                <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l rounded-tl-sm ${
                  isWhite ? 'border-emerald-600/50' : 'border-[#ADFF00]/40'
                }`} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r rounded-tr-sm ${
                  isWhite ? 'border-emerald-600/50' : 'border-[#ADFF00]/40'
                }`} />
                <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l rounded-bl-sm ${
                  isWhite ? 'border-emerald-600/50' : 'border-[#ADFF00]/40'
                }`} />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r rounded-br-sm ${
                  isWhite ? 'border-emerald-600/50' : 'border-[#ADFF00]/40'
                }`} />
              </div>

              {/* Unified Glass Capsule Action Dock */}
              <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-center">
                <div className={`flex items-center gap-1 backdrop-blur-xl border p-1 rounded-xl shadow-lg w-full ${
                  isWhite
                    ? 'bg-white/95 border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                    : 'bg-black/85 border-white/15 shadow-xl'
                }`}>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraModalField(field);
                    }}
                    className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 group ${
                      isWhite
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white'
                        : 'bg-[#ADFF00]/15 hover:bg-[#ADFF00] text-[#ADFF00] hover:text-black'
                    }`}
                  >
                    <Camera size={11} className="shrink-0 transition-transform group-hover:scale-110" />
                    <span>Camera</span>
                  </button>

                  <div className={`w-px h-3 shrink-0 ${isWhite ? 'bg-gray-200' : 'bg-white/10'}`} />

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerUpload(field);
                    }}
                    className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 group ${
                      isWhite
                        ? 'text-gray-700 hover:text-black hover:bg-gray-100'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 size={11} className={`animate-spin ${isWhite ? 'text-emerald-600' : 'text-[#ADFF00]'}`} />
                    ) : (
                      <Upload size={11} className={`shrink-0 transition-colors ${
                        isWhite ? 'text-gray-500 group-hover:text-black' : 'text-gray-400 group-hover:text-white'
                      }`} />
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
    <div className={`min-h-screen p-4 sm:p-5 pb-24 max-w-lg mx-auto transition-colors ${
      isWhite ? 'bg-gray-50 text-gray-900' : 'bg-[#0A1108] text-white'
    }`}>
      {/* Top Navigation */}
      <div className="flex items-center gap-3.5 mb-4">
        <Link 
          href="/progress" 
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isWhite 
              ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-xs' 
              : 'bg-[#1A2619] border border-white/5 text-white hover:bg-[#ADFF00] hover:text-black'
          }`}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className={`text-xl font-black ${isWhite ? 'text-gray-900' : 'text-white'}`}>Add Body Scan</h1>
          <p className={`text-xs font-medium ${isWhite ? 'text-gray-500' : 'text-white/50'}`}>
            Capture your physique to track visual progress
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className={`rounded-2xl p-3.5 mb-4 shadow-sm border ${
        isWhite ? 'bg-white border-gray-200/90' : 'bg-[#111A10] border-white/10'
      }`}>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
            isWhite ? 'text-gray-700' : 'text-gray-300'
          }`}>
            <Calendar size={13} className={isWhite ? 'text-emerald-600' : 'text-[#ADFF00]'} />
            <span>Scan Date</span>
          </span>
          <span className={`text-[10px] font-medium ${isWhite ? 'text-gray-500' : 'text-gray-500'}`}>
            Logged in progress history
          </span>
        </div>
        <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
          isWhite ? 'bg-gray-100/80 border-gray-200/80' : 'bg-black/40 border-white/5'
        }`}>
          <button
            type="button"
            onClick={() => setScanDate(todayStr)}
            className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              scanDate === todayStr 
                ? isWhite
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'bg-[#ADFF00] text-black shadow-sm font-black' 
                : isWhite
                  ? 'text-gray-600 hover:text-black'
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
                ? isWhite
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'bg-[#ADFF00] text-black shadow-sm font-black' 
                : isWhite
                  ? 'text-gray-600 hover:text-black'
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
            className={`bg-transparent text-center text-xs font-bold focus:outline-none cursor-pointer py-1 ${
              isWhite ? 'text-gray-800' : 'text-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Photo Grid Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className={`text-[11px] font-black tracking-widest uppercase ${
          isWhite ? 'text-emerald-700' : 'text-[#ADFF00]'
        }`}>
          Physique Photos ({uploadedCount}/4)
        </span>
        <span className={`text-[11px] ${isWhite ? 'text-gray-500' : 'text-white/40'}`}>
          Front required, others optional
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 mb-5">
        <PhotoSlot title="Front View" field="front" inputRef={frontInputRef} />
        <PhotoSlot title="Left Side" field="left" inputRef={leftInputRef} />
        <PhotoSlot title="Right Side" field="right" inputRef={rightInputRef} />
        <PhotoSlot title="Back View" field="back" inputRef={backInputRef} />
      </div>

      {/* Upload Button */}
      <button 
        onClick={handleSave}
        disabled={isLoading || uploadedCount === 0}
        className={`w-full h-13 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md text-xs sm:text-sm ${
          uploadedCount > 0 
            ? isWhite
              ? "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] cursor-pointer"
              : "bg-[#ADFF00] hover:bg-[#baff22] active:scale-[0.98] text-black shadow-[0_0_25px_rgba(173,255,0,0.35)] cursor-pointer" 
            : isWhite
              ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#131E12] border border-white/10 text-gray-500 cursor-not-allowed shadow-none"
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
