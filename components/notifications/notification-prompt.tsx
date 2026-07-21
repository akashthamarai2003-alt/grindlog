"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { requestFirebaseNotificationPermission } from "@/lib/firebase/client";

const FCM_REGISTRATION_VERSION = "2";

interface NotificationPromptProps {
  variant?: "card" | "modal";
}

export function NotificationPrompt({ variant = "card" }: NotificationPromptProps = {}) {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const registerDevice = async () => {
    const oldToken = localStorage.getItem("fcm_token");
    const token = await requestFirebaseNotificationPermission();

    if (!token) {
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        setPermission("denied");
      }
      return false;
    }

    const res = await fetch("/api/fcm/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, oldToken }),
    });

    if (!res.ok) {
      return false;
    }

    setRegistered(true);
    setPermission("granted");
    localStorage.setItem("fcm_registered", "true");
    localStorage.setItem("fcm_token", token);
    localStorage.setItem("fcm_registration_version", FCM_REGISTRATION_VERSION);
    return true;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      const hasCurrentRegistration =
        localStorage.getItem("fcm_registered") === "true" &&
        localStorage.getItem("fcm_registration_version") === FCM_REGISTRATION_VERSION;

      const isManuallyDisabled = localStorage.getItem("fcm_disabled_manually") === "true";

      if (hasCurrentRegistration) {
        setRegistered(true);
      } else if (Notification.permission === "granted" && !isManuallyDisabled) {
        registerDevice().catch((error) => {
          console.error("Failed to refresh notification registration", error);
        });
      }
      
      if (variant === "modal") {
        setDismissed(localStorage.getItem("fcm_modal_dismissed") === "true");
      }
    } else {
      // Notifications not supported
      setPermission("denied");
    }
    setIsChecking(false);
  }, [variant]);

  const handleRequestPermission = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const success = await registerDevice();
      if (!success) {
        if (typeof Notification === "undefined") {
          setErrorMsg("Your browser doesn't support notifications. On iOS, tap Share > Add to Home Screen first.");
        } else if (Notification.permission === "denied") {
          setErrorMsg("Notifications are blocked in your browser settings.");
        } else {
          setErrorMsg("Failed to setup notifications. Ensure you have a secure connection.");
        }
      }
    } catch (error: any) {
      console.error("Failed to enable notifications", error);
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return null;
  }

  if (permission === "granted" && registered) {
    return null;
  }

  // Do not show prompt if user manually disabled notifications in profile
  if (typeof window !== "undefined" && localStorage.getItem("fcm_disabled_manually") === "true") {
    return null;
  }

  if (variant === "modal" && dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("fcm_modal_dismissed", "true");
  };

  const cardContent = (
    <div className={`flex flex-col items-center justify-center rounded-[32px] bg-[var(--color-bg-elevated)]/60 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-[var(--color-bg-tertiary)]/50 relative overflow-hidden text-center max-w-sm mx-auto ${variant === 'card' ? 'mt-8' : 'w-full'}`}>
      {variant === "modal" && (
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary-hover)] transition-colors"
        >
          <span className="text-sm font-bold">✕</span>
        </button>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-transparent" />
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white mb-5 shadow-[0_0_24px_rgba(0,122,255,0.4)]">
        {permission === "denied" ? <BellOff className="h-8 w-8" /> : <Bell className="h-8 w-8" />}
      </div>
      
      <h3 className="relative z-10 text-xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">
        {permission === "denied" ? "Notifications Blocked" : "Enable Reminders"}
      </h3>
      
      <p className="relative z-10 text-[13px] font-bold text-[var(--color-text-secondary)] mb-6 leading-relaxed">
        {permission === "denied" 
          ? "You need to allow notifications in your browser settings to receive AI and Tree reminders."
          : "Never miss a habit. Get personalized AI reminders, streak alerts, and tree watering notifications directly to your device!"}
      </p>

      {errorMsg && (
        <div className="relative z-10 mb-4 rounded-xl bg-red-500/10 p-3 text-[12px] font-bold text-red-500 border border-red-500/20">
          {errorMsg}
        </div>
      )}

      {permission !== "denied" && (
        <button
          onClick={handleRequestPermission}
          disabled={loading}
          className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#5856D6] py-3.5 text-[15px] font-black tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,122,255,0.39)] active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Allow Notifications"}
        </button>
      )}
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 max-w-sm w-full">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
