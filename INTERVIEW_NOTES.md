# Interview Notes

Use this as a short script when explaining the project to a team lead.

## One-Minute Summary

AI Fitness Coach is a full-stack fitness MVP. The frontend uses React, Vite, Zustand, and MediaPipe to analyze the user's pose in the browser. The backend uses Node.js, Fastify, Prisma, and PostgreSQL to store users, profiles, workouts, programs, lessons, achievements, and progress. Authentication includes email/password with hashed passwords, JWT protected routes, email verification tokens, and password reset tokens. A backend Google verification endpoint is prepared for later, but the demo UI uses email/password to reduce OAuth setup risk.

## Architecture

### Frontend

The frontend is organized with feature-based architecture:

- `features/auth`: login/register, auth store, protected routes.
- `features/profile`: onboarding, profile, achievements.
- `features/exercises`: exercise catalog and details.
- `features/workout`: MediaPipe workout mode, pose engine, reps, technique score.
- `features/progress`: analytics, charts, muscle heatmap, and workout history.
- `features/programs`: training programs and enrollment.
- `features/learn`: backend-loaded articles, video lessons, completion progress, and recommendations.

This keeps related UI, state, and helpers close together instead of spreading one feature across many global folders.

### State Management

Zustand is used for local app state:

- auth session
- onboarding/profile state
- workout progress
- program enrollment cache
- lesson completion cache
- achievements

The backend is the source of truth for real user data. Zustand keeps the UI fast and responsive, then the app syncs important data with the API.

### Backend

Fastify is used as the HTTP API layer. Each domain has its own route file:

- `auth.ts`
- `profile.ts`
- `exercises.ts`
- `workouts.ts`
- `programs.ts`
- `lessons.ts`
- `achievements.ts`
- `progress.ts`

Prisma is used for schema, migrations, and typed database queries. PostgreSQL stores durable data.
Exercise technique rules are normalized in `ExerciseRule`, so the backend can expose pose-angle validation rules per exercise instead of keeping everything only inside frontend code.

### Protected Routing

Protected routes check if the user exists. If a route requires a completed profile and the user has not finished onboarding, the app redirects to `/onboarding`. When a real token exists, the frontend loads the profile from `/api/profile/me`.

### MediaPipe Pipeline

MediaPipe runs client-side because the browser has direct camera access and pose analysis needs low latency. The app reads landmarks, calculates angles, detects phases, counts reps, and gives feedback. Exercise rules can be loaded from the backend, while the backend stores only completed workout results, not camera video.

## Why These Choices?

### Why Fastify?

Fastify is lightweight, fast, and easy to structure with route modules. It works well for a REST API MVP and has good plugin support.

### Why Prisma?

Prisma gives a clear schema, migrations, and type-safe database queries. It is easier to explain and safer than writing raw SQL everywhere.

### Why PostgreSQL?

The data is relational: users have profiles, workouts, programs, lessons, achievements. PostgreSQL fits this structure better than a purely document-based approach.

### Why Zustand?

Zustand is simple and lightweight. It avoids too much boilerplate and is enough for this app's UI state.

### Why Not Next.js Yet?

The current app is a Vite SPA and works well as an interactive camera-heavy app. Next.js migration is planned later, after the core full-stack MVP is stable.

### How does Google auth work?

Frontend can send a Google credential to `/api/auth/google` after OAuth client IDs are configured. The backend verifies it against Google tokeninfo, checks `GOOGLE_CLIENT_ID`, creates or updates the user, marks the email verified, and returns the app's JWT. For the internship demo, the visible flow is email/password because it is deterministic locally.

### How do email verification and forgot password work?

The backend stores hashed one-time tokens in PostgreSQL. `/api/auth/verify-email` marks the user email as verified. `/api/auth/forgot-password` prepares a reset token, and `/api/auth/reset-password` hashes and saves the new password. In local demo mode the token is returned in the response; production should deliver it by email.

## Likely Questions And Answers

### What is feature-based architecture?

It means each product feature owns its components, store, helpers, and types. For example, workout logic lives in `features/workout`, profile logic lives in `features/profile`. This makes the project easier to scale.

### What is the source of truth?

For logged-in users, PostgreSQL is the durable source of truth. Zustand is used for UI responsiveness and local cache.

### How does auth work?

Register/login goes to Fastify. Passwords are hashed with bcrypt. The backend returns a JWT. Protected API routes read `Authorization: Bearer <token>`.

### What data does the backend store?

Users, profiles, exercises, AI exercise rules, workout sessions, training programs, program enrollments, lessons, lesson progress, achievements, and progress aggregates.

### Does the backend process camera video?

No. Pose analysis runs on the client with MediaPipe. The backend receives only workout results such as reps, score, duration, and score history.

### What product polish was added?

Dashboard has a coach overview, sync status, weekly activity, best score, and next actions. Exercise detail shows training plan and AI technique rules. Progress turns saved workouts into analytics like score trend, consistency, time, muscle load, and personal bests. Learning Hub shows video/article counts, recommendations, and completion progress. Profile shows account sync, profile completion, workouts, and achievements.

### What are the MVP limitations?

- No deployment yet.
- Google auth needs configured Google OAuth client IDs.
- Email verification and password reset need SMTP/email delivery in production.
- Camera performance depends on the user's device.
- More automated UI tests would be useful.

### How do you prove the backend works?

Run:

```bash
npm run smoke:backend
```

It checks auth, profile, exercises, workout saving, lesson completion, and progress overview. It also deletes the temporary smoke user after the test.

## Next Steps

1. Deploy frontend, backend, and PostgreSQL.
2. Add SMTP/email provider for verification and password reset delivery.
3. Add more tests.
4. Migrate to Next.js later if SSR/SSG or app-router features become necessary.
