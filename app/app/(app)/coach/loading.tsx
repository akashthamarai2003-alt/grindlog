import { Brain } from "lucide-react";

export default function CoachLoading() {
  return (
    <div className="flex h-[100dvh] md:h-screen w-full flex-col bg-[var(--color-bg-primary)]">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 p-4 md:p-6 pb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          <Brain className="h-5 w-5 text-indigo-400 opacity-50" />
        </div>
        <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
          <div className="h-5 w-24 bg-[var(--color-bg-tertiary)] rounded-md animate-pulse" />
          <div className="h-3 w-40 bg-[var(--color-bg-secondary)] rounded-md animate-pulse" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="px-4 md:px-6 py-2">
        <div className="flex gap-2 overflow-hidden">
          <div className="h-8 w-24 bg-[var(--color-bg-tertiary)] rounded-full animate-pulse shrink-0" />
          <div className="h-8 w-28 bg-[var(--color-bg-secondary)] rounded-full animate-pulse shrink-0" />
          <div className="h-8 w-32 bg-[var(--color-bg-secondary)] rounded-full animate-pulse shrink-0" />
          <div className="h-8 w-20 bg-[var(--color-bg-secondary)] rounded-full animate-pulse shrink-0" />
        </div>
      </div>

      {/* Main Content Skeleton (Chat Area) */}
      <div className="flex-1 overflow-hidden px-4 md:px-6 pt-4 pb-24">
        <div className="h-full w-full rounded-[24px] bg-[var(--color-bg-secondary)]/50 border border-[var(--color-bg-tertiary)] p-4 flex flex-col gap-4">
          <div className="self-start h-16 w-[80%] max-w-[300px] bg-[var(--color-bg-tertiary)] rounded-2xl rounded-tl-sm animate-pulse" />
          <div className="self-end h-12 w-[60%] max-w-[250px] bg-indigo-500/20 rounded-2xl rounded-tr-sm animate-pulse" />
          <div className="self-start h-20 w-[90%] max-w-[350px] bg-[var(--color-bg-tertiary)] rounded-2xl rounded-tl-sm animate-pulse" />
        </div>
      </div>

      {/* Bottom Input Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 md:pl-[280px] p-4 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent">
        <div className="mx-auto w-full max-w-3xl">
          <div className="h-[60px] w-full bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-bg-tertiary)] animate-pulse shadow-sm" />
        </div>
      </div>
    </div>
  );
}
