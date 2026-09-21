# Project Charter — GrindLog

## Vision & Purpose
GrindLog is an AI-powered, mobile-first fitness and habit tracking Progressive Web Application (PWA). It provides gym athletes and fitness enthusiasts with:
1. Personalized, AI-adaptive workout routines (Hypertrophy, Strength, Cutting, Recomp).
2. Frictionless workout logging with real-time timers and exercise execution guides.
3. Intelligent nutrition, calorie, and macronutrient tracking with custom meal generation.
4. Body transformation progress tracking (weight graphs, circumferences, photo comparisons).
5. 24/7 AI Fitness Coach for on-the-fly routine modifications and recovery guidance.

## Core Modules
- **Dashboard (`/`)**: Daily readiness, today's workout preview, macro targets, hydration ring, active streak.
- **Workout Engine (`/workout`)**: 7-day split calendar, active session runner, set completion, volume tracking.
- **Nutrition Hub (`/nutrition`)**: Food logging, USDA foundation food lookup, macro distribution, water logger.
- **Progress Tracker (`/progress`)**: Bodyweight milestones, body measurements, streak milestones.
- **AI Coach (`/coach`)**: Context-aware conversational AI assistant tailored to user goals and history.
- **Profile & Billing (`/profile`)**: Subscription tier management, Razorpay payment processing, settings.

## Success Metrics
- **Performance**: Sub-100ms client tab switching, 60fps mobile transitions, zero UI freezes.
- **Reliability**: Idempotent workout set logging, zero lost training sessions.
- **User Experience**: Seamless dual-theme support (Dark Gym & Crisp White).
