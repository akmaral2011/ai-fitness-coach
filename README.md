# AI Fitness Coach

Real-time AI-powered fitness coaching web app that analyzes exercise technique via camera using Google MediaPipe Pose. Built as a frontend MVP for an internship project.

## What it does

- Tracks 33 body keypoints at 25+ FPS with <150ms feedback
- Detects reps, angles, and form errors in real time during workouts
- Guides users through onboarding → workout programs → progress tracking
- Supports 3 languages: English, Russian, Kyrgyz

## Tech stack

| Layer | Tech |
| --- | --- |
| UI | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| Data fetching | TanStack Query |
| AI / Pose | Google MediaPipe Tasks Vision + TensorFlow.js |
| i18n | i18next (en / ru / ky) |
| Auth | Google Identity Services + client-side demo mode |
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

## Demo access

For quick review without Google OAuth setup, use **Continue as demo user** in the sign-in modal.

Demo mode creates a browser-only user, resets demo profile/progress/program data, and stores new activity locally in localStorage. It is intended for reviewers who want to explore the app without configuring Google OAuth.

## Project structure

```
src/
  features/
    auth/          # Google sign-in, demo mode, ProtectedRoute
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
npm run lint     # ESLint
npm run stylelint # CSS linting
npm run test     # Unit tests
npm run format   # Prettier
```

## Limitations

- No backend yet: authentication, profile, programs, and progress are stored on the client.
- Google ID token is decoded on the frontend for demo sign-in; production would verify it on a backend.
- Workout history does not sync across devices because it is stored in localStorage.
- MediaPipe model and WASM assets are loaded from external URLs, so the first AI workout load requires internet access.
- Unit tests cover the core progress and program state logic; UI and camera flows are not automated yet.

## Future improvements

- Backend API for verified auth, user profiles, and workout history sync.
- End-to-end tests for onboarding and workout flows.
- Offline caching for MediaPipe model assets.
- Richer progress analytics, charts, and exportable workout history.
- CI workflow that runs lint and production build on every pull request.
