# Coding Conventions & Standards — GrindLog

## 1. Performance Standards (Mobile 60fps Target)
- **Zero Sequential Waterfalls**:
  - Never place database queries after `await` in server pages unless strictly dependent.
  - Group all queries into a single `Promise.all` batch.
- **In-Memory Calculations**:
  - For user datasets of 50 items or fewer (e.g. active week workouts, nutrition totals), aggregate in JavaScript rather than issuing additional DB calls.
- **Top-Level Suspense**:
  - Always export page components wrapped with `<Suspense fallback={<ComponentSkeleton />}>`.
- **Navigation Safety**:
  - In `BottomNav`, always call `e.preventDefault()` when invoking `startTransition(() => router.push(href))` to prevent race conditions with Next.js default link anchors.

## 2. Design System & Theming
- **Color Variables**:
  - Default (Dark): `#0A1108` (App background), `#121E12` (Card surface), `#ADFF00` (High-contrast neon green).
  - Light Mode: Controlled by `.theme-white` on `<html>`. Any custom styles must support `.theme-white` or use Tailwind semantic classes.
- **Never Hardcode Pure White Text**:
  - Prefer `text-white` with `.theme-white:text-gray-900` or use theme tokens to avoid invisible text in white theme.
- **Touch Targets**:
  - Minimum touch target size: 44x44px.
  - Interactive elements must include `active:scale-95` or `active:scale-90` with `transition-transform duration-100`.
  - Always use `touch-manipulation` to eliminate mobile 300ms double-tap delay.

## 3. Server vs. Client Boundary Rules
- **Server Components by Default**:
  - Keep `page.tsx` as an async Server Component for secure data fetching and minimal JS bundle size.
- **Client Islands Only When Required**:
  - Add `"use client"` only for components requiring:
    - Interactive user state (`useState`, `useReducer`)
    - Browser lifecycle events (`useEffect`, `useLayoutEffect`)
    - Animation libraries (`framer-motion`)
    - Browser APIs (`localStorage`, `navigator`, `window`)

## 4. TypeScript & Error Handling
- **Strict Typing**:
  - Avoid `any` where possible. Define clear interfaces for database rows and props.
- **Idempotency**:
  - Set logging and workout completions must be idempotent (safe to call multiple times without duplicating entries).
- **Graceful Fallbacks**:
  - If AI generation fails, fallback to predefined smart templates without throwing 500 errors to the user.
