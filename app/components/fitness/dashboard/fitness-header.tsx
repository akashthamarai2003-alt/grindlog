"use client";

import { User } from "@supabase/supabase-js";
import { UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FitnessHeaderProps {
  user: User;
}

export function FitnessHeader({ user }: FitnessHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "Athlete";
  const firstName = name.split(" ")[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start justify-between w-full"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Stay consistent. Your results are being built today.
        </p>
      </div>
      
      <button className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors shrink-0">
        {user.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <UserCircle className="h-7 w-7 stroke-[1.5]" />
        )}
      </button>
    </motion.div>
  );
}
