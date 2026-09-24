"use client";

import { DashboardSkeleton } from "./dashboard-skeleton";

/** Clean skeleton placeholder while fresh dashboard data loads. */
export function DashboardInstantFallback() {
  return <DashboardSkeleton />;
}

