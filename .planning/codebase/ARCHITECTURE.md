# Architecture & Data Flow — GrindLog

## Architectural Overview
GrindLog is designed as a high-performance, mobile-first Progressive Web Application (PWA). It leverages Next.js 15 App Router with hybrid React Server Components (RSC) and focused Client Components ("Client Islands").

```
┌────────────────────────────────────────────────────────┐
│               Client / Mobile Browser                  │
│  - Instant Tab Switching (Next.js Router Cache 300s)   │
│  - Optimistic UI (BottomNav, Set Checkboxes)           │
│  - Floating AI Coach Modal (60fps Framer Motion)       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / RSC Streaming
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 Server                    │
│  - Route Group: app/(fitness)                          │
│  - FitnessLayout: Auth check + Shell Injection         │
│  - Page Handlers: Single Parallel Promise.all Batch    │
│  - In-Memory Derivations (0ms Split & Calendar Math)   │
│  - Suspense Boundaries with Theme-Aware Skeletons      │
└──────────────────────────┬─────────────────────────────┘
                           │ Supabase SDK
                           ▼
┌────────────────────────────────────────────────────────┐
│             Supabase Managed PostgreSQL                │
│  - Indexed Tables (user_id, workout_date, status)      │
│  - Row Level Security (RLS)                            │
└────────────────────────────────────────────────────────┘
```

## Key Architectural Patterns

### 1. Parallel Batching vs. Sequential Waterfalls
- **Rule**: Server Components must NEVER execute sequential database roundtrips.
- **Implementation**:
  ```ts
  const [
    { data: profile },
    { data: activePlan },
    subscriptionPlan,
    { data: workouts },
    { data: aiNotes },
  ] = await Promise.all([
    supabase.from("fitness_os_profiles").select("...").eq("user_id", user.id).maybeSingle(),
    supabase.from("fitness_os_workout_plans").select("...").eq("user_id", user.id).maybeSingle(),
    getFitnessPlan(user.id),
    supabase.from("fitness_os_workouts").select("...").eq("user_id", user.id).limit(35),
    supabase.from("workout_ai_notes").select("...").eq("user_id", user.id).limit(5),
  ]);
  ```
- All state resolution happens in **one network roundtrip** (~30–50ms total).

### 2. In-Memory Calendar & Status Math
- Weekly calendar dots (M T W T F S S), 7-day split matching, and today/upcoming status checks are derived purely in memory from the cached `workouts` array.
- Avoids multiple separate queries for today, week, next, and active workouts.

### 3. Immediate Suspense Streaming
- Every primary tab route exports a default function wrapped in `<Suspense fallback={<PageSkeleton />}>`.
- The skeleton renders on the client instantly (0ms blank screen), while the async data stream populates the content without blocking navigation.

### 4. Router Caching & Optimistic Tab Transitions
- In `next.config.ts`, `staleTimes: { dynamic: 300, static: 180 }` enables the client router cache.
- In `bottom-nav.tsx`, tapping a tab updates `pendingHref` immediately and calls `router.push(item.href)` inside `startTransition` with `e.preventDefault()`, preventing duplicate navigation races and providing 0ms tab switching.

### 5. Theme Architecture (Dark & White)
- Primary UI is built on a dark gym aesthetic (`#0A1108` background, `#121E12` cards, `#ADFF00` accent).
- White theme is controlled via the `html.theme-white` class in `styles/globals.css`, remapping dark green surfaces to clean `#FFFFFF` / `#F6FAF6` surfaces and adjusting text contrast to dark slate `#111418`.
