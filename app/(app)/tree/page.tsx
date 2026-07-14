import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function TreePage() {
  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-primary)] px-5 pt-4 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Your Forest</h1>
        <div className="h-10 w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center gap-6 pb-20">
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[#34C759]/10 ring-4 ring-[#34C759]/20 overflow-hidden">
          <Image src="/tree-in-the-wind.svg" width={200} height={200} alt="Tree" className="animate-tree-sway origin-bottom inline-block drop-shadow-md scale-[1.6]" />
        </div>
        
        <div className="flex flex-col gap-2 max-w-[280px]">
          <h2 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
            Coming Soon!
          </h2>
          <p className="text-[15px] font-medium text-[var(--color-text-secondary)]">
            This is where your habits will grow into a beautiful forest. Keep grinding to earn water drops and grow your trees!
          </p>
        </div>
      </div>
    </div>
  );
}
