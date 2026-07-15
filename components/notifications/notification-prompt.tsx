"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { requestFirebaseNotificationPermission } from "@/lib/firebase/client";

const FCM_REGISTRATION_VERSION = "2";

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const registerDevice = async () => {
    const oldToken = localStorage.getItem("fcm_token");
    const token = await requestFirebaseNotificationPermission();

    if (!token) {
      if (Notification.permission === "denied") {
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

      if (hasCurrentRegistration) {
        setRegistered(true);
      } else if (Notification.permission === "granted") {
        registerDevice().catch((error) => {
          console.error("Failed to refresh notification registration", error);
        });
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      await registerDevice();
    } catch (error) {
      console.error("Failed to enable notifications", error);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "granted" && registered) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-[24px] bg-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34C759]/10 text-[#34C759] mb-4">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-[var(--color-text-primary)] mb-1">
          Notifications Enabled
        </h3>
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
          You will receive AI and Gamification reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-[24px] bg-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] mb-4">
        {permission === "denied" ? <BellOff className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
      </div>
      
      <h3 className="text-base font-black text-[var(--color-text-primary)] mb-1">
        {permission === "denied" ? "Notifications Blocked" : "Enable Reminders"}
      </h3>
      
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-5 max-w-[250px]">
        {permission === "denied" 
          ? "You need to allow notifications in your browser settings to receive AI and Tree reminders."
          : "Get personalized AI reminders, streak alerts, and tree watering notifications!"}
      </p>

      {permission !== "denied" && (
        <button
          onClick={handleRequestPermission}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-[#007AFF] px-6 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Allow Notifications"}
        </button>
      )}
    </div>
  );
}
