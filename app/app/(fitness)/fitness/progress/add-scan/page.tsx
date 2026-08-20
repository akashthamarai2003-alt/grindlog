"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, ImagePlus, Loader2, X, User } from "lucide-react";
import Link from "next/link";
import frontImg from "@/assets/images/placeholder-front.png";
import backImg from "@/assets/images/placeholder-back.png";
import leftImg from "@/assets/images/placeholder-left.png";
import rightImg from "@/assets/images/placeholder-right.png";

export default function AddScanPage() {
  const [images, setImages] = useState<{ front?: string, left?: string, right?: string, back?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [processingField, setProcessingField] = useState<'front' | 'left' | 'right' | 'back' | null>(null);
  const router = useRouter();
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (field: 'front' | 'left' | 'right' | 'back') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingField(field);
    try {
      const compressedBase64 = await compressImage(file);
      setImages(prev => ({ ...prev, [field]: compressedBase64 }));
    } catch (err) {
      console.error("Compression failed", err);
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

  const handleSave = async () => {
    if (!images.front && !images.left && !images.right && !images.back) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/fitness/add-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImage: images.front,
          leftImage: images.left,
          rightImage: images.right,
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

  const triggerUpload = (field: 'front' | 'left' | 'right' | 'back') => {
    if (field === 'front') frontInputRef.current?.click();
    if (field === 'left') leftInputRef.current?.click();
    if (field === 'right') rightInputRef.current?.click();
    if (field === 'back') backInputRef.current?.click();
  };

  const PhotoSlot = ({ title, field, inputRef }: { title: string, field: 'front' | 'left' | 'right' | 'back', inputRef: React.RefObject<HTMLInputElement | null> }) => {
    const placeholderSrc = field === 'front' ? frontImg : field === 'back' ? backImg : field === 'left' ? leftImg : rightImg;
    const resolvedSrc = typeof placeholderSrc === 'string' ? placeholderSrc : (placeholderSrc as any).src;
    const isProcessing = processingField === field;

    return (
      <div className="relative">
        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-center">{title}</label>
        <div 
          onClick={() => !images[field] && !isProcessing && triggerUpload(field)}
          className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${images[field] ? 'border-[#ADFF00] bg-[#ADFF00]/10 cursor-default' : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50 cursor-pointer'}`}
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
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors z-20 backdrop-blur-sm"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resolvedSrc}
                  alt={`${title} Reference`}
                  className={`w-full h-full object-cover object-top transition-opacity duration-300 ${isProcessing ? 'opacity-10 blur-sm' : 'opacity-30 hover:opacity-60'}`}
                />
              </div>
              <div className="absolute bottom-4 z-10 flex flex-col items-center justify-center px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-xl transition-all hover:bg-white/10">
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
    <div className="min-h-screen bg-[#0A1108] text-white p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/fitness/progress" className="w-10 h-10 rounded-full bg-[#1A2619] flex items-center justify-center hover:bg-[#ADFF00] hover:text-black transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black">Add Body Scan</h1>
      </div>

      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-[#ADFF00]" />
        </div>
        <p className="text-xs font-medium text-white/50 px-4">Upload your front, left side, right side, and back photos to accurately track your visual transformation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <PhotoSlot title="Front View" field="front" inputRef={frontInputRef} />
        <PhotoSlot title="Left Side" field="left" inputRef={leftInputRef} />
        <PhotoSlot title="Right Side" field="right" inputRef={rightInputRef} />
        <PhotoSlot title="Back View" field="back" inputRef={backInputRef} />
      </div>

      <button 
        onClick={handleSave}
        disabled={isLoading || (!images.front && !images.left && !images.right && !images.back)}
        className="w-full h-14 mt-8 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Upload Scans"}
      </button>
    </div>
  );
}
