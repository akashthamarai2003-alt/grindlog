# Product & Technical Requirements — GrindLog

## 1. Performance & Latency Requirements
- **PR-1.1**: Server initial load times under 200ms on 4G mobile connections.
- **PR-1.2**: Tab switching between primary routes (`/`, `/workout`, `/nutrition`, `/progress`, `/profile`) must be instant (0ms visual feedback via optimistic highlights and client router caching).
- **PR-1.3**: Zero database waterfalls in Server Components. All database queries must run in parallel `Promise.all` batches.
- **PR-1.4**: All primary pages must stream skeletons using React `<Suspense>` to eliminate blank page stalling.

## 2. Workout & Fitness Requirements
- **WR-2.1**: Support flexible workout splits (e.g. Push/Pull/Legs, Upper/Lower, Full Body, Bro Split).
- **WR-2.2**: Active workout sessions must persist set completion in real time.
- **WR-2.3**: Allow early starts for scheduled upcoming workouts with automatic calendar schedule compaction.
- **WR-2.4**: Provide resting timer with audible and haptic cues between sets.

## 3. Nutrition & Diet Requirements
- **NR-3.1**: Quick food logging with calorie, protein, carbohydrate, and fat tracking.
- **NR-3.2**: Daily water consumption tracking with quick-add buttons (+250ml, +500ml).
- **NR-3.3**: AI meal recommendations matching the user's daily caloric and macro targets.

## 4. Design & Mobile Experience Requirements
- **DR-4.1**: Full PWA support with offline app shell caching and installability.
- **DR-4.2**: 100% theme fidelity across both Dark (`#0A1108`) and White (`.theme-white`) themes.
- **DR-4.3**: Safe area compliance on modern iOS and Android devices (`env(safe-area-inset-bottom)`).
- **DR-4.4**: 60fps gesture animations for drawer modals, toasts, and floating action buttons.

## 5. Security & Billing Requirements
- **SR-5.1**: Enforce Row Level Security (RLS) on all Supabase tables so users can only access their own data.
- **SR-5.2**: Secure webhook handling with cryptographic HMAC-SHA256 signature verification for Razorpay.
- **SR-5.3**: 48-hour grace period for expired subscriptions to prevent sudden lockouts during live workouts.
