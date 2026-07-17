"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimePicker12hProps {
  value: string | null; // HH:mm in 24h format e.g. "13:45"
  onChange: (val: string | null) => void;
  className?: string;
}

export function TimePicker12h({ value, onChange, className }: TimePicker12hProps) {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  // Keep internal state in sync with value prop
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      let h24 = parseInt(parts[0], 10);
      if (isNaN(h24)) return;
      
      const mStr = parts[1] || "00";
      setMinute(mStr);
      setAmpm(h24 >= 12 ? "PM" : "AM");
      
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      setHour(h12.toString());
    } else {
      // If null/empty, we don't necessarily reset the dropdown visually to allow picking,
      // but if we want it strictly controlled we could. Let's leave it as is.
    }
  }, [value]);

  const updateValue = (newH: string, newM: string, newAp: string) => {
    let h24 = parseInt(newH, 10);
    if (newAp === "PM" && h24 !== 12) h24 += 12;
    if (newAp === "AM" && h24 === 12) h24 = 0;
    const h24Str = h24.toString().padStart(2, "0");
    onChange(`${h24Str}:${newM}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(e.target.value);
    updateValue(e.target.value, minute, ampm);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(e.target.value);
    updateValue(hour, e.target.value, ampm);
  };

  const handleAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAmpm(e.target.value);
    updateValue(hour, minute, e.target.value);
  };

  // If no value is provided, we should probably initialize it when they interact,
  // or default to it immediately if they click. The select will show 12:00 AM.
  // To ensure the first click registers, we can make the container trigger onChange if value is null.
  
  return (
    <div 
      className={cn("flex items-center gap-1.5 bg-transparent text-sm font-extrabold text-[var(--color-text-primary)] outline-none", className)}
      onClick={() => {
        if (!value) updateValue(hour, minute, ampm);
      }}
    >
      <select 
        value={value ? hour : ""}
        onChange={handleHourChange}
        className="appearance-none bg-transparent outline-none cursor-pointer text-center min-w-[32px] focus:text-[var(--color-accent-green)] transition-colors"
      >
        {!value && <option value="" disabled className="hidden">--</option>}
        {Array.from({length: 12}, (_, i) => i === 0 ? 12 : i).map(h => (
          <option key={h} value={h} className="text-black dark:text-white bg-white dark:bg-black">{h}</option>
        ))}
      </select>
      <span>:</span>
      <select 
        value={value ? minute : ""}
        onChange={handleMinuteChange}
        className="appearance-none bg-transparent outline-none cursor-pointer text-center min-w-[32px] focus:text-[var(--color-accent-green)] transition-colors"
      >
        {!value && <option value="" disabled className="hidden">--</option>}
        {Array.from({length: 60}, (_, i) => i.toString().padStart(2, "0")).map(m => (
          <option key={m} value={m} className="text-black dark:text-white bg-white dark:bg-black">{m}</option>
        ))}
      </select>
      <select 
        value={value ? ampm : ""}
        onChange={handleAmpmChange}
        className="appearance-none bg-[var(--color-bg-secondary)] rounded-lg px-2 py-1 outline-none cursor-pointer ml-1 text-center font-bold focus:ring-2 focus:ring-[var(--color-accent-green)]/35 transition-all"
      >
        {!value && <option value="" disabled className="hidden">--</option>}
        <option value="AM" className="text-black dark:text-white bg-white dark:bg-black">AM</option>
        <option value="PM" className="text-black dark:text-white bg-white dark:bg-black">PM</option>
      </select>
    </div>
  );
}
