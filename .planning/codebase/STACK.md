# Technology Stack — GrindLog

## Core Runtime & Framework
- **Runtime**: Node.js (v20+)
- **Framework**: Next.js 15.0.0 (App Router, Server Components & Server Actions)
- **UI Library**: React 19.0.0 & React DOM 19.0.0
- **Language**: TypeScript 5.7.0 (Strict mode enabled)

## Styling & Design System
- **CSS Engine**: Tailwind CSS v4.0.0 with `@tailwindcss/postcss` & `@tailwindcss/typography`
- **Component Primitives**: Radix UI (`@radix-ui/react-dialog`, `dropdown-menu`, `select`, `switch`, `tabs`, `toast`, `tooltip`)
- **Animation**: Framer Motion 12.42.2 & Motion 11.0.0 (60fps mobile transitions, spring physics)
- **Icons**: Lucide React 0.460.0
- **Visual FX**: `canvas-confetti` 1.9.4
- **Toast System**: Sonner 2.0.7
- **Color Palette**:
  - Dark Theme: Background `#0A1108`, Cards `#121E12` / `#111A10`, Accent Neon Green `#ADFF00`
  - Light Theme: Background `#F4FAF4`, Cards `#FFFFFF`, Accent `#16A34A` / `#86EFAC`

## Data Layer & State
- **Database**: Supabase PostgreSQL (Managed Postgres with Row Level Security)
- **Database Client**: `@supabase/ssr` 0.5.0 and `@supabase/supabase-js` 2.47.0
- **State Management**:
  - Server: React `cache(...)` per-request memoization, Server Component data streaming
  - Client: Zustand 5.0.0 (lightweight local client state)
- **Router Caching**: Next.js dynamic staleTimes (`staleTimes: { dynamic: 300, static: 180 }`)

## AI & LLM Integrations
- **Google GenAI**: `@google/genai` 2.17.1 (Gemini 2.0 Flash / Pro models for workouts, meals, coach notes)
- **Groq SDK**: `groq-sdk` 0.8.0 (Low-latency streaming inferences)
- **OpenAI**: `openai` 7.4.0 (Fallback / specialized completions)

## Payments & Subscriptions
- **Gateway**: Razorpay 2.9.0 (Standard Checkout JS modal + server-side order generation)
- **Webhooks**: Signature verification (`crypto` HMAC-SHA256) for subscription activations & renewals

## Mobile & PWA
- **PWA Plugin**: `@ducanh2912/next-pwa` 10.2.9 with Workbox
- **Manifest**: Standalone display, theme color `#0A1108`, portrait orientation

## Utilities & Validation
- **Validation**: Zod 3.24.0, React Hook Form 7.54.0 with `@hookform/resolvers`
- **Dates**: `date-fns` 4.1.0 & `react-day-picker` 9.4.0
- **Charts**: Recharts 2.15.0
- **File Parsing**: `xlsx` 0.18.5
