# AI Fitness Coach

Full-stack AI fitness coaching MVP. The app analyzes exercise technique in the browser with MediaPipe, saves real user data through a Fastify backend, and stores progress in PostgreSQL with Prisma.

## What It Does

- Email/password registration and login with JWT, email verification tokens, password reset flow, and a backend-ready Google sign-in endpoint for later.
- Onboarding profile with goal, level, activity, measurements, injuries, and camera setup.
- Exercise catalog with 20 seeded exercises and seeded AI technique rules.
- Camera-based workout mode with pose tracking, rep counting, technique score, and backend-driven technique feedback.
- Workout history, XP, streaks, personal bests, and progress charts.
- Training programs with enrollment and completed days.
- Learning hub with backend-loaded video lessons, articles, completion progress, and recommendations.
- Profile with account sync status, onboarding details, preferences, and achievements.
- English, Russian, and Kyrgyz translations.

## Tech Stack

| Layer      | Tech                                   |
| ---------- | -------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite           |
| Styling    | Tailwind CSS v4                        |
| State      | Zustand                                |
| Routing    | React Router                           |
| AI / Pose  | MediaPipe Tasks Vision + TensorFlow.js |
| Backend    | Node.js + Fastify                      |
| Database   | PostgreSQL                             |
| ORM        | Prisma                                 |
| Auth       | JWT + bcrypt password hashing          |
| Validation | Zod                                    |
| i18n       | i18next                                |

## Getting Started

Install dependencies:

```bash
npm install
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://akmaraltursunbaeva@localhost:5432/ai_fitness_coach?schema=public"
JWT_SECRET="local-dev-secret-change-before-production"
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
npm run dev
```

Open:

```text
https://localhost:5173/
```

## Useful Commands

```bash
npm run build          # frontend build
npm run build:all      # frontend + backend build
npm run smoke:backend  # backend API smoke test, backend must be running
```

Backend-only:

```bash
cd backend
npm run seed
npm run smoke
npx prisma studio
```

## Project Structure

```text
src/
  components/      shared UI components
  features/
    auth/          auth UI, store, protected routes
    dashboard/     first authenticated screen
    exercises/     catalog, detail, exercise data
    workout/       MediaPipe workout mode and pose engine
    programs/      program list/detail/enrollment UI
    progress/      charts and workout history
    profile/       onboarding, profile, achievements
    learn/         lessons, videos, articles
  i18n/            en / ru / ky translations
  lib/             frontend API client

backend/
  prisma/          schema, migrations, seed data
  scripts/         smoke test
  src/
    config/        env validation
    lib/           Prisma and auth helpers
    routes/        Fastify route modules
```

## Backend API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/exercises`
- `GET /api/exercises/:slug`
- `GET /api/exercises/:slug/rules`
- `POST /api/workouts`
- `GET /api/workouts/summary`
- `GET /api/progress/overview`
- `GET /api/programs`
- `POST /api/programs/:id/enroll`
- `GET /api/lessons`
- `POST /api/lessons/:id/complete`
- `GET /api/achievements/me`

## MVP Limitations

- Google auth endpoint exists, but the demo UI uses email/password to avoid OAuth setup risk.
- MediaPipe analysis runs client-side, so performance depends on the user's device.
- Backend and PostgreSQL are currently local; production deployment is a future step.
- Email verification and password reset currently return dev tokens; production should send them through an email provider.
- Next.js migration is planned later, after the current MVP is stable.

## Demo Notes

Use [DEMO_GUIDE.md](./DEMO_GUIDE.md) for the presentation flow and [INTERVIEW_NOTES.md](./INTERVIEW_NOTES.md) for architecture explanations and likely questions.
