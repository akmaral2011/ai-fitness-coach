# AI Fitness Coach Demo Guide

This project is now a full-stack MVP: React/Vite frontend, Fastify backend, PostgreSQL database, and Prisma ORM.

## Quick Start

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
npm run dev
```

Open the app:

```text
https://localhost:5173/
```

Backend API:

```text
http://127.0.0.1:4000
```

## Check Everything

From the project root:

```bash
npm run build:all
```

With the backend server running:

```bash
npm run smoke:backend
```

The smoke test verifies health, auth, profile saving, exercise catalog, workout saving, lesson completion, and progress overview.
It deletes its temporary smoke user after the check finishes.

## Demo Flow

1. Open the frontend.
2. Create a new account with email/password.
3. Complete onboarding.
4. Open exercise catalog.
5. Start a workout and finish it.
6. Check dashboard/progress.
7. Open Learn and complete a video lesson.
8. Open Profile and show profile details/achievements.

## Architecture

### Frontend

- React + Vite SPA.
- Feature-based folders in `src/features`.
- Zustand stores for client state.
- Protected routes check auth and onboarding.
- MediaPipe pose pipeline stays client-side.
- API client lives in `src/lib/api.ts`.

### Backend

- Fastify server in `backend/src/server.ts`.
- Routes are split by domain: auth, profile, exercises, workouts, programs, lessons, achievements, progress.
- Prisma schema lives in `backend/prisma/schema.prisma`.
- PostgreSQL stores real user data.
- JWT protects private routes.
- Passwords are hashed with bcrypt.
- Zod validates request bodies and env variables.

## Database Tables

- `User`: account.
- `Profile`: onboarding and fitness goal.
- `Exercise`: catalog content.
- `ExerciseRule`: AI technique rules for pose-angle validation.
- `WorkoutSession`: completed workouts.
- `Program`: training programs.
- `ProgramEnrollment`: user's enrolled programs.
- `Lesson`: video/article learning content.
- `LessonProgress`: completed lessons.
- `Achievement`: unlocked achievements.

## Current MVP Strengths

- Real backend auth with JWT.
- Email/password auth, email verification token flow, forgot/reset password flow, and backend-ready Google auth endpoint.
- PostgreSQL + Prisma migrations.
- 20 seeded exercises.
- 22 seeded AI technique rules across all 20 exercises.
- Workout mode can load exercise rules from the backend and falls back to local rules if the API is unavailable.
- 15 video lessons and 10 text guides.
- Learning Hub shows backend/local source, video/article counts, progress, and recommended next lesson.
- Workout history persists to backend.
- Dashboard, profile, and progress screens show product-style summaries, sync status, analytics, XP, and achievements.
- Progress and XP can be calculated from saved workout data.
- Smoke test proves the main API flow works.

## Known MVP Limitations

- Google auth endpoint is backend-ready, but the demo uses email/password unless OAuth client IDs are configured later.
- MediaPipe analysis runs on the client, so pose processing depends on the user's device/browser.
- No production deployment is configured yet for backend/PostgreSQL.
- Email verification and forgot-password are implemented with dev tokens; production needs SMTP/email provider delivery.
- Next.js migration is planned as a later step, after the MVP is stable.

## How To Explain It To A Team Lead

This is a client-heavy AI fitness MVP with a real backend added for persistence. The frontend handles the camera and pose estimation because MediaPipe needs browser camera access. The backend handles users, profiles, workouts, programs, lessons, achievements, and progress data. Zustand keeps UI state responsive, while PostgreSQL stores durable user data. Protected routes prevent unauthenticated access and redirect users to onboarding until their profile is complete.
