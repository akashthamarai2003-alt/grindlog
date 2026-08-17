"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Camera, ImagePlus, X } from "lucide-react";
import Link from "next/link";

export default function AddScanPage() {
  const [images, setImages] = useState<{ front?: string, left?: string, right?: string, back?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (field: 'front' | 'left' | 'right' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Data URL (base64)
    const reader = new FileReader();
    reader.onload = (event) => {
      setImages(prev => ({ ...prev, [field]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
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

  const PhotoSlot = ({ title, field, inputRef }: { title: string, field: 'front' | 'left' | 'right' | 'back', inputRef: React.RefObject<HTMLInputElement> }) => (
    <div className="relative">
      <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-center">{title}</label>
      <div 
        onClick={() => !images[field] && triggerUpload(field)}
        className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${images[field] ? 'border-[#ADFF00] bg-[#ADFF00]/10 cursor-default' : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50 cursor-pointer'}`}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileChange(field)} 
          className="hidden" 
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
          <div className="flex flex-col items-center gap-2">
            <ImagePlus size={24} className="text-gray-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tap to Add</span>
          </div>
        )}
      </div>
    </div>
  );

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
