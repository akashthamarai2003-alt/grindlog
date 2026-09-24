"use client";

import { motion } from "framer-motion";
import { BookOpen, Search, Dumbbell, ChevronRight } from "lucide-react";
import Link from "next/link";

export function ExerciseLibraryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="w-full relative rounded-2xl overflow-hidden group mt-2"
    >
      <Link href="/exercises" prefetch={true} className="block">
        <div className="relative bg-[#111A10] rounded-2xl p-4 flex items-center justify-between shadow-xl border border-white/5 hover:border-white/20 transition-colors backdrop-blur-md">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white/70" />
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-sm font-black tracking-wide text-white uppercase">Exercise Library</h3>
              <p className="text-xs font-medium text-white/50">Browse 800+ exercises with instructions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-white/30 group-hover:text-[#ADFF00] transition-colors" />
            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
          </div>
          
        </div>
      </Link>
    </motion.div>
  );
}
