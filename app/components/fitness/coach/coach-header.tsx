"use client";

import { motion } from "motion/react";
import { ArrowLeft, User, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CoachHeader() {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </Link>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h1 className="font-bold text-gray-900 text-[17px]">AI Coach</h1>
        </div>
        <p className="text-[11px] font-medium text-emerald-600">Online & Ready</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-100">
        <User className="w-5 h-5 text-emerald-600" />
      </div>
    </div>
  );
}
