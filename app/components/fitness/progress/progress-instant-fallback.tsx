"use client";

import { useState } from "react";
import { progressClientCache } from "@/lib/api/progress-cache";
import { ProgressView } from "./progress-view";
import ProgressLoading from "@/app/(fitness)/progress/loading";

/** Paint the last known progress view while fresh analytics load. */
export function ProgressInstantFallback() {
  const [cachedData] = useState(() => progressClientCache.get("30D"));

  return cachedData ? <ProgressView initialData={cachedData} isPro={false} /> : <ProgressLoading />;
}
