# External Integrations & Services — GrindLog

## 1. Supabase (Database, Auth, Storage)
- **Host**: Managed Supabase PostgreSQL
- **Authentication**:
  - Email/password and OAuth providers via `@supabase/ssr` cookies
  - Route guards enforce onboarding status (`fitness_os_profiles.onboarding_completed`)
- **Key Tables**:
  - `fitness_os_profiles`: User goals, biometric metrics, equipment, timezone, onboarding flag
  - `fitness_os_workout_plans`: Multi-week AI-generated workout routines
  - `fitness_os_workouts`: Scheduled, in-progress, and completed workout sessions
  - `fitness_os_exercises`: Exercise roster per workout with target sets and reps
  - `fitness_os_sets`: Granular set logging (reps, weight, RPE, completed flag)
  - `workout_ai_notes`: Pre-computed LLM coaching advice per workout
  - `food_logs`: Meals, calories, macro breakdowns, meal types
  - `fitness_os_water_logs`: Daily hydration tracking
  - `fitness_os_subscriptions`: Razorpay subscription status, plan tier (`free`, `starter`, `pro`), billing cycles
- **Storage Buckets**: User profile avatars and transformation progress photos

## 2. Razorpay (Payment Gateway)
- **Role**: Handles recurring subscriptions (Core & Pro plans) and lifetime access
- **Flow**:
  1. Client calls `/api/fitness-ai/subscription/checkout` to create a Razorpay subscription/order
  2. Standard Razorpay modal opens on client device
  3. Client posts payment signature to `/api/payment/callback`
  4. Webhook endpoint `/api/webhooks/razorpay` verifies `x-razorpay-signature` via secret HMAC-SHA256
  5. Updates `fitness_os_subscriptions` and profile premium flags with 48-hour grace period protection

## 3. Google Gemini AI (@google/genai)
- **Model Family**: Gemini 2.0 Flash / Pro
- **Use Cases**:
  - **Plan Generator**: Builds customized 7-day splits based on user split preference, gym equipment, and fitness goals
  - **AI Coach Notes**: Synthesizes session strategy and recovery focus (`workout_ai_notes`)
  - **Nutrition Engine**: Calculates TDEE, macro split, and generates targeted meal suggestions
  - **Weekly Review**: Evaluates weekly volume, consistency, and progress rate
  - **Fitness Chatbot**: In-app conversational assistant for form checks, exercise swaps, and recovery advice

## 4. PWA Service Worker (Next-PWA & Workbox)
- **Role**: Caches static assets, scripts, fonts, and icons for instant offline shell loading
- **Configuration**:
  - Service worker generated into `public/sw.js`
  - Cross-origin assets and live streaming video assets excluded from runtime caching to prevent quota bloat

## 5. Resend (Email Service)
- **Role**: Handles transactional password resets, verification emails, and milestone celebrations

## 6. Developer Tooling & Agent Workflow Suite
- **GSD (Get Stuff Done)**: Autonomous roadmap planning, phase execution, verification loops, and state tracking in `.planning/`.
- **Graphify**: Codebase AST knowledge graph mapping 6,280+ nodes and 22,280+ edges (`graphify-out/graph.json`), powering instant blast-radius impact analysis and visual call flows (`app-callflow.html`, `graph.html`).
- **CodeRabbit**: Automated AI code reviews, security vulnerability scanning, and PR autofix (`.coderabbit.yaml`, `code-review` / `autofix` agent skills, and `code-reviewer` subagent).
