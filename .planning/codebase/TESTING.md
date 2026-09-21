# Testing & Verification Guide — GrindLog

## Verification Commands
All verification commands must be run from `c:\manage\web\app`:

```bash
# 1. Full production build verification (type-checking + page compilation)
npm run build

# 2. Type-checking only
npm run type-check

# 3. Linting
npm run lint
```

## Critical Test Flows

### 1. Tab Navigation & Instant Switching
- Open GrindLog on mobile viewport (375px to 430px width).
- Rapidly switch between **Home** (`/`), **Workout** (`/workout`), **Meals** (`/nutrition`), **Progress** (`/progress`), and **Profile** (`/profile`).
- Ensure:
  - Visual feedback is instantaneous (0ms).
  - No flickering or double-load transitions.
  - Page skeletons render immediately on cold cache, cached views swap instantly on warm cache.

### 2. Dual-Theme Verification (Dark vs. White)
- Switch between dark gym theme and white theme.
- Check cards:
  - Verify card backgrounds (`#121E12` in dark, `#FFFFFF` in white).
  - Verify text contrast (no white text on white backgrounds).
  - Verify green accents (`#ADFF00` in dark, `#16A34A` in white).
  - Check modal backdrops, dialogs, and drawer menus.

### 3. Workout Logging & State Persistence
- Start a scheduled workout or early-start workout.
- Mark sets as complete:
  - Verify checkmarks turn green instantly (optimistic UI).
  - Verify database persistence in `fitness_os_sets`.
- Pause / Resume timer:
  - Check timer accuracy in `WorkoutHeader`.
- Complete workout:
  - Verify summary screen loads with total volume, time elapsed, and confetti animation.

### 4. Nutrition & Calorie Tracking
- Log a meal (Breakfast, Lunch, Dinner, Snack).
- Verify macro circle recalculation in real time.
- Log water intake (+250ml / +500ml) and verify progress bar.

### 5. Authentication & Subscription Guard Rails
- Test signed-out user redirection to `/auth/signin`.
- Test user with incomplete onboarding redirection to `/onboarding`.
- Test Free vs. Pro feature restrictions (e.g. AI Coach notes, meal swapping, custom routines).
