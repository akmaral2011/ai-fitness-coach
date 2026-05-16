# AI Fitness Coach

Real-time AI-powered fitness coaching web app that analyzes exercise technique via camera using Google MediaPipe Pose — no personal trainer needed.

## What it does

- Tracks 33 body keypoints at 25+ FPS with <150ms feedback
- Detects reps, angles, and form errors in real time during workouts
- Guides users through onboarding → workout programs → progress tracking
- Supports 3 languages: English, Russian, Kyrgyz

## Tech stack

| Layer | Tech |
|---|---|
| UI | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Data fetching | TanStack Query |
| AI / Pose | Google MediaPipe Tasks Vision + TensorFlow.js |
| i18n | i18next (en / ru / ky) |
| Auth | Google OAuth (`@react-oauth/google`) |
| Deploy | Vercel (PWA) |

## Features

**Landing page** — 11 sections, dark theme, emerald accent, fully responsive

**Onboarding** — 8-step flow: goal → measurements → age → level → gender → activity → injuries → camera setup

**Exercise catalog** — browse and filter exercises with detail pages and animated previews

**Workout mode** — live camera feed with pose overlay, rep counter, angle feedback, and audio cues

**Programs** — curated workout programs with daily schedules

**Progress** — charts and history of completed workouts

**Profile** — user settings, stats, theme toggle

## Getting started

```bash
npm install
npm run dev
```

Set up `.env.local`:

```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## Project structure

```
src/
  features/
    auth/          # Google OAuth, AuthModal, ProtectedRoute
    dashboard/     # Home screen after login
    exercises/     # Catalog, detail, exercise data
    workout/       # WorkoutMode, pose engine, angles, skeleton
    programs/      # Program list and detail
    progress/      # Charts and workout history
    profile/       # User profile and onboarding
    learn/         # Articles and tips
    notifications/ # Reminder system
  i18n/            # en / ru / ky translations
  stores/          # Zustand global stores
  components/      # Shared UI components
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint + Stylelint
npm run format   # Prettier
```
