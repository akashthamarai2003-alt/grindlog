"use client";

import { ProgressSkeleton } from "@/app/(fitness)/progress/loading";

/** Paint the clean progress skeleton while fresh analytics load. */
export function ProgressInstantFallback({ isPro = false }: { isPro?: boolean } = {}) {
  return <ProgressSkeleton />;
}

