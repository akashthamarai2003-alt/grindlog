# Codebase Structure & Directory Layout — GrindLog

## Root Repository Map (`c:\manage\web\`)
```
c:\manage\web\
├── .planning/               # GSD project plans, architecture maps, and state
├── app/                     # Next.js 15 web application
│   ├── app/                 # Next.js App Router routes
│   │   ├── (fitness)/       # Primary authenticated fitness app route group
│   │   │   ├── layout.tsx   # FitnessLayout (auth validation + shell injection)
│   │   │   ├── page.tsx     # Home Dashboard (FitnessHome + FitnessDashboard)
│   │   │   ├── workout/     # Workouts tab, session view, active logger, summary
│   │   │   ├── nutrition/   # Nutrition tab, food logger, calorie/macro trackers
│   │   │   ├── diet/        # Meal planning and recipe recommendations
│   │   │   ├── grocery/     # Smart shopping list generated from meal plan
│   │   │   ├── progress/    # Weight logs, body measurements, transformation photos
│   │   │   ├── profile/     # User profile, billing, plan manager, notifications
│   │   │   ├── coach/       # Full-page dedicated AI coach interface
│   │   │   ├── plan-setup/  # Initial workout onboarding plan review & lock-in
│   │   │   ├── payment/     # Subscription checkout & pricing tables
│   │   │   └── roadmap/     # Product feature roadmap & feature requests
│   │   ├── api/             # Backend API Route Handlers
│   │   │   ├── workouts/    # Sessions, exercises, sets completion, AI coach notes
│   │   │   ├── nutrition/   # Food logging, meal swapping, USDA foundation food lookup
│   │   │   ├── fitness/     # Scans, weight, measurements, workout-dates
│   │   │   ├── fitness-ai/  # Plan generation, weekly review, upgrade nutrition
│   │   │   ├── payment/     # Razorpay checkout callback
│   │   │   └── webhooks/    # Razorpay signature webhook listener
│   │   ├── actions/         # Next.js Server Actions (mutations & state updates)
│   │   ├── auth/            # Auth pages (signin, signup, forgot-password, reset)
│   │   └── onboarding/      # 5-step initial biometric onboarding wizard
│   ├── components/          # Reusable React components
│   │   └── fitness/         # Domain-specific fitness components
│   │       ├── dashboard/   # Header, metric cards, streak tracker, bottom-nav
│   │       ├── workout/     # Workout card, exercises list, timer, skeletons
│   │       ├── nutrition/   # Macro rings, meal cards, food search modal
│   │       ├── progress/    # Recharts weight graphs, measurement tables
│   │       ├── chatbot/     # Floating AI coach modal with 60fps animations
│   │       └── profile/     # Billing details, subscription modals, details form
│   ├── hooks/               # Custom React hooks (e.g. useWorkoutTimer)
│   ├── lib/                 # Core utilities, API clients, and business logic
│   │   ├── services/        # Supabase server/admin clients, AI coach service
│   │   └── fitness/         # Subscription access rules, plans, sample data
│   ├── public/              # PWA icons, manifest.json, static images
│   ├── styles/              # Global CSS & Tailwind configuration (globals.css)
│   ├── next.config.ts       # Next.js configuration (PWA, staleTimes, headers)
│   ├── package.json         # Node.js dependencies and run scripts
│   └── tsconfig.json        # TypeScript configuration
├── package.json             # Root repository package configuration
└── scripts/                 # Maintenance, data seed, and migration scripts
```

## Naming & File Conventions
- **Route Folders**: kebab-case (`app/(fitness)/plan-setup`, `app/(fitness)/workout`)
- **Page Files**: Standard Next.js names (`page.tsx`, `layout.tsx`, `loading.tsx`)
- **Component Files**: kebab-case (`workout-summary-card.tsx`, `bottom-nav.tsx`)
- **Component Names**: PascalCase (`WorkoutSummaryCard`, `BottomNav`)
- **Utility / Service Files**: kebab-case (`workout-service.ts`, `access.ts`)
