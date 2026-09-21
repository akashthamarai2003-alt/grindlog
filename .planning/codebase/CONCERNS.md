# Concerns, Technical Debt & Watch-Outs — GrindLog

## 1. Database Waterfall Regressions
- **Risk**: Adding new features (e.g. exercise history, personal records, social feed) could inadvertently introduce sequential `await supabase...` queries.
- **Remedy**: Always batch new queries into the primary page `Promise.all` block or handle them via asynchronous client fetching if not needed for the initial server render.

## 2. White Theme CSS Overrides
- **Risk**: Tailwind utility classes like `bg-[#121E12]` and `text-white` are hardcoded in older components. In `styles/globals.css`, complex override selectors (`html.theme-white .bg-\[\#121E12\]`) map them to light mode colors.
- **Remedy**: When introducing new components, always test in both dark and white theme modes. Avoid adding arbitrary hex color classes that aren't mapped in `globals.css`.

## 3. PWA Service Worker Cache Invalidation
- **Risk**: If Next-PWA Workbox caches dynamic API routes, users could see stale workout status or outdated macro counts.
- **Remedy**: Maintain strict exclusion of `/api/*` and dynamic routes from static runtime caching in `next.config.ts`.

## 4. Mobile Keyboard & Viewport Layout Shifts
- **Risk**: On mobile devices, virtual keyboards opening during food logging or rep input can cause the bottom navigation or floating AI coach button to obscure input fields.
- **Remedy**: Use `dvh` (dynamic viewport height) units and ensure modals adjust `padding-bottom` to accommodate `env(safe-area-inset-bottom)`.

## 5. Razorpay Webhook Idempotency & Webhook Retries
- **Risk**: Razorpay retries webhook deliveries if network latency occurs, which could lead to redundant subscription credit processing.
- **Remedy**: Maintain idempotency keys or check existing transaction records in `fitness_os_subscriptions` before applying status updates.
