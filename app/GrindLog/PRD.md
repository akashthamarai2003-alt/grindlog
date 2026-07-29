# GrindLog — Product Requirements Document

## The Personal Growth Operating System
### A Premium Mobile-Only AI Habit Tracker PWA

**Version:** 1.0.0 MVP  
**Status:** Blueprint  
**Date:** July 2, 2026  
**Author:** GrindLog Team  
**Target Launch:** To Be Determined  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [Design System](#3-design-system)
4. [Screen-by-Screen Specifications](#4-screen-by-screen-specifications)
5. [Animation & Motion System](#5-animation--motion-system)
6. [Database Schema](#6-database-schema)
7. [AI System Architecture](#7-ai-system-architecture)
8. [Gamification Engine](#8-gamification-engine)
9. [Notification System](#9-notification-system)
10. [Security Architecture](#10-security-architecture)
11. [Performance Requirements](#11-performance-requirements)
12. [Tech Stack & Dependencies](#12-tech-stack--dependencies)
13. [Folder Structure](#13-folder-structure)
14. [API Routes & Services](#14-api-routes--services)
15. [Testing Strategy](#15-testing-strategy)
16. [Launch Plan](#16-launch-plan)
17. [Future Modules](#17-future-modules)
18. [Appendix](#18-appendix)

---

## 1. Executive Summary

### 1.1 What is GrindLog?

GrindLog is a **mobile-only Progressive Web Application** that transcends traditional habit tracking. It combines the best design patterns from Apple Health, Headspace, Duolingo, Notion, Nike Run Club, CRED, and Linear into a unified personal growth experience.

At its core lies the **Tree of Life** — a living, breathing visualization that grows as users complete habits. Every action waters the tree; every streak adds leaves, birds, butterflies, and flowers. This transforms abstract self-improvement into something tangible, emotional, and deeply rewarding.

### 1.2 Core Differentiators

| Feature | GrindLog | Competitors |
|---------|----------|-------------|
| Living Tree Visualization | ✅ Animated, evolving ecosystem | ❌ None |
| AI Coach (Groq) | ✅ Personalized, free | ❌ Paid / GPT wrapper |
| Gamification Depth | ✅ XP, Coins, Levels, Quests, Seasons | ⚠️ Basic streaks only |
| Design Quality | ✅ Apple/Headspace tier | ⚠️ Functional but plain |
| Module Extensibility | ✅ Growth OS architecture | ❌ Single-purpose |
| Offline-First | ✅ Full PWA offline support | ⚠️ Partial |
| Monthly Cost (Dev) | ✅ ₹0 | N/A |

### 1.3 Success Metrics

- **Day 1 Retention:** 60%
- **Day 7 Retention:** 40%
- **Day 30 Retention:** 25%
- **DAU/MAU Ratio:** 0.35+
- **Average Session:** 4+ minutes
- **Habit Completion Rate:** 75%+
- **Premium Conversion:** 8% within 90 days

---

## 2. Product Vision & Strategy

### 2.1 Mission

> Transform personal growth from a chore into a living, breathing journey that users feel emotionally connected to every single day.

### 2.2 Brand Personality

| Trait | Expression |
|-------|-----------|
| **Calm** | Smooth animations, soft colors, breathing room |
| **Premium** | Apple-tier polish, zero jank, intentional whitespace |
| **Human** | Warm copy, emotional tree metaphor, gentle AI coach |
| **Playful** | Gamification that delights, not manipulates |
| **Trustworthy** | Privacy-first, encrypted, transparent |

### 2.3 Target Audience

**Primary:** Gen-Z & Millennials (18–35) who:
- Already use habit/wellness apps but feel disconnected
- Value beautiful design and premium experiences
- Are willing to pay for tools that genuinely help them grow
- Use iOS or Android mobile devices

**Secondary:** Productivity enthusiasts, self-improvement communities, ADHD/neurodivergent users who benefit from gamified structure.

### 2.4 Monetization Model

| Tier | Price | Features |
|------|-------|----------|
| **Free (Seed)** | ₹0 | 5 habits, basic tree, 7-day AI history, basic analytics |
| **Premium (Tree)** | ₹299/mo or ₹1,999/yr | Unlimited habits, full AI coach, advanced analytics, custom tree themes, priority support |
| **Legend (Forest)** | ₹599/mo or ₹3,999/yr | Everything + family sharing, early access to modules, custom AI training, API access |

### 2.5 Competitive Landscape

| App | Strength | Weakness | How GrindLog Wins |
|-----|----------|----------|-------------------|
| Streaks | Clean design | Boring, no emotional hook | Tree of Life visualization |
| Habitica | Gamification | Ugly, childish RPG | Premium, adult design language |
| Headspace | Emotional design | Meditation only | Full growth OS, habit-first |
| TickTick | Feature-rich | Bloated, no heart | Focused, beautiful, AI-powered |
| Apple Health | Trust, ecosystem | No habit tracking or gamification | Habit tracking with Apple-tier design |

---

## 3. Design System

### 3.1 Mobile-Only Dimensions

```
Primary Viewport: 390px (iPhone 14/15 Pro)
Supported Widths: 375px – 430px
Max Width Container: 430px (centered)
No Desktop Layouts — ever.
```

### 3.2 Color Tokens

#### Light Theme (Default)

```css
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F4F5F7;
--color-bg-tertiary: #EBECF0;
--color-bg-elevated: #FFFFFF;

--color-text-primary: #1A1D23;
--color-text-secondary: #5E636E;
--color-text-tertiary: #9BA1AE;
--color-text-inverse: #FFFFFF;

--color-accent-blue: #007AFF;
--color-accent-blue-light: #E8F2FF;
--color-accent-green: #34C759;
--color-accent-green-light: #E8F8ED;

--color-success: #34C759;
--color-warning: #FF9500;
--color-error: #FF3B30;
--color-info: #007AFF;

--color-tree-seed: #8B6914;
--color-tree-sprout: #7BC67E;
--color-tree-plant: #4CAF50;
--color-tree-mature: #2E7D32;
--color-tree-legend: #FFD700;

--color-xp: #FF9500;
--color-coins: #FFD700;
--color-streak: #FF6B35;
```

#### Dark Theme (Premium)

```css
--color-bg-primary: #0D0D0F;
--color-bg-secondary: #1A1A1E;
--color-bg-tertiary: #24242A;
--color-bg-elevated: #1E1E23;

--color-text-primary: #F5F5F7;
--color-text-secondary: #A1A1AA;
--color-text-tertiary: #6B6B76;
--color-text-inverse: #1A1D23;
```

### 3.3 Typography

```css
--font-sans: 'Inter', -apple-system, 'SF Pro Display', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
--font-display: 'Inter', -apple-system, 'SF Pro Display', sans-serif;

/* Scale (modular, 1.25 ratio) */
--text-xs: 0.75rem;    /* 12px — Captions */
--text-sm: 0.875rem;   /* 14px — Body small */
--text-base: 1rem;     /* 16px — Body */
--text-lg: 1.125rem;   /* 18px — Body large */
--text-xl: 1.25rem;    /* 20px — Subtitle */
--text-2xl: 1.5rem;    /* 24px — Title small */
--text-3xl: 1.875rem;  /* 30px — Title */
--text-4xl: 2.25rem;   /* 36px — Title large */
--text-5xl: 3rem;      /* 48px — Hero */

/* Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;

/* Letter Spacing */
--tracking-tight: -0.025em;   /* Display text */
--tracking-normal: 0;
--tracking-wide: 0.025em;     /* Captions */
```

### 3.4 Spacing Scale

```
4px   — Micro (icon padding, avatar borders)
8px   — XS (icon gaps, list item padding)
12px  — S (card inner padding)
16px  — M (standard padding, section gaps)
20px  — ML
24px  — L (section spacing)
32px  — XL (large section gaps)
40px  — 2XL
48px  — 3XL
64px  — 4XL (hero spacing)
```

### 3.5 Border Radius

```
8px   — Small elements (chips, badges, small buttons)
12px  — Inputs, list items
16px  — Cards
20px  — Large cards, modals
28px  — Bottom sheets, large modals
32px  — Hero cards, pricing cards
9999px — Pills, avatars, progress indicators
```

### 3.6 Shadows

```css
/* Card shadow — subtle lift */
--shadow-card: 0px 2px 8px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.08);

/* Elevated — bottom sheets, modals */
--shadow-elevated: 0px 8px 32px rgba(0, 0, 0, 0.08), 0px 0px 1px rgba(0, 0, 0, 0.12);

/* Floating — FABs, tooltips */
--shadow-floating: 0px 4px 16px rgba(0, 0, 0, 0.12), 0px 0px 2px rgba(0, 0, 0, 0.16);

/* Glow — AI elements, premium badges */
--shadow-glow-blue: 0px 0px 20px rgba(0, 122, 255, 0.25);
--shadow-glow-green: 0px 0px 24px rgba(52, 199, 89, 0.2);
--shadow-glow-gold: 0px 0px 28px rgba(255, 215, 0, 0.3);
```

### 3.7 Component Tokens

```css
/* Cards */
--card-padding: 16px;
--card-gap: 12px;
--card-radius: 16px;
--card-bg: var(--color-bg-primary);
--card-border: 1px solid var(--color-bg-tertiary);

/* Buttons */
--btn-height-sm: 36px;
--btn-height-md: 48px;
--btn-height-lg: 56px;
--btn-radius: 12px;
--btn-padding-x: 20px;

/* Inputs */
--input-height: 48px;
--input-radius: 12px;
--input-padding-x: 16px;
--input-bg: var(--color-bg-secondary);

/* Bottom Tab Bar */
--tabbar-height: 80px; /* includes safe area */
--tabbar-icon-size: 24px;
--tabbar-label-size: 10px;

/* Navigation Bar */
--navbar-height: 44px;
--navbar-padding-top: env(safe-area-inset-top, 0px);
```

---

## 4. Screen-by-Screen Specifications

### 4.1 Splash Screen

**Duration:** 2.0 seconds (branded, not loading)  
**Route:** `/splash`

#### Visual Layout

```
┌────────────────────────────┐
│                            │
│                            │
│         🌱                 │
│     (Seed animation)       │
│                            │
│       GrindLog             │
│   Personal Growth OS       │
│                            │
│      ⟳ Loading...         │
│                            │
└────────────────────────────┘
```

#### Animation Sequence

| Time | Animation | Duration | Easing |
|------|-----------|----------|--------|
| 0.0s | Logo seed appears (scale 0 → 1) | 0.6s | spring(1, 0.6, 15) |
| 0.3s | Seed glows green | 0.5s | ease-out |
| 0.8s | "GrindLog" text fades up (20px → 0, opacity 0 → 1) | 0.5s | spring |
| 1.2s | Subtitle fades in | 0.4s | ease-out |
| 1.5s | Loading dots pulse | ongoing | ease-in-out, repeat |

#### Logic
- Check auth state in background
- If authenticated + has habits → redirect to `/dashboard`
- If authenticated + no habits → redirect to `/onboarding/ai-plan`
- If not authenticated → redirect to `/onboarding`

---

### 4.2 Onboarding Flow

**Route:** `/onboarding`  
**Screens:** 4 sequential screens  
**Navigation:** Horizontal swipe + dots indicator

#### Screen 1: Welcome

```
┌────────────────────────────┐
│                            │
│                            │
│     🌳 (Small Tree)        │
│                            │
│   Grow Into Your           │
│   Best Self                │
│                            │
│   Every habit is a drop    │
│   of water. Your tree      │
│   grows with you.          │
│                            │
│         ○ ● ○ ○           │
│                            │
└────────────────────────────┘
```

**Animation:** Tree gently sways (rotate ±3°, infinite, 4s period). Text slides up on enter. Background has subtle green radial gradient that pulses.

#### Screen 2: Track Anything

```
┌────────────────────────────┐
│   🏃 💪 🧘 📚 🎨 💰       │
│   (Floating icons,         │
│    animated)               │
│                            │
│   Track What               │
│   Matters                  │
│                            │
│   Fitness, reading,        │
│   meditation, finance —    │
│   any habit, tracked       │
│   beautifully.             │
│                            │
│         ○ ○ ● ○           │
└────────────────────────────┘
```

**Animation:** Icons float upward and fade, staggered start (each 150ms apart), infinite loop. Bouncy.

#### Screen 3: AI That Knows You

```
┌────────────────────────────┐
│                            │
│     🤖 AI Coach            │
│     (Pulsing glow)         │
│                            │
│   Your Personal            │
│   AI Coach                 │
│                            │
│   Get personalized plans,  │
│   predictions, and         │
│   encouragement — 24/7.   │
│                            │
│         ○ ○ ○ ●           │
└────────────────────────────┘
```

**Animation:** AI icon has breathing glow animation (scale 1 → 1.05 → 1, 3s cycle). Sparkle particles orbit.

#### Screen 4: Ready to Grow

```
┌────────────────────────────┐
│                            │
│     🌱🌿🌳✨               │
│   (Seed → sprout → tree    │
│    morph animation)        │
│                            │
│   Your Journey             │
│   Begins Now               │
│                            │
│   ┌───────────────────┐    │
│   │   Get Started  →  │    │
│   └───────────────────┘    │
│                            │
│   Already have account?    │
│   Sign in                 │
└────────────────────────────┘
```

**Animation:** Seed morphs through growth stages (3-stage animation, 100ms per stage). Button has subtle shimmer on loop.

**Button:** "Get Started" → navigates to `/auth/signup`

---

### 4.3 Authentication

**Routes:** `/auth/signup`, `/auth/signin`, `/auth/forgot-password`, `/auth/reset-password`

#### Sign Up Screen

```
┌────────────────────────────┐
│  ← Back                    │
│                            │
│  Create Account            │
│  Start your growth         │
│  journey today.            │
│                            │
│  ┌──────────────────────┐  │
│  │ Name                 │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Email                │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Password             │  │
│  │ 👁                    │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │  Create Account  🌱  │  │
│  └──────────────────────┘  │
│                            │
│  ─────── or ───────       │
│                            │
│  [G] Google  [M] Microsoft │
│                            │
│  By signing up, you agree  │
│  to Terms & Privacy        │
└────────────────────────────┘
```

**Social Auth:** Google OAuth, Microsoft OAuth (via Supabase).

**Validation (Zod):**
- Name: 2–50 chars, required
- Email: valid email, required
- Password: 8+ chars, 1 uppercase, 1 number, 1 special

**On Success:** Navigate to `/onboarding/ai-plan`

#### Sign In Screen

Same layout, simplified.
- Email + Password
- "Forgot Password?" link
- Social auth buttons
- "Don't have an account? Sign up"

---

### 4.4 AI Plan Creator

**Route:** `/onboarding/ai-plan`  
**Critical Flow** — This is where the app delivers its first "wow" moment.

#### Screen Flow

**Step 1: Goal Selection (Question Card)**

```
┌────────────────────────────┐
│  Step 1 of 4               │
│  ● ○ ○ ○                  │
│                            │
│  What's your primary       │
│  goal?                     │
│                            │
│  ┌──────────────────────┐  │
│  │ 🏃  Get Fitter       │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🧠  Improve Focus    │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 😴  Sleep Better     │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 📚  Learn More       │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 💰  Build Wealth     │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ ✨  Something Else   │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

**Animation:** Cards stagger-fade-in from bottom (50ms stagger, spring). Selected card scales up slightly (1.02) and gets green border + glow.

**Step 2: Experience Level**

```
┌────────────────────────────┐
│  Step 2 of 4               │
│  ○ ● ○ ○                  │
│                            │
│  How experienced are you   │
│  with habit building?      │
│                            │
│  ┌──────────────────────┐  │
│  │ 🌱  Beginner         │  │
│  │ New to habits        │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🌿  Intermediate     │  │
│  │ Some experience      │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🌳  Advanced         │  │
│  │ Consistent for 6mo+  │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

**Step 3: Time & Schedule**

```
┌────────────────────────────┐
│  Step 3 of 4               │
│  ○ ○ ● ○                  │
│                            │
│  When do you have time?    │
│                            │
│  ☀️ Morning (6–9 AM)       │
│  🌤 Midday (12–2 PM)       │
│  🌅 Evening (5–8 PM)       │
│  🌙 Night (9–11 PM)        │
│                            │
│  How much time daily?      │
│                            │
│  ┌───┬───┬───┬───┬───┐    │
│  │15m│30m│45m│ 1h│2h+│    │
│  └───┴───┴───┴───┴───┘    │
└────────────────────────────┘
```

**Step 4: AI Magic**

```
┌────────────────────────────┐
│  Step 4 of 4               │
│  ○ ○ ○ ●                  │
│                            │
│     🤖 ✨                  │
│   (AI pulse animation)     │
│                            │
│   Building your            │
│   personalized plan...     │
│                            │
│   ⟳ Analyzing 1000+       │
│     habit patterns         │
│   ⟳ Optimizing for         │
│     your schedule          │
│   ⟳ Creating your          │
│     Tree of Life           │
│                            │
│   [Progress bar animated]  │
│                            │
└────────────────────────────┘
```

**API Call:** Send user preferences to Groq API (`POST /api/ai/generate-plan`)

**AI Prompt Template:**
```
You are a world-class habit formation coach. Based on:

Goal: {goal}
Experience: {level}
Available Times: {times}
Time Budget: {duration} minutes/day

Generate a personalized habit plan with:
1. 3-5 core habits ordered by impact
2. For each: name, category, frequency, best time, 1-sentence why
3. 1 optional "stretch" habit for ambitious days
4. A 2-sentence motivational insight specific to their goal
5. Suggested habit order for their day

Format as JSON.
```

**On Complete:** Save habits to Supabase → Navigate to `/dashboard` with confetti animation.

---

### 4.5 Dashboard

**Route:** `/dashboard`  
**Status Bar:** Transparent overlay on scroll

#### Full Layout (Scrollable)

```
┌────────────────────────────┐
│  👋 Good Morning, Priya!   │  ← Animated greeting
│  📍 Chennai                 │
│  Let's make today count.   │
├────────────────────────────┤
│                            │
│      ┌─────────────┐       │
│      │             │       │
│      │  🌳 TREE    │       │  ← Tree of Life (Hero)
│      │  (Live)     │       │     ~240px height
│      │             │       │     Interactive
│      │             │       │
│      └─────────────┘       │
│                            │
│  🌱 Level 12 Gardener       │  ← XP bar
│  ████████░░░░ 840/1200 XP  │
│                            │
├────────────────────────────┤
│  Today's Progress   65%  ● │  ← Donut ring
│                            │
│  4 of 6 Habits Complete    │
├────────────────────────────┤
│  Today's Habits            │
│                            │
│  ┌──────────────────────┐  │
│  │ 🏃 Morning Run       │  │  ← Habit Card
│  │ 🔥 42 Day Streak     │  │     (swipeable)
│  │ ○ Complete           │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 📚 Read 30 Minutes   │  │
│  │ 🔥 15 Day Streak     │  │
│  │ ● Completed ✓         │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 💧 Drink 8 Glasses   │  │
│  │ 🔥 8 Day Streak      │  │
│  │ ○ Pending            │  │
│  └──────────────────────┘  │
│  ...more habits...         │
├────────────────────────────┤
│  ┌──────────────────────┐  │
│  │  + Quick Add Habit   │  │  ← Quick Add FAB-like card
│  └──────────────────────┘  │
├────────────────────────────┤
│  ┌──────────────────────┐  │
│  │ 🤖 AI Coach          │  │  ← AI Card
│  │ "You're 3 days away  │  │     (dynamic content)
│  │  from your best       │  │
│  │  streak this month!   │  │
│  │  Want a motivation    │  │
│  │  boost?"              │  │
│  │         [Get Boost →] │  │
│  └──────────────────────┘  │
├────────────────────────────┤
│  Statistics                │
│                            │
│  ┌────────┬────────┐      │
│  │  142   │   89%  │      │  ← Stat cards (2-col grid)
│  │  Total │  Rate  │      │
│  │ Habits │        │      │
│  └────────┴────────┘      │
│  ┌────────┬────────┐      │
│  │  42 🔥 │  Lv.12 │      │
│  │ Best   │ Current│      │
│  │ Streak │ Level  │      │
│  └────────┴────────┘      │
│                            │
│  ─── Bottom Safe Area ─── │
└────────────────────────────┘

┌────────────────────────────┐
│  🏠    📊    📅    👤     │  ← Bottom Tab Bar
│ Home  Stats  Cal  Profile  │     (Fixed, blurred bg)
└────────────────────────────┘
```

#### Greeting Logic

```typescript
function getGreeting(): { greeting: string; emoji: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: 'Good Morning', emoji: '👋', subtitle: 'Let\'s make today count.' };
  if (hour < 17) return { greeting: 'Good Afternoon', emoji: '☀️', subtitle: 'Keep the momentum going.' };
  if (hour < 21) return { greeting: 'Good Evening', emoji: '🌅', subtitle: 'Finish strong today.' };
  return { greeting: 'Good Night', emoji: '🌙', subtitle: 'Reflect on your wins.' };
}
```

#### Dashboard Animations

| Element | Animation | Trigger |
|---------|-----------|---------|
| Greeting | Fade + slide up (20px) | On mount |
| Tree | Continuous gentle sway | Always |
| XP Bar | Progress fill + number count-up | On mount + on XP gain |
| Today's Progress | Ring draw animation (0.8s) | On mount |
| Habit Cards | Staggered fade-up (100ms stagger) | On mount |
| AI Card | Slide in from right (0.5s delay) | On mount |
| Stat Cards | Pop-in on scroll (intersection observer) | Scroll into view |
| Quick Add | Scale pulse (subtle, 3s loop) | Always |

---

### 4.6 Habit Detail Screen

**Route:** `/habits/[id]`  
**Opened via:** Tapping habit card

```
┌────────────────────────────┐
│  ← Back       ⋮ Menu      │
│                            │
│     🏃                     │
│   Morning Run              │  ← Large emoji + name
│   Fitness • Daily          │  ← Category badge + frequency
│                            │
│  ┌──────────────────────┐  │
│  │                      │  │
│  │   🔥 42              │  │  ← Streak hero card
│  │   Day Streak         │  │     (animated number)
│  │                      │  │
│  │  Best: 56 🔥         │  │
│  └──────────────────────┘  │
│                            │
│  This Week                 │
│  M  T  W  T  F  S  S      │  ← Weekly mini-calendar
│  ✅ ✅ ✅ ⬜ ⬜ ⬜ ⬜      │     (green dots for done)
│                            │
│  ┌──────────────────────┐  │
│  │ ● Mark Complete      │  │  ← Primary action
│  └──────────────────────┘  │
│                            │
│  History                   │
│  ┌──────────────────────┐  │
│  │ Jul 1  ✅ Completed   │  │
│  │ Jun 30 ✅ Completed   │  │  ← Scrollable history
│  │ Jun 29 ❌ Skipped     │  │
│  │ Jun 28 ✅ Completed   │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ ⚙️  Edit Habit       │  │
│  │ 🗑  Delete Habit     │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

#### Swipe Actions (on Habit Card in Dashboard)

```
← Swipe Left: Skip (yellow, "Skip Today")
→ Swipe Right: Complete (green, "Complete")
← Long Swipe Left: Delete (red, "Delete")
```

**Animation:** Card follows finger, springs back or snaps. Background color reveals as card moves. Haptic feedback on snap.

#### Habit Card States

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ 🏃 Morning Run          │  │ 📚 Read 30 Minutes      │
│ 🔥 42 Day Streak        │  │ 🔥 15 Day Streak        │
│ ○ Pending               │  │ ● Completed ✓           │
│ (Neutral bg)            │  │ (Subtle green bg)       │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ 💪 Gym Session          │  │ 🧘 Meditate             │
│ ○ Skipped Today         │  │ ⚠️ At Risk              │
│ (Muted bg, strikethrough)│  │ (Warning bg, pulsing)  │
└─────────────────────────┘  └─────────────────────────┘
```

---

### 4.7 Analytics Screen

**Route:** `/analytics`  
**Second tab in bottom navigation.**

```
┌────────────────────────────┐
│  Analytics                 │
│                            │
│  ┌─────┬─────┬─────┐      │
│  │  W  │  M  │  Y  │      │  ← Time period tabs
│  └─────┴─────┴─────┘      │
│         (Week selected)    │
│                            │
│  Completion Rate           │
│  ┌──────────────────────┐  │
│  │  📈 Line Chart       │  │  ← Recharts LineChart
│  │  7-day trend         │  │     Animated path
│  │  60% → 72% → 89%     │  │     Gradient fill
│  └──────────────────────┘  │
│                            │
│  Habit Breakdown           │
│  ┌──────────────────────┐  │
│  │     🍩 Donut         │  │  ← Recharts PieChart
│  │  35% Fitness          │  │     Animated segments
│  │  25% Learning         │  │
│  │  20% Health           │  │
│  │  15% Mindfulness      │  │
│  │   5% Finance          │  │
│  └──────────────────────┘  │
│                            │
│  Daily Distribution        │
│  ┌──────────────────────┐  │
│  │  ▓▓▓▓▓▓▓▓▓▓  Mon     │  │  ← Horizontal bar chart
│  │  ▓▓▓▓▓▓▓▓▓▓▓ Tue    │  │     Animated width
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Wed │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Thu │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓ Fri  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Sat│  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Sun │  │
│  └──────────────────────┘  │
│                            │
│  Calendar Heatmap          │
│  ┌──────────────────────┐  │
│  │  Su Mo Tu We Th Fr Sa│  │  ← GitHub-style heatmap
│  │  ·· ·· ··  ○  ●  ●  │  │     3 months view
│  │  ●  ●  ●  ○  ●  ●   │  │     ○ = missed
│  │  ●  ●  ○  ●  ●  ··  │  │     ● = completed
│  │  ...12 more rows...  │  │     Intensity = streaks
│  └──────────────────────┘  │
│                            │
│  Highlights                │
│  ┌────────┬────────┐      │
│  │ 🏆     │ 📉     │      │
│  │ Best   │ Worst  │      │
│  │ Run    │ Medit. │      │
│  │ 89%    │ 34%    │      │
│  └────────┴────────┘      │
│  ┌──────────────────────┐  │
│  │ 🔥  42 Day Streak   │  │
│  │     Longest streak!  │  │
│  └──────────────────────┘  │
│                            │
│  ─── Bottom Safe Area ─── │
└────────────────────────────┘
```

#### Chart Animation Specs

| Chart | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Line Chart | Path draw + gradient fade | 1.2s | ease-out |
| Donut Chart | Segment sweep (one by one) | 0.8s total | spring |
| Bar Chart | Width grow from 0 | 0.6s total | spring |
| Heatmap | Cells fade in (staggered, center out) | 0.5s total | ease-out |

---

### 4.8 Calendar Screen

**Route:** `/calendar`  
**Third tab in bottom navigation.**

```
┌────────────────────────────┐
│  Calendar                  │
│                            │
│  ← June 2026 →            │  ← Month navigation
│                            │
│  Su Mo Tu We Th Fr Sa     │
│     1  2  3  4  5  6     │
│   7  8  9 10 11 12 13    │
│  14 15 16 17 18 19 20    │
│  21 22 [23] 24 25 26 27  │  ← Today highlighted
│  28 29 30                 │  ← React Day Picker
│                            │
│  ○ = Missed               │
│  ● = Completed            │
│  ◎ = Perfect day          │  ← All habits done
│  ◉ = Partial              │
│                            │
│  July 2, 2026             │
│  ┌──────────────────────┐  │
│  │ 🏃 ✅ Morning Run    │  │
│  │ 📚 ✅ Read 30m       │  │  ← Selected day details
│  │ 💧 ❌ 8 Glasses      │  │
│  │ 🧘 ✅ Meditate       │  │
│  └──────────────────────┘  │
│                            │
│  ─── Bottom Safe Area ─── │
└────────────────────────────┘
```

**Interaction:**
- Swipe left/right to change months (spring animation)
- Tap day to view details (bottom sheet slides up)
- Long press day for quick-add habit
- Pull down for year view (morph animation)

---

### 4.9 Journal Screen

**Routes:** `/journal`, `/journal/[id]`, `/journal/new`  
**Accessed from:** Dashboard "Journal" card or Profile tab

#### Journal List

```
┌────────────────────────────┐
│  Journal                   │
│                     + New  │
│                            │
│  ┌──────────────────────┐  │
│  │ July 2, 2026         │  │
│  │ 😊  😊😊😊⚡⚡  🟢🟢│  │  ← Mood • Energy • Focus
│  │ "Today was productiv…│  │
│  │  📸  🎤              │  │  ← Has photo, has voice
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ July 1, 2026         │  │
│  │ 😐  ⚡⚡  🟡        │  │
│  │ "Could have been be…│  │
│  └──────────────────────┘  │
│  ...more entries...        │
└────────────────────────────┘
```

#### New Journal Entry

```
┌────────────────────────────┐
│  ← Cancel    New Entry     │
│                            │
│  July 2, 2026 • Thursday   │
│                            │
│  How are you feeling?      │
│  😢  😔  😐  😊  😍     │  ← Mood picker
│                            │
│  Energy Level              │
│  ⚡⚡⚡○○                  │  ← 5-dot energy
│                            │
│  Focus                     │
│  🟢🟢🟢○○                 │  ← 5-dot focus
│                            │
│  ┌──────────────────────┐  │
│  │                      │  │
│  │  What's on your      │  │
│  │  mind today?         │  │
│  │                      │  │
│  │                      │  │
│  └──────────────────────┘  │
│                            │
│  📸 Add Photo  🎤 Record  │  ← Media buttons
│                            │
│  ┌──────────────────────┐  │
│  │ 🤖 AI Summary        │  │  ← AI analyzes entry
│  │ "Based on your       │  │     and habits today
│  │  journal, you had     │  │
│  │  a productive day..." │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │     Save Entry       │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

**Voice Journal:** Record audio → Upload to Supabase Storage → Groq Whisper for transcription → Save both.

**AI Summary:** On save, send entry text + today's habits to Groq for a 2-3 sentence reflective summary.

---

### 4.10 Tree of Life Screen

**Route:** `/tree`  
**The crown jewel.** This is what makes GrindLog special.

```
┌────────────────────────────┐
│  ← Dashboard               │
│                            │
│  🌳 The Tree of Life       │
│                            │
│  ┌──────────────────────┐  │
│  │                      │  │
│  │      ☁️  ☁️          │  │
│  │    🦋   🕊️          │  │
│  │      🌿🌿🌿          │  │
│  │    🌿  🌳  🌿       │  │  ← Full animated tree
│  │   🌿   🌳   🌿      │  │     with all elements
│  │  🌿    🌳    🌿     │  │
│  │       🪵🪵          │  │
│  │     🌸  💧  🌸      │  │
│  │                      │  │
│  └──────────────────────┘  │
│                            │
│  Garden Level 12           │
│  ████████████░░ 840/1200   │
│                            │
│  Your Stats                │
│  ┌────────┬────────┐      │
│  │ 💧 847 │ 🌿 142 │      │
│  │ Waters │ Leaves │      │
│  └────────┴────────┘      │
│  ┌────────┬────────┐      │
│  │ 🦋 23  │ 🌸 8   │      │
│  │ Butter-│ Flowers│      │
│  │ flies  │        │      │
│  └────────┴────────┘      │
│  ┌────────┬────────┐      │
│  │ 🕊️ 5   │ ✨ 1   │      │
│  │ Birds  │ Golden │      │
│  │        │ Tree   │      │
│  └────────┴────────┘      │
│                            │
│  Growth Timeline           │
│  ┌──────────────────────┐  │
│  │ 🌱 → 🌿 → 🪴 → 🌳   │  │  ← Visual growth stages
│  │ Wk1   Wk2  Wk4  Wk8  │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

#### Tree Growth System

```
Stage 0: Seed         (0 habits tracked)
Stage 1: Sprout       (1+ habits, 1+ day streak)
Stage 2: Small Plant  (7+ day streak OR 50 completions)
Stage 3: Bush         (30+ day streak OR 200 completions)
Stage 4: Young Tree   (60+ day streak OR 500 completions)
Stage 5: Mature Tree  (100+ day streak OR 1000 completions)
Stage 6: Flowering    (365+ day streak OR 5000 completions)
Stage 7: Golden Tree  (1000+ day streak OR 10000 completions)
```

#### Tree Elements (Unlock Order)

| Element | Unlock Condition | Visual |
|---------|-----------------|--------|
| Seed | App install | Single seed in soil |
| Water Drops | Complete 1 habit | Blue droplets around seed |
| Sprout | 3-day streak | Green sprout from seed |
| Leaves | 7-day streak | Small leaves on sprout |
| Small Flowers | 14-day streak | Tiny white flowers |
| Butterflies | 21-day streak | Animated butterflies |
| Birds | 30-day streak | Small birds in branches |
| Large Flowers | 60-day streak | Colorful blossoms |
| Fireflies | 100-day streak | Glowing dots at night |
| Golden Tree | 365-day streak | Entire tree turns golden |

#### Tree Animation States

```
Idle:        Gentle sway (rotate 0° → 2° → 0° → -2° → 0°, 6s loop)
Watered:     Bounce + sparkle particles (0.5s, spring)
New Leaf:    Leaf unfurls (scale 0 → 1, 0.3s, spring)
New Flower:  Flower blooms (scale + opacity, 0.5s, ease-out)
Butterfly:   Flutter path (random bezier curve, 3s loop)
Golden:      Shimmer gradient across tree (infinite, 2s cycle)
```

---

### 4.11 Achievements Screen

**Route:** `/achievements`  
**Access from:** Profile or Tree screen

```
┌────────────────────────────┐
│  ← Back     Achievements   │
│                            │
│  12 of 48 Unlocked         │
│  ████████░░░░░░░░ 25%     │
│                            │
│  ┌──────────────────────┐  │
│  │ 🏆 First Steps       │  │  ← Unlocked (full color)
│  │ Complete your first  │  │
│  │ habit                │  │
│  │ ✓ Jul 1, 2026       │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 🔒 7-Day Champion   │  │  ← Locked (grayscale)
│  │ 7-day streak         │  │
│  │ Progress: 4/7 ████░░ │  │
│  └──────────────────────┘  │
│                            │
│  Categories                │
│  🏆 Streaks (8)           │
│  📊 Consistency (12)       │
│  🌳 Tree (8)              │
│  🎯 Special (10)          │
│  👑 Legendary (10)        │
└────────────────────────────┘
```

---

### 4.12 Premium Screen

**Route:** `/premium`  
**Exactly like Headspace's premium pitch.** Emotional, visual, compelling.

```
┌────────────────────────────┐
│  ← Back                    │
│                            │
│  ┌──────────────────────┐  │
│  │                      │  │
│  │   🌱 → 🌿 → 🌳      │  │  ← Animated tree growth
│  │                      │  │     through all stages
│  │   Unlock Your        │  │
│  │   Full Potential     │  │
│  │                      │  │
│  └──────────────────────┘  │
│                            │
│  Why Go Premium?           │
│                            │
│  ┌──────────────────────┐  │
│  │ 🌳 Unlimited Habits  │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🤖 Full AI Coach     │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 📊 Advanced Charts   │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🎨 Custom Themes     │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 📤 Data Export       │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🔔 Smart Reminders   │  │
│  └──────────────────────┘  │
│                            │
│  What Users Say            │
│  ┌──────────────────────┐  │
│  │ ⭐⭐⭐⭐⭐            │  │  ← Review cards
│  │ "Changed my life..." │  │     (carousel)
│  │ — Rahul, 28          │  │
│  └──────────────────────┘  │
│                            │
│  Choose Your Plan          │
│                            │
│  ┌──────────────────────┐  │
│  │ ⭐ Most Popular      │  │
│  │ Annual               │  │  ← Highlighted
│  │ ₹1,999/year          │  │
│  │ ₹166/month           │  │
│  │ Save 44%             │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Monthly              │  │
│  │ ₹299/month           │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Legend (Lifetime)    │  │
│  │ ₹4,999 one-time      │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │  Start Free Trial    │  │  ← CTA
│  │  7 days free          │  │
│  └──────────────────────┘  │
│                            │
│  No commitments. Cancel   │
│  anytime.                 │
└────────────────────────────┘
```

**Checkout Flow:**
1. Select plan → Razorpay checkout sheet (bottom sheet style)
2. Payment processing animation (tree grows through stages)
3. Confetti burst on success
4. Premium badge appears on profile
5. Tree gets golden glow effect

---

### 4.13 Profile / Settings Screen

**Route:** `/profile`  
**Fourth tab in bottom navigation.**

```
┌────────────────────────────┐
│  Profile                   │
│                            │
│  ┌──────────────────────┐  │
│  │ 👤  Priya Sharma     │  │
│  │ 📧 priya@email.com   │  │  ← Profile card
│  │ 🌳 Level 12 Gardener │  │
│  │ ⭐ Premium Member    │  │
│  └──────────────────────┘  │
│                            │
│  Settings                  │
│  ┌──────────────────────┐  │
│  │ 🎨 Theme         →   │  │
│  │ 🛡 Privacy       →   │  │
│  │ 🔔 Notifications →   │  │
│  │ 💾 Backup & Sync →   │  │
│  │ 📤 Export Data   →   │  │
│  │ ⭐ Premium       →   │  │
│  │ ℹ️ About         →   │  │
│  │ 🆘 Help & Support→   │  │
│  │ 🗑 Delete Account→   │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │     Sign Out         │  │
│  └──────────────────────┘  │
│                            │
│  ─── Bottom Safe Area ─── │
└────────────────────────────┘
```

---

## 5. Animation & Motion System

### 5.1 Animation Principles

```
1. SPRING FIRST — Every motion uses spring physics.
   No linear. No ease-in-out unless explicitly needed.

2. MEANINGFUL — Every animation tells a story.
   No animation "just because."

3. FAST — Interactions respond within 100ms.
   Feedback is instant.

4. CONTEXTUAL — Transitions respect user's navigation
   direction. Forward → slide left. Back → slide right.

5. HIERARCHICAL — Parent elements move before children.
   Staggered, cascading animations.
```

### 5.2 Spring Presets

```typescript
const springs = {
  // Primary interaction spring
  default: { type: 'spring', stiffness: 300, damping: 30 },

  // Bouncy, playful (achievements, level ups)
  bouncy: { type: 'spring', stiffness: 400, damping: 15 },

  // Snappy, precise (toggles, switches)
  snappy: { type: 'spring', stiffness: 500, damping: 35 },

  // Gentle, calm (tree sway, breathing)
  gentle: { type: 'spring', stiffness: 100, damping: 20 },

  // Quick micro-interactions
  micro: { type: 'spring', stiffness: 600, damping: 40 },

  // Page transitions
  page: { type: 'spring', stiffness: 250, damping: 30 },
} as const;
```

### 5.3 Page Transition Specifications

| From → To | Direction | Animation | Duration |
|-----------|-----------|-----------|----------|
| Splash → Onboarding | Forward | Fade through black | 0.4s |
| Onboarding → Auth | Forward | Slide up from bottom | 0.3s |
| Auth → AI Plan | Forward | Slide left | 0.3s |
| AI Plan → Dashboard | Forward | Scale up + fade | 0.5s |
| Dashboard → Habit Detail | Forward | Slide left | 0.25s |
| Any → Back | Back | Slide right | 0.25s |
| Tab Switch | N/A | Crossfade (opacity) | 0.15s |
| Modal/Bottom Sheet | Forward | Slide up from bottom | 0.35s spring |
| Modal/Bottom Sheet → Dismiss | Back | Slide down | 0.25s |

### 5.4 Micro-Interaction Specs

| Interaction | Animation | Specs |
|-------------|-----------|-------|
| Button Tap | Scale 1 → 0.96 → 1 | 0.15s, spring |
| Toggle | Background color + thumb slide | 0.2s, snappy |
| Checkbox | Scale + checkmark draw | 0.2s, bouncy |
| Swipe Complete | Card slides right, green bg reveals, ✓ icon fades in | 0.35s, spring |
| Swipe Skip | Card slides left, yellow bg reveals, skip icon fades in | 0.35s, spring |
| Pull to Refresh | Tree grows slightly, particles | Infinite while pulling |
| Tab Bar Icon | Scale 1 → 1.2 → 1 on tap | 0.2s, bouncy |
| Notification Badge | Scale 0 → 1 with bounce | 0.3s, bouncy |
| Level Up | Screen flash, XP bar fills, level text scales | 1.2s sequence |
| Achievement Unlock | Card flips 180° (3D), confetti burst | 1.0s |

### 5.5 Haptic Feedback Map

```typescript
const haptics = {
  habitComplete: 'medium',      // Satisfying thud
  habitSkip: 'light',           // Gentle tap
  levelUp: 'heavy' + 'rigid',   // Strong celebration
  achievement: 'heavy' + 'soft',
  buttonTap: 'light',
  swipeAction: 'selection',
  tabSwitch: 'light',
  error: 'notificationError',
  success: 'notificationSuccess',
};
```

---

## 6. Database Schema

### 6.1 Supabase Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Gamification
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Tree
  tree_stage INTEGER DEFAULT 0,      -- 0-7
  tree_water_count INTEGER DEFAULT 0,
  tree_leaves_count INTEGER DEFAULT 0,
  tree_butterflies_count INTEGER DEFAULT 0,
  tree_birds_count INTEGER DEFAULT 0,
  tree_flowers_count INTEGER DEFAULT 0,
  tree_golden BOOLEAN DEFAULT FALSE,
  
  -- Premium
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier TEXT,                  -- 'monthly', 'annual', 'lifetime'
  premium_expires_at TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT FALSE,
  
  -- Preferences
  theme TEXT DEFAULT 'light',         -- 'light', 'dark'
  notifications_enabled BOOLEAN DEFAULT TRUE,
  morning_reminder TIME DEFAULT '08:00',
  afternoon_reminder TIME DEFAULT '14:00',
  evening_reminder TIME DEFAULT '20:00',
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  ai_plan_created BOOLEAN DEFAULT FALSE
);

-- RLS: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

#### `habits`
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Core
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🌱',
  category TEXT NOT NULL,             -- 'fitness', 'learning', 'health', 'mindfulness', 'finance', 'social', 'work', 'creative', 'other'
  frequency TEXT NOT NULL,            -- 'daily', 'weekly', 'weekdays', 'weekends', 'custom'
  custom_days INTEGER[],              -- [1,3,5] = Mon, Wed, Fri (if custom)
  
  -- Scheduling
  preferred_time TEXT,                -- 'morning', 'afternoon', 'evening', 'night', 'anytime'
  reminder_time TIME,
  
  -- Goals
  target_count INTEGER DEFAULT 1,     -- How many times per frequency
  target_unit TEXT,                   -- 'times', 'minutes', 'pages', 'glasses', etc.
  target_value INTEGER,               -- e.g., 30 (for 30 minutes)
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#34C759',
  
  -- Stats (denormalized for performance)
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_skips INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  
  -- AI
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_reasoning TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habits_active ON habits(is_active) WHERE is_active = TRUE;
```

#### `habit_logs`
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  status TEXT NOT NULL,               -- 'completed', 'skipped', 'missed'
  completed_at TIMESTAMPTZ,
  
  -- Optional metadata
  value INTEGER,                      -- Actual count (e.g., 45 minutes done)
  note TEXT,
  mood TEXT,                          -- 'great', 'good', 'okay', 'hard', 'bad'
  
  -- Streak tracking
  streak_before INTEGER,
  streak_after INTEGER,
  
  -- Rewards earned
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX idx_logs_habit_date ON habit_logs(habit_id, date);
```

#### `journal_entries`
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Content
  title TEXT,
  content TEXT,
  
  -- Metrics
  mood INTEGER,                       -- 1-5
  energy INTEGER,                     -- 1-5
  focus INTEGER,                      -- 1-5
  
  -- Media
  photo_urls TEXT[],                  -- Supabase Storage URLs
  voice_note_url TEXT,
  voice_transcript TEXT,
  
  -- AI
  ai_summary TEXT,
  ai_sentiment TEXT,                  -- 'positive', 'neutral', 'negative'
  ai_insights TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);
```

#### `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,           -- 'first_habit', 'seven_day_streak', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT DEFAULT '🏆',
  category TEXT NOT NULL,             -- 'streaks', 'consistency', 'tree', 'special', 'legendary'
  xp_reward INTEGER DEFAULT 100,
  coins_reward INTEGER DEFAULT 50,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0
);
```

#### `user_achievements`
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER DEFAULT 1,
  
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
```

#### `ai_sessions`
```sql
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  session_type TEXT NOT NULL,         -- 'plan_generation', 'coach_chat', 'weekly_report', 
                                      -- 'prediction', 'motivation', 'suggestion', 'schedule', 'reflection'
  
  prompt TEXT,
  response TEXT,
  model TEXT DEFAULT 'llama-4',
  tokens_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own AI sessions" ON ai_sessions FOR SELECT USING (auth.uid() = user_id);
```

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  
  plan TEXT NOT NULL,                 -- 'monthly', 'annual', 'lifetime'
  status TEXT NOT NULL,               -- 'active', 'cancelled', 'expired', 'trial'
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

### 6.2 Supabase Storage Buckets

| Bucket | Purpose | Public | RLS |
|--------|---------|--------|-----|
| `avatars` | Profile pictures | Yes | User owns their avatar |
| `journal-photos` | Journal photo attachments | No | User owns their photos |
| `journal-voice` | Voice journal recordings | No | User owns their recordings |
| `achievement-icons` | Achievement badge images | Yes | Read-only public |

### 6.3 Realtime Subscriptions

```typescript
// Real-time channels
const channels = {
  habitUpdates: `habits:user_id=eq.${userId}`,
  treeUpdates: `profiles:id=eq.${userId}`,
  achievementUpdates: `user_achievements:user_id=eq.${userId}`,
  xpUpdates: `profiles:id=eq.${userId}`,
};
```

---

## 7. AI System Architecture

### 7.1 Groq API Integration

```typescript
// lib/ai/groq.ts

interface GroqConfig {
  apiKey: string;
  defaultModel: 'llama-4' | 'deepseek' | 'qwen';
  maxTokens: number;
  temperature: number;
}

const GROQ_MODELS = {
  'llama-4': 'meta-llama/llama-4-maverick-17b-128e-instruct',
  'deepseek': 'deepseek-ai/deepseek-r1-distill-qwen-32b',
  'qwen': 'qwen/qwen-2.5-32b',
} as const;
```

### 7.2 AI Features & Prompts

#### 7.2.1 Habit Plan Generator
- **Trigger:** Onboarding Step 4
- **Input:** Goal, experience level, available times, time budget
- **Output:** JSON with 3-5 habits, each with name, emoji, category, frequency, target, AI reasoning
- **Model:** llama-4 (balanced, free)

#### 7.2.2 Weekly Report
- **Trigger:** Every Sunday 6 PM (cron job) + manual request
- **Input:** Week's habit logs, journal entries, streaks, completion rates
- **Output:** 3-paragraph report: wins, areas for improvement, next week suggestion
- **Model:** llama-4

#### 7.2.3 AI Coach Chat
- **Trigger:** User taps AI Card on dashboard
- **Input:** Conversation history, user stats, recent habits
- **Output:** Contextual coaching, motivation, habit advice
- **Model:** deepseek (reasoning-heavy)
- **Rate Limit:** 10 messages/day (free), unlimited (premium)

#### 7.2.4 Prediction Engine
- **Trigger:** Analytics screen, "Predictions" tab
- **Input:** 90-day habit history, current streaks, patterns
- **Output:** Streak predictions, risk alerts for habits likely to be dropped
- **Model:** deepseek

#### 7.2.5 Motivation Generator
- **Trigger:** Dashboard AI Card, notification prompts
- **Input:** Current streaks, time of day, recent performance
- **Output:** 1-2 sentence motivational message contextualized to user
- **Model:** qwen (fast, cheap)

#### 7.2.6 Smart Suggestions
- **Trigger:** When user has maintained all habits for 14+ days
- **Input:** Current habits, categories, completion patterns
- **Output:** 1-2 new habit suggestions that complement existing ones
- **Model:** llama-4

#### 7.2.7 Schedule Builder
- **Trigger:** Settings or AI Plan modification
- **Input:** All active habits with preferred times, daily availability
- **Output:** Optimized daily schedule with time blocks
- **Model:** deepseek

#### 7.2.8 Reflection Assistant
- **Trigger:** After journal entry is saved
- **Input:** Journal text, today's habits, mood/energy data
- **Output:** 2-3 sentence reflective summary + 1 question for deeper thinking
- **Model:** llama-4

### 7.3 Rate Limiting & Caching

```typescript
const AI_RATE_LIMITS = {
  free: {
    planGeneration: 3,      // per lifetime
    coachChat: 10,          // per day
    weeklyReport: 1,        // per week
    predictions: 2,         // per week
    motivation: 5,          // per day
    suggestions: 3,         // per month
    scheduleBuilder: 5,     // per month
    reflection: 2,          // per day
  },
  premium: {
    planGeneration: Infinity,
    coachChat: Infinity,
    weeklyReport: Infinity,
    predictions: Infinity,
    motivation: Infinity,
    suggestions: Infinity,
    scheduleBuilder: Infinity,
    reflection: Infinity,
  },
};
```

### 7.4 AI Response Caching

Cache identical or similar prompts for 1 hour to reduce API calls:

```typescript
const aiCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
```

---

## 8. Gamification Engine

### 8.1 XP System

| Action | XP | Coins |
|--------|-----|-------|
| Complete a habit | +50 | +10 |
| Perfect day (all habits) | +100 | +25 |
| 7-day streak | +200 | +50 |
| 30-day streak | +1000 | +200 |
| 100-day streak | +5000 | +1000 |
| Journal entry | +30 | +5 |
| AI plan created | +150 | +0 |
| First habit created | +100 | +20 |
| Achievement unlocked | +varies | +varies |
| Tree stage up | +300 | +100 |
| Refer a friend | +500 | +100 |

### 8.2 Level System

```
Level 1:   0 XP        — Seed
Level 2:   100 XP      — Sprout
Level 3:   300 XP      — Seedling
Level 4:   600 XP      — Small Plant
Level 5:   1,000 XP    — Growing Plant
Level 6:   1,500 XP    — Bush
Level 7:   2,200 XP    — Young Tree
Level 8:   3,000 XP    — Tree
Level 9:   4,000 XP    — Strong Tree
Level 10:  5,200 XP    — Mature Tree
Level 15:  12,000 XP   — Blossoming Tree
Level 20:  22,000 XP   — Great Tree
Level 25:  38,000 XP   — Ancient Tree
Level 30:  60,000 XP   — Forest Guardian
Level 40:  100,000 XP  — Tree of Life
Level 50:  200,000 XP  — Legend
```

**Formula:** `XP_needed = 100 * level * (1 + level * 0.15)`

### 8.3 Achievements List

#### Streaks Category
| Key | Name | Description | Target |
|-----|------|-------------|--------|
| `first_habit` | First Steps | Complete your first habit | 1 |
| `three_day` | Getting Started | 3-day streak on any habit | 3 |
| `seven_day` | Weekly Warrior | 7-day streak | 7 |
| `fourteen_day` | Fortnight Force | 14-day streak | 14 |
| `twenty_one_day` | Habit Formed | 21-day streak | 21 |
| `thirty_day` | Monthly Master | 30-day streak | 30 |
| `sixty_day` | Two Month Titan | 60-day streak | 60 |
| `hundred_day` | Centurion | 100-day streak | 100 |
| `three_sixty_five` | Year of Growth | 365-day streak | 365 |

#### Consistency Category
| Key | Name | Description |
|-----|------|-------------|
| `perfect_week` | Perfect Week | All habits done every day for a week |
| `perfect_month` | Perfect Month | All habits done every day for a month |
| `early_bird` | Early Bird | Complete all habits before 9 AM for 7 days |
| `night_owl` | Night Owl | Complete all habits after 9 PM for 7 days |
| `no_skips_30` | No Excuses | 30 days without skipping any habit |

#### Tree Category
| Key | Name | Description |
|-----|------|-------------|
| `first_water` | First Drop | Water your tree for the first time |
| `sprout_unlocked` | Life Begins | Tree reaches sprout stage |
| `first_leaf` | First Leaf | Tree grows its first leaf |
| `first_butterfly` | Butterfly Effect | First butterfly appears |
| `first_bird` | A Friend Arrives | First bird visits your tree |
| `blooming` | In Bloom | First flowers appear |
| `golden` | Golden Touch | Tree turns golden |
| `forest_starter` | Forest Guardian | Maintain 5+ habits for 30 days |

---

## 9. Notification System

### 9.1 Notification Schedule

| Time | Type | Content | Condition |
|------|------|---------|-----------|
| 8:00 AM | Morning Reminder | "🌅 Good morning! Your tree is waiting. 3 habits to water today." | Has pending habits |
| 2:00 PM | Afternoon Nudge | "☀️ Halfway through! You've done 2 of 5 habits. Keep going!" | <50% complete |
| 8:00 PM | Evening Reminder | "🌙 Almost done! 1 habit left to complete your day." | >50% but <100% |
| 9:30 PM | Streak Alert | "⚠️ Your 42-day streak on 'Morning Run' is at risk!" | Habit not done, high streak |
| Sunday 6 PM | Weekly Report | "📊 Your weekly report is ready! Tap to view." | AI report generated |
| Random | AI Motivation | Contextual AI-generated encouragement | 1-2x per day max |
| On Level Up | Level Up | "🎉 Level 13 achieved! You're now a Strong Tree!" | Level increased |
| On Achievement | Achievement | "🏆 Achievement Unlocked: Perfect Week!" | New achievement |

### 9.2 OneSignal Integration

```typescript
// services/notifications.ts
interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, string>;
  schedule?: Date;
  category?: 'reminder' | 'streak' | 'achievement' | 'ai' | 'report';
}
```

### 9.3 In-App Notification Center

```
┌────────────────────────────┐
│  Notifications             │
│                            │
│  Today                     │
│  ┌──────────────────────┐  │
│  │ 🌅 Morning reminder  │  │
│  │ 2 hours ago          │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ 🏆 Achievement!      │  │
│  │ Perfect Week! 🎉     │  │
│  └──────────────────────┘  │
│                            │
│  Yesterday                 │
│  ...more...                │
└────────────────────────────┘
```

---

## 10. Security Architecture

### 10.1 Authentication Flow

```
User → Supabase Auth (JWT) → RLS Policies → Database
         ↓
   Google OAuth / Microsoft OAuth / Email+Password
         ↓
   JWT stored in secure httpOnly cookie
         ↓
   Row Level Security on every table
```

### 10.2 Row Level Security Policies

**Principle:** Every table has RLS enabled. Every policy checks `auth.uid()`.

```sql
-- Example: habit_logs
CREATE POLICY "Users can only access their own logs"
ON habit_logs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 10.3 Data Encryption

- **At Rest:** Supabase PostgreSQL encryption (AES-256)
- **In Transit:** HTTPS/TLS 1.3 everywhere
- **Sensitive Data:** Journal entries encrypted at application level before storage
- **API Keys:** Never exposed client-side. Server-side environment variables only.
- **PWA Storage:** IndexedDB for offline data, encrypted with user-derived key

### 10.4 Privacy Controls

- User can export all data (GDPR-compliant JSON export)
- User can delete account (cascading delete all data)
- No third-party analytics that compromise privacy
- AI prompts stripped of PII before sending to Groq
- Journal entries never leave the device unless user opts in

---

## 11. Performance Requirements

### 11.1 Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| **FCP** (First Contentful Paint) | <1.5s | Lighthouse |
| **LCP** (Largest Contentful Paint) | <2.0s | Lighthouse |
| **TBT** (Total Blocking Time) | <100ms | Lighthouse |
| **CLS** (Cumulative Layout Shift) | <0.05 | Lighthouse |
| **INP** (Interaction to Next Paint) | <100ms | CrUX |
| **SI** (Speed Index) | <2.0s | Lighthouse |

### 11.2 Runtime Performance

- **60 FPS** — All animations, scroll, transitions
- **Jank-free** — No long tasks (>50ms) on main thread
- **Memory** — <100MB heap usage on mobile
- **Bundle** — <200KB initial JS (gzipped)
- **Images** — All served as WebP with srcset, lazy loaded
- **Fonts** — Self-hosted Inter, subset to Latin, font-display: swap

### 11.3 Offline Strategy

```typescript
// PWA Caching Strategy
const CACHE_STRATEGIES = {
  // Static assets — Cache First
  '/_next/static/*': 'CacheFirst',
  '/fonts/*': 'CacheFirst',
  '/icons/*': 'CacheFirst',
  '/images/*': 'CacheFirst',

  // Pages — Network First with offline fallback
  '/dashboard': 'NetworkFirst',
  '/analytics': 'NetworkFirst',
  '/calendar': 'NetworkFirst',

  // API — Network Only (but queue offline writes)
  '/api/*': 'NetworkOnly',
};

// Offline Queue
// When offline, queue habit completions in IndexedDB
// Sync when back online (Background Sync API)
```

### 11.4 Bundle Optimization

- Route-based code splitting (Next.js automatic)
- `lazy()` for below-fold components
- Tree-shake Lucide icons (only import used)
- Dynamic import for Recharts (heavy lib)
- `next/image` for all images
- Generate static params for known routes

---

## 12. Tech Stack & Dependencies

### 12.1 package.json

```json
{
  "name": "grindlog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",

    "motion": "^11.0.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.460.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",

    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.0",

    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",

    "recharts": "^2.15.0",
    "react-day-picker": "^9.4.0",
    "date-fns": "^4.1.0",

    "next-pwa": "^5.6.0",
    "groq-sdk": "^0.8.0",
    "onesignal-node": "^3.5.0",
    "razorpay": "^2.9.0",

    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

---

## 13. Folder Structure

```
GrindLog/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers, PWA meta)
│   ├── page.tsx                      # Splash screen (entry point)
│   ├── manifest.ts                   # PWA manifest generation
│   ├── sw.ts                         # Service worker
│   │
│   ├── (auth)/                       # Auth group (no tab bar)
│   │   ├── onboarding/
│   │   │   ├── page.tsx              # Onboarding carousel
│   │   │   └── ai-plan/
│   │   │       └── page.tsx          # AI habit plan creator
│   │   └── auth/
│   │       ├── signup/
│   │       │   └── page.tsx
│   │       ├── signin/
│   │       │   └── page.tsx
│   │       └── callback/
│   │           └── route.ts          # OAuth callback handler
│   │
│   ├── (app)/                        # Main app group (with tab bar)
│   │   ├── layout.tsx                # Tab bar layout
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── habits/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Habit detail
│   │   │   └── new/
│   │   │       └── page.tsx          # New habit form
│   │   ├── tree/
│   │   │   └── page.tsx              # Tree of Life (full view)
│   │   ├── journal/
│   │   │   ├── page.tsx              # Journal list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── achievements/
│   │   │   └── page.tsx
│   │   ├── premium/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── api/                          # API routes
│       ├── ai/
│       │   ├── generate-plan/route.ts
│       │   ├── coach/route.ts
│       │   ├── weekly-report/route.ts
│       │   ├── prediction/route.ts
│       │   ├── motivation/route.ts
│       │   ├── suggestions/route.ts
│       │   ├── schedule/route.ts
│       │   ├── reflection/route.ts
│       │   └── webhook/groq/route.ts
│       ├── habits/
│       │   ├── route.ts              # CRUD
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── logs/route.ts
│       ├── journal/
│       │   └── route.ts
│       ├── premium/
│       │   ├── checkout/route.ts     # Razorpay checkout
│       │   └── webhook/route.ts      # Razorpay webhook
│       ├── profile/route.ts
│       └── notifications/route.ts
│
├── components/                       # Shared UI components
│   ├── ui/                           # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── skeleton.tsx
│   │
│   ├── navigation/
│   │   ├── tab-bar.tsx               # Bottom tab bar
│   │   ├── nav-bar.tsx               # Top navigation bar
│   │   └── back-button.tsx
│   │
│   ├── habits/
│   │   ├── habit-card.tsx            # Swipeable habit card
│   │   ├── habit-card-skeleton.tsx
│   │   ├── habit-progress-ring.tsx   # Circular progress
│   │   ├── habit-streak-badge.tsx
│   │   ├── quick-add.tsx
│   │   └── habit-form.tsx
│   │
│   ├── tree/
│   │   ├── tree-of-life.tsx          # Main tree component
│   │   ├── tree-stage-seed.tsx
│   │   ├── tree-stage-sprout.tsx
│   │   ├── tree-stage-plant.tsx
│   │   ├── tree-stage-bush.tsx
│   │   ├── tree-stage-young.tsx
│   │   ├── tree-stage-mature.tsx
│   │   ├── tree-stage-flowering.tsx
│   │   ├── tree-stage-golden.tsx
│   │   ├── tree-particle.tsx         # Water drops, leaves, etc.
│   │   ├── tree-butterfly.tsx
│   │   └── tree-bird.tsx
│   │
│   ├── dashboard/
│   │   ├── greeting.tsx
│   │   ├── today-progress.tsx
│   │   ├── ai-coach-card.tsx
│   │   ├── stat-card.tsx
│   │   └── xp-bar.tsx
│   │
│   ├── analytics/
│   │   ├── line-chart.tsx
│   │   ├── donut-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── heatmap-calendar.tsx
│   │   └── highlights.tsx
│   │
│   ├── journal/
│   │   ├── journal-card.tsx
│   │   ├── mood-picker.tsx
│   │   ├── energy-picker.tsx
│   │   ├── voice-recorder.tsx
│   │   └── ai-summary-card.tsx
│   │
│   ├── achievements/
│   │   ├── achievement-card.tsx
│   │   ├── achievement-grid.tsx
│   │   └── achievement-toast.tsx
│   │
│   ├── premium/
│   │   ├── premium-hero.tsx
│   │   ├── feature-list.tsx
│   │   ├── review-carousel.tsx
│   │   ├── pricing-card.tsx
│   │   └── checkout-sheet.tsx
│   │
│   ├── gamification/
│   │   ├── level-badge.tsx
│   │   ├── xp-animation.tsx
│   │   ├── coin-animation.tsx
│   │   └── confetti.tsx
│   │
│   └── shared/
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── loading-spinner.tsx
│       ├── pull-to-refresh.tsx
│       └── safe-area.tsx
│
├── features/                         # Feature modules (business logic + UI)
│   ├── habits/
│   │   ├── hooks/
│   │   │   ├── use-habits.ts
│   │   │   ├── use-habit-logs.ts
│   │   │   └── use-habit-stats.ts
│   │   └── utils/
│   │       └── streak-calculator.ts
│   │
│   ├── tree/
│   │   ├── hooks/
│   │   │   └── use-tree.ts
│   │   └── utils/
│   │       └── tree-stage-engine.ts
│   │
│   ├── ai/
│   │   ├── hooks/
│   │   │   ├── use-ai-coach.ts
│   │   │   └── use-ai-plan.ts
│   │   └── prompts/
│   │       ├── plan-generator.ts
│   │       ├── weekly-report.ts
│   │       ├── coach.ts
│   │       ├── motivation.ts
│   │       └── reflection.ts
│   │
│   ├── journal/
│   │   └── hooks/
│   │       ├── use-journal.ts
│   │       └── use-voice-recorder.ts
│   │
│   ├── gamification/
│   │   ├── hooks/
│   │   │   ├── use-xp.ts
│   │   │   └── use-achievements.ts
│   │   ├── engine/
│   │   │   ├── xp-calculator.ts
│   │   │   ├── level-calculator.ts
│   │   │   └── achievement-checker.ts
│   │   └── data/
│   │       └── achievements.ts
│   │
│   └── premium/
│       ├── hooks/
│       │   └── use-subscription.ts
│       └── utils/
│           └── feature-gate.ts
│
├── animations/                       # Reusable animation presets
│   ├── springs.ts
│   ├── page-transitions.ts
│   ├── micro-interactions.ts
│   ├── confetti.ts
│   └── particles.ts
│
├── hooks/                            # Global shared hooks
│   ├── use-media-query.ts
│   ├── use-intersection-observer.ts
│   ├── use-local-storage.ts
│   ├── use-debounce.ts
│   ├── use-network-status.ts
│   └── use-pwa-install.ts
│
├── services/                         # External service integrations
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client (SSR)
│   │   ├── middleware.ts             # Auth middleware
│   │   └── realtime.ts
│   ├── groq/
│   │   └── client.ts
│   ├── onesignal/
│   │   └── client.ts
│   ├── razorpay/
│   │   └── client.ts
│   └── sentry/
│       └── client.ts
│
├── lib/                              # Utility functions
│   ├── utils.ts                      # clsx, cn, formatters
│   ├── date.ts                       # Date formatting, relative time
│   ├── validators.ts                 # Zod schemas
│   ├── constants.ts
│   └── errors.ts
│
├── store/                            # Zustand stores
│   ├── auth-store.ts
│   ├── habit-store.ts
│   ├── tree-store.ts
│   ├── ui-store.ts                   # Theme, modals, toasts
│   ├── notification-store.ts
│   └── offline-queue.ts
│
├── types/                            # TypeScript types
│   ├── database.ts                   # Supabase table types
│   ├── habit.ts
│   ├── tree.ts
│   ├── journal.ts
│   ├── achievement.ts
│   ├── ai.ts
│   ├── gamification.ts
│   └── premium.ts
│
├── styles/
│   ├── globals.css                   # Tailwind v4 + design tokens
│   └── fonts/
│       ├── Inter-Variable.woff2
│       └── JetBrainsMono-Variable.woff2
│
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── screenshots/
│   │   ├── screenshot-1.png
│   │   └── screenshot-2.png
│   └── og-image.png
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 14. API Routes & Services

### 14.1 API Route Map

```
POST   /api/ai/generate-plan        — AI habit plan generation
POST   /api/ai/coach                 — AI coach chat
POST   /api/ai/weekly-report         — Generate weekly report
POST   /api/ai/prediction            — Habit predictions
POST   /api/ai/motivation            — Motivational message
POST   /api/ai/suggestions           — Habit suggestions
POST   /api/ai/schedule              — Schedule optimization
POST   /api/ai/reflection            — Journal AI summary
POST   /api/ai/webhook/groq          — Groq streaming webhook

GET    /api/habits                   — List user habits
POST   /api/habits                   — Create habit
PUT    /api/habits/[id]              — Update habit
DELETE /api/habits/[id]              — Delete habit
POST   /api/habits/[id]/logs         — Log habit completion/skip

GET    /api/journal                  — List entries
POST   /api/journal                  — Create entry
PUT    /api/journal/[id]             — Update entry
DELETE /api/journal/[id]             — Delete entry

GET    /api/profile                  — Get profile
PUT    /api/profile                  — Update profile

POST   /api/premium/checkout         — Create Razorpay order
POST   /api/premium/webhook          — Razorpay webhook handler

POST   /api/notifications            — Register device token
```

### 14.2 Service Integration Patterns

```typescript
// services/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// services/groq/client.ts
import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});
```

---

## 15. Testing Strategy

### 15.1 Testing Layers

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (utils, hooks) | Vitest | 90% |
| Component | React Testing Library | 80% |
| Integration (flows) | Playwright | Key user journeys |
| E2E (critical paths) | Playwright | Onboarding, habit CRUD, AI flow |
| Visual Regression | Percy / Chromatic | All screens |
| Performance | Lighthouse CI | Budget enforcement |
| Accessibility | axe-core | WCAG 2.1 AA |

### 15.2 Critical Test Scenarios

1. User onboarding flow (all 4 steps + AI plan generation)
2. Habit CRUD operations (create, read, update, delete)
3. Habit completion (toggle, swipe)
4. Streak calculation accuracy
5. Tree stage progression
6. XP and level calculations
7. Offline habit completion + sync
8. Premium checkout flow
9. AI plan generation (mock Groq)
10. Journal CRUD + AI reflection
11. PWA install prompt
12. Push notification delivery

---

## 16. Launch Plan

### 16.1 Phase 1: Alpha (Weeks 1–4)

- [ ] Project scaffolding (Next.js + Tailwind + Typescript)
- [ ] Design system implementation (tokens, components)
- [ ] Auth flow (Supabase email + Google)
- [ ] Database schema + RLS policies
- [ ] Basic dashboard with static data
- [ ] Habit card component (no swipe yet)
- [ ] Tab bar navigation

### 16.2 Phase 2: Core Features (Weeks 5–8)

- [ ] Full habit CRUD
- [ ] Habit completion with animation
- [ ] Swipe actions on habit cards
- [ ] Streak tracking engine
- [ ] Tree of Life (stages 0–4)
- [ ] Basic analytics (line chart, donut)
- [ ] Calendar with React Day Picker
- [ ] Journal (text only)

### 16.3 Phase 3: AI & Gamification (Weeks 9–12)

- [ ] AI Plan Creator (Groq integration)
- [ ] AI Coach Chat
- [ ] XP & Level system
- [ ] Achievement engine
- [ ] Confetti & celebration animations
- [ ] AI Weekly Report

### 16.4 Phase 4: Polish & Premium (Weeks 13–16)

- [ ] Tree stages 5–7 (including Golden Tree)
- [ ] Full analytics suite
- [ ] Premium screen + Razorpay integration
- [ ] Push notifications (OneSignal)
- [ ] Offline support
- [ ] PWA manifest + install prompt
- [ ] Dark theme
- [ ] Performance optimization pass

### 16.5 Phase 5: Launch (Weeks 17–18)

- [ ] Security audit
- [ ] Lighthouse 95+ on all metrics
- [ ] Beta testing (20 users)
- [ ] Bug fixes from beta
- [ ] App Store screenshots
- [ ] Landing page
- [ ] Deploy to Vercel
- [ ] Submit to Product Hunt

### 16.6 Marketing Launch

| Channel | Action | Timeline |
|---------|--------|----------|
| Product Hunt | Featured launch | Launch day |
| Instagram | 5 Reels showing animations | Launch week |
| Reddit | r/productivity, r/selfimprovement | Launch day |
| YouTube Shorts | 3 Shorts (tree, AI, design) | Launch week |
| Twitter/X | Build-in-public thread | Ongoing |
| Discord | Community server | Pre-launch |

---

## 17. Future Modules

GrindLog is architected as a **Personal Growth OS**, not just a habit tracker.

### 17.1 Module Roadmap

```
v1.0 — 🌱 Habit System (MVP — this PRD)
v1.5 — 🧠 AI Coach v2 (vision, deeper insights)
v2.0 — 💪 Fitness Module (workout tracking, Apple Health sync)
v2.5 — 📖 Journal v2 (rich text, tags, search)
v3.0 — 🎯 Goals Module (OKR-style goal tracking)
v3.5 — 💰 Finance Module (expense tracking, budgets)
v4.0 — 😴 Sleep Module (sleep tracking, insights)
v4.5 — 📚 Learning Module (courses, reading lists, notes)
v5.0 — 📅 Planner Module (daily planning, time blocking)
v5.5 — 📊 Life Analytics (cross-module insights, life score)
v6.0 — 🌐 Social (friends, leaderboards, challenges)
```

### 17.2 Architecture for Extensibility

Each module follows the same pattern:
```
features/[module]/
├── components/      # Module-specific UI
├── hooks/           # Module-specific hooks
├── utils/           # Module-specific logic
├── store/           # Module-specific Zustand store
└── types/           # Module-specific types
```

Modules communicate through a shared event bus and the central Zustand store. The tree visualization is the unifying thread across all modules — every positive action across any module waters the tree.

---

## 18. Appendix

### 18.1 Competitor Analysis Matrix

| Feature | GrindLog | Streaks | Habitica | Headspace | TickTick |
|---------|----------|---------|----------|-----------|----------|
| Tree Visualization | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Coach (free) | ✅ | ❌ | ❌ | ❌ | ❌ |
| XP/Levels | ✅ | ❌ | ✅ | ❌ | ❌ |
| Achievements | ✅ | ❌ | ✅ | ❌ | ❌ |
| Journal | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voice Journal | ✅ | ❌ | ❌ | ❌ | ❌ |
| PWA Offline | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dark Theme | ✅ | ✅ | ❌ | ✅ | ✅ |
| Premium Design | ✅ | ✅ | ❌ | ✅ | ❌ |
| Module Extensible | ✅ | ❌ | ❌ | ❌ | ✅ |
| FREE to Build | ✅ | N/A | N/A | N/A | N/A |

### 18.2 Reference Inspirations

| App | What We're Borrowing |
|-----|---------------------|
| **Apple Health** | Ring animations, clean typography, data visualization |
| **Headspace** | Premium feel, breathing animations, gentle onboarding |
| **Duolingo** | Gamification depth, streak psychology, character mascot (our tree) |
| **Notion** | Modularity, block-based content, clean information hierarchy |
| **Nike Run Club** | Motivational energy, celebration moments, coach voice |
| **CRED** | Premium Indian design sensibilities, micro-interactions, haptics |
| **Linear** | Keyboard shortcuts, speed, crisp interactions, dark theme |

### 18.3 Glossary

| Term | Definition |
|------|-----------|
| **Tree of Life** | Central animated visualization that grows as user completes habits |
| **Water** | Each habit completion adds water to the tree |
| **Golden Tree** | Ultimate tree stage (365+ day streak) |
| **Gardener** | User's level title (e.g., "Level 12 Gardener") |
| **GrindLog** | App name — "Grind" (work) + "Log" (record) |
| **Growth OS** | The extensible platform architecture |
| **AI Coach** | Groq-powered personalized coaching system |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jul 2, 2026 | GrindLog Team | Initial PRD – Complete blueprint |

---

*This PRD is the single source of truth for GrindLog v1.0. All design, development, and testing decisions should trace back to this document. Any proposed changes should be evaluated against the core principles outlined in Section 2.*
