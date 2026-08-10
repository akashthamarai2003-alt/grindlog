"use client";

import { motion } from "framer-motion";
import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";

interface WorkoutHeaderProps {
  title: string;
  dateStr?: string;
  avatarUrl?: string | null;
  backUrl?: string;
}

export function WorkoutHeader({ title, dateStr, avatarUrl, backUrl = "/fitness" }: WorkoutHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between w-full pb-4"
    >
      <div className="flex items-center gap-3">
        <Link href={backUrl} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none">
            {title}
          </h1>
          {dateStr && (
            <p className="text-xs font-medium text-gray-500 mt-1">
              {dateStr}
            </p>
          )}
        </div>
      </div>
      
      <button className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors shrink-0">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <UserCircle className="h-6 w-6 stroke-[1.5]" />
        )}
      </button>
    </motion.div>
  );
}
