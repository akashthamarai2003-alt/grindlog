"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  FlipHorizontal, 
  Timer, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Upload,
  Info,
  Loader2
} from "lucide-react";

interface BodyScanCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
  viewType?: "front" | "side" | "left" | "right" | "back" | "goal" | "inspiration";
}

type CameraState = "loading" | "ready" | "error" | "unsupported";

export function BodyScanCameraModal({
  isOpen,
  onClose,
  onCapture,
  title = "AI Body Scan Camera",
  viewType = "front",
}: BodyScanCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [timerDuration, setTimerDuration] = useState<number>(3); // default 3s countdown
  const [countingDown, setCountingDown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const isSwitchingRef = useRef<boolean>(false);
  const activeFacingRef = useRef<"environment" | "user">("environment");

  // Stop current active stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore track stop error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Multi-tier resilient media stream acquisition with device enumeration & exact facingMode
  const requestCameraStream = useCallback(async (facing: "environment" | "user"): Promise<MediaStream> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("UNSUPPORTED_CONTEXT");
    }

    // Tier 1: Check enumerateDevices for physical camera matching (most reliable on Android/iOS)
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        if (videoDevices.length > 1) {
          const targetDevice = videoDevices.find((d) => {
            const label = (d.label || "").toLowerCase();
            if (facing === "environment") {
              return label.includes("back") || label.includes("rear") || label.includes("environment");
            } else {
              return label.includes("front") || label.includes("user") || label.includes("selfie");
            }
          });

          if (targetDevice?.deviceId) {
            try {
              return await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { exact: targetDevice.deviceId },
                  width: { ideal: 1080 },
                  height: { ideal: 1080 },
                },
                audio: false,
              });
            } catch (devErr) {
              console.warn("[Camera] deviceId exact constraint failed, falling to exact facingMode:", devErr);
            }
          }
        }
      }
    } catch (enumErr) {
      console.warn("[Camera] enumerateDevices failed:", enumErr);
    }

    // Tier 2: Exact facingMode (forces Android/iOS to switch cameras)
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: facing },
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (errExact: any) {
      console.warn("[Camera] Tier 2 exact facingMode failed, falling to ideal:", errExact?.name || errExact);
    }

    // Tier 3: Ideal facingMode with flexible resolution
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { min: 480, ideal: 1080 },
          height: { min: 480, ideal: 1080 },
        },
        audio: false,
      });
    } catch (errIdeal: any) {
      console.warn("[Camera] Tier 3 ideal facingMode with resolution failed:", errIdeal?.name || errIdeal);
    }

    // Tier 4: Pure facingMode without resolution locks
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
    } catch (errPure: any) {
      console.warn("[Camera] Tier 4 pure ideal failed:", errPure?.name || errPure);
    }

    // Tier 5: Direct string facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
    } catch (errStr: any) {
      console.warn("[Camera] Tier 5 string facingMode failed, falling to any video:", errStr?.name || errStr);
    }

    // Tier 6: Ultimate fallback to any available video hardware
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }, []);

  // Start camera stream
  const startCamera = useCallback(async (facing: "environment" | "user") => {
    activeFacingRef.current = facing;
    isSwitchingRef.current = true;
    setIsSwitching(true);

    stopStream();
    setCameraState("loading");
    setErrorMessage(null);
    setCapturedImage(null);

    // Give hardware camera sensor 200ms to cleanly release in Android Camera HAL
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const stream = await requestCameraStream(facing);

      // Discard stream if user flipped again while waiting
      if (activeFacingRef.current !== facing) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("[Camera] video.play() warning (will autoPlay):", playErr);
        }
      }

      setCameraState("ready");
    } catch (err: any) {
      if (activeFacingRef.current !== facing) return;
      console.warn("[Camera] Camera initialization error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission was denied. Tap below to launch your phone's camera app directly or allow access in browser site settings.");
        setCameraState("error");
      } else if (err.message === "UNSUPPORTED_CONTEXT") {
        setErrorMessage("Live camera streaming requires HTTPS or browser camera permission. You can launch your phone's camera app directly below.");
        setCameraState("unsupported");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No camera hardware found on this device. You can choose a photo from your gallery.");
        setCameraState("error");
      } else {
        setErrorMessage("Could not start live camera feed. You can use your device's built-in camera app directly.");
        setCameraState("error");
      }
    } finally {
      isSwitchingRef.current = false;
      setIsSwitching(false);
    }
  }, [stopStream, requestCameraStream]);

  // Lifecycle when modal opens / closes or facing mode changes
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCountingDown(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Flip camera front/back
  const handleToggleFacingMode = () => {
    if (cameraState === "loading" || isSwitchingRef.current) return;
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  // Capture frame from live video
  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const targetWidth = Math.min(video.videoWidth || 1080, 1080);
      const scale = targetWidth / (video.videoWidth || 1080);
      const targetHeight = (video.videoHeight || 1440) * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // If front camera, mirror image horizontally so it matches preview
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
      }
    } catch (err) {
      console.error("Frame capture failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [facingMode]);

  // Shutter action with optional countdown
  const handleShutter = () => {
    if (isProcessing || capturedImage) return;

    if (timerDuration > 0) {
      setCountingDown(timerDuration);
      let count = timerDuration;
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountingDown(null);
          captureFrame();
        } else {
          setCountingDown(count);
        }
      }, 1000);
    } else {
      captureFrame();
    }
  };

  // Native input fallback capture (e.g. if permissions blocked)
  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1440;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(compressed);
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm photo and pass to parent
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopStream();
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (cameraState !== "ready") {
      startCamera(facingMode);
    }
  };

  if (!isOpen) return null;

  const viewLabel =
    viewType === "front"
      ? "Front View"
      : viewType === "left"
      ? "Left Profile View"
      : viewType === "right"
      ? "Right Profile View"
      : viewType === "side"
      ? "Side Profile View"
      : viewType === "back"
      ? "Back View"
      : viewType === "goal" || viewType === "inspiration"
      ? "Goal Physique Reference"
      : "Front View";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col justify-between overflow-hidden select-none">
        {/* Hidden native input for direct device camera fallback */}
        <input
          ref={nativeInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCapture}
          className="hidden"
        />

        {/* Top Header Bar */}
        <div className="relative z-30 flex items-center justify-between px-4 pt-4 pb-2 bg-gradient-to-b from-black/90 to-transparent">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122212] border border-[#ADFF00]/40 text-[#ADFF00] text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(173,255,0,0.2)]">
              <Sparkles size={11} />
              <span>AI Body Scanner</span>
            </div>
            <p className="text-xs font-bold text-gray-200 mt-1 uppercase tracking-wider">{viewLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer Toggle Button */}
            {!capturedImage && cameraState === "ready" && (
              <button
                type="button"
                onClick={() => {
                  setTimerDuration((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0));
                }}
                className={`h-10 px-3 rounded-full border text-xs font-black flex items-center gap-1 transition-all ${
                  timerDuration > 0
                    ? "bg-[#ADFF00]/15 border-[#ADFF00]/50 text-[#ADFF00]"
                    : "bg-white/10 border-white/15 text-gray-400"
                }`}
                title="Countdown timer"
              >
                <Timer size={14} />
                <span>{timerDuration > 0 ? `${timerDuration}s` : "Off"}</span>
              </button>
            )}

            {/* Flip Camera */}
            {!capturedImage && (
              <button
                type="button"
                disabled={isSwitching || cameraState === "loading"}
                onClick={handleToggleFacingMode}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all disabled:opacity-40 cursor-pointer"
                title={`Switch to ${facingMode === "environment" ? "Front" : "Back"} Camera`}
              >
                <FlipHorizontal size={18} className={isSwitching ? "animate-spin text-[#ADFF00]" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Center Viewfinder / Preview Container */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden my-auto w-full max-w-md mx-auto px-4">
          {capturedImage ? (
            /* Captured Snapshot Preview */
            <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-3xl overflow-hidden border-2 border-[#ADFF00] shadow-[0_0_35px_rgba(173,255,0,0.3)] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Captured body scan" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-[#ADFF00] uppercase tracking-wider">
                Photo Captured
              </div>
            </div>
          ) : (
            /* Live Camera Viewport (Always kept in DOM so videoRef is ready) */
            <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-3xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""} ${cameraState === "ready" ? "opacity-100" : "opacity-0"}`}
              />

              {/* High-Tech Corner Viewfinder Reticles */}
              {cameraState === "ready" && (
                <div className="absolute inset-4 pointer-events-none border border-white/15 rounded-2xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#ADFF00] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#ADFF00] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#ADFF00] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#ADFF00] rounded-br-lg" />
                </div>
              )}

              {/* Dynamic Body Pose Silhouette Outline */}
              {cameraState === "ready" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <svg viewBox="0 0 200 320" className="w-3/4 h-3/4 text-[#ADFF00]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4">
                    {/* Head Oval */}
                    <ellipse cx="100" cy="45" rx="22" ry="26" />
                    {/* Shoulders & Torso */}
                    <path d="M 60 90 Q 100 80 140 90 L 132 180 Q 100 185 68 180 Z" />
                    {/* Arms */}
                    <path d="M 58 92 L 40 170 L 36 210" />
                    <path d="M 142 92 L 160 170 L 164 210" />
                    {/* Legs */}
                    <path d="M 72 182 L 68 280 L 64 310" />
                    <path d="M 128 182 L 132 280 L 136 310" />
                  </svg>
                </div>
              )}

              {/* Pose Guidance Badge */}
              {cameraState === "ready" && (
                <div className="absolute bottom-3 inset-x-4 pointer-events-none text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] text-gray-300">
                    <Info size={12} className="text-[#ADFF00]" />
                    <span>Step back 2-3 meters. Keep full body inside frame.</span>
                  </div>
                </div>
              )}

              {/* Big Countdown Overlay */}
              <AnimatePresence>
                {countingDown !== null && (
                  <motion.div
                    key={countingDown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#ADFF00] flex items-center justify-center text-black font-black text-5xl shadow-[0_0_50px_rgba(173,255,0,0.8)]">
                      {countingDown}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading State Overlay */}
              {cameraState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D150D] space-y-3 z-20">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ADFF00]/40 animate-spin [animation-duration:8s]" />
                    <div className="w-10 h-10 rounded-full bg-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00]">
                      <Camera size={20} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-black uppercase tracking-wider text-white">Connecting Camera</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Please allow camera permissions if prompted</p>
                  </div>
                </div>
              )}

              {/* Fallback / Permission Restricted State */}
              {(cameraState === "error" || cameraState === "unsupported") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D150D] p-6 text-center space-y-4 z-20">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Camera Access Notice</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
                      {errorMessage || "Live in-browser feed is restricted. Tap below to launch your phone camera app directly."}
                    </p>
                  </div>

                  <div className="w-full space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => nativeInputRef.current?.click()}
                      className="w-full py-3.5 px-4 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.3)] transition-all cursor-pointer active:scale-95"
                    >
                      <Camera size={16} />
                      <span>Open Phone Camera App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="w-full py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <RefreshCw size={13} />
                      <span>Try Again</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls Bar */}
        <div className="relative z-30 px-6 py-5 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="max-w-md mx-auto flex items-center justify-between">
            {capturedImage ? (
              /* Retake and Confirm Buttons */
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw size={15} />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="py-4 px-5 rounded-2xl bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)] transition-all cursor-pointer active:scale-95"
                >
                  <Check size={18} strokeWidth={3} />
                  <span>Use Photo</span>
                </button>
              </div>
            ) : cameraState === "ready" ? (
              /* Live Camera Shutter Controls */
              <div className="w-full flex items-center justify-between">
                {/* Device Camera Fallback */}
                <button
                  type="button"
                  onClick={() => nativeInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Upload size={16} />
                  </div>
                  <span>Gallery</span>
                </button>

                {/* Main Shutter Button */}
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[#ADFF00]/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleShutter}
                      disabled={isProcessing || countingDown !== null}
                      className="w-16 h-16 rounded-full bg-[#ADFF00] hover:bg-[#c4ff33] active:scale-90 flex items-center justify-center text-black shadow-[0_0_30px_rgba(173,255,0,0.6)] transition-all cursor-pointer disabled:opacity-50"
                      title="Take Photo"
                    >
                      <Camera size={26} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Flip camera shortcut */}
                <button
                  type="button"
                  disabled={isSwitching}
                  onClick={handleToggleFacingMode}
                  className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <FlipHorizontal size={16} className={isSwitching ? "animate-spin text-[#ADFF00]" : ""} />
                  </div>
                  <span>{isSwitching ? "Switching..." : facingMode === "environment" ? "Front" : "Back"}</span>
                </button>
              </div>
            ) : (
              /* While loading or fallback: close/cancel button */
              <div className="w-full text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-400 hover:text-white transition-colors py-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
