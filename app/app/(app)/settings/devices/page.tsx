"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Watch, CheckCircle2, Smartphone, Loader2 } from "lucide-react";
import Link from "next/link";
import { springs } from "@/animations/springs";

interface Device {
  id: string;
  name: string;
  provider: string;
  icon: string;
  type: "watch" | "phone";
  status: "connected" | "disconnected" | "connecting";
  lastSync?: string;
}

const INITIAL_DEVICES: Device[] = [
  {
    id: "apple_health",
    name: "Apple Health",
    provider: "Apple",
    icon: "🍎",
    type: "phone",
    status: "disconnected",
  },
  {
    id: "google_fit",
    name: "Google Fit",
    provider: "Google",
    icon: "🏃‍♂️",
    type: "phone",
    status: "disconnected",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    provider: "Garmin",
    icon: "⌚",
    type: "watch",
    status: "disconnected",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    provider: "Google",
    icon: "🎯",
    type: "watch",
    status: "disconnected",
  },
  {
    id: "oura",
    name: "Oura Ring",
    provider: "Oura",
    icon: "💍",
    type: "watch",
    status: "disconnected",
  }
];

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  const handleConnect = (id: string) => {
    // Simulate connection flow via API
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: "connecting" } : d));
    
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: "connected", lastSync: "Just now" } : d));
    }, 2500);
  };

  const handleDisconnect = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: "disconnected", lastSync: undefined } : d));
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </motion.div>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            Connected Apps
          </h1>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Sync your wearables automatically
          </p>
        </div>
      </div>

      {/* Hero graphic */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#111A10] rounded-[24px] p-6 mb-8 border border-[#ADFF00]/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/5 to-transparent pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-[#ADFF00]/10 flex items-center justify-center mb-4 relative z-10">
          <Watch className="w-8 h-8 text-[#ADFF00]" strokeWidth={2} />
        </div>
        <h2 className="text-[17px] font-black text-white tracking-tight relative z-10">Auto-sync your Steps & Sleep</h2>
        <p className="text-[13px] font-medium text-white/50 mt-1.5 max-w-[280px] relative z-10">
          Connect your device once and GrindLog will automatically update your Daily Goals checklist in the background.
        </p>
      </motion.div>

      {/* Devices List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--color-text-secondary)] mb-1 px-1">Available Integrations</h3>
        
        {devices.map((device, i) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.1 + (i * 0.05) }}
            className="flex items-center gap-4 bg-[var(--color-bg-secondary)] p-4 rounded-[20px] ring-1 ring-[var(--color-bg-tertiary)]/50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] shadow-sm text-2xl">
              {device.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-bold text-[var(--color-text-primary)] truncate">
                {device.name}
              </h4>
              <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] truncate">
                {device.status === 'connected' ? `Last sync: ${device.lastSync}` : device.provider}
              </p>
            </div>

            <div className="shrink-0 pl-2">
              <AnimatePresence mode="wait">
                {device.status === 'disconnected' && (
                  <motion.button
                    key="connect"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleConnect(device.id)}
                    className="bg-white text-black px-4 py-2 rounded-full text-[13px] font-black tracking-tight"
                  >
                    Connect
                  </motion.button>
                )}
                
                {device.status === 'connecting' && (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center w-[84px] h-[36px] bg-[var(--color-bg-tertiary)] rounded-full"
                  >
                    <Loader2 className="w-4 h-4 text-[var(--color-text-secondary)] animate-spin" />
                  </motion.div>
                )}

                {device.status === 'connected' && (
                  <motion.button
                    key="connected"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDisconnect(device.id)}
                    className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] px-3 py-2 rounded-full text-[13px] font-black tracking-tight"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    Linked
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="h-10" />
    </div>
  );
}
