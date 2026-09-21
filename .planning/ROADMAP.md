# Product Roadmap — GrindLog

## Phase 1: Core Performance & Tab Optimization [COMPLETED]
- [x] Eliminate multi-query waterfalls on Home Dashboard (`/`) via parallel `Promise.all` batching.
- [x] Eliminate 15-query waterfall on Workouts page (`/workout`) with in-memory calendar/split derivation.
- [x] Configure Next.js dynamic client router caching (`staleTimes: { dynamic: 300 }`).
- [x] Add top-level `<Suspense>` boundaries with skeleton fallbacks for instant page loads.
- [x] Prevent navigation race conditions in `BottomNav` using `e.preventDefault()`.
- [x] Polish white theme across billing, workout header, chatbot, and metric cards.

---

## Phase 2: Nutrition & Food Logging Enhancements [UPCOMING]
- [ ] Implement camera barcode UPC scanner for instant packaged food logging.
- [ ] Add recent / frequent meals quick-relog drawer.
- [ ] Expand USDA Foundation Foods database search speed with client-side indexing.
- [ ] Provide meal photo analysis using Gemini Vision for macro estimation.

---

## Phase 3: Workout Audio, Haptics & Offline Sync [PLANNED]
- [ ] Integrate Web Audio API and vibration haptics for rest timer countdown alerts.
- [ ] Implement IndexedDB offline set caching for gym sessions with spotty cellular reception.
- [ ] Background sync queue to push completed workouts when network connectivity resumes.
- [ ] Sound effects for PRs (Personal Records) and set completions.

---

## Phase 4: Social, Leaderboards & Gamification [PLANNED]
- [ ] Friend follow system and activity feed.
- [ ] Community workout streaks and monthly challenges.
- [ ] Shareable workout summary cards for social media (Instagram Stories / WhatsApp).
- [ ] XP and badge progression system.
