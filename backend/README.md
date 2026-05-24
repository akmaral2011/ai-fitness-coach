# AI Fitness Coach Backend

Node.js + Fastify backend for the AI Fitness Coach app. It stores real users, profiles, workout history, training programs, lessons, achievements, and aggregated progress in PostgreSQL through Prisma.

## Stack

- Fastify: HTTP API server.
- Prisma: database schema, migrations, and typed queries.
- PostgreSQL: relational database.
- JWT: protected routes with `Authorization: Bearer <token>`.
- bcryptjs: password hashing.
- Zod: request and environment validation.

## Local Commands

```bash
npm run dev
npm run build
npm run seed
npm run smoke
npx prisma studio
```

`npm run smoke` expects the backend server to be running on `http://127.0.0.1:4000`.
It creates a throwaway test user, verifies auth, profile, exercises, workout saving, lesson completion, and progress overview, then deletes the test user.

## Environment

Create `backend/.env` from `.env.example`.

```env
PORT=4000
DATABASE_URL="postgresql://akmaraltursunbaeva@localhost:5432/ai_fitness_coach?schema=public"
JWT_SECRET="local-dev-secret-change-before-production"
```

`JWT_SECRET` must be at least 24 characters. In production it must be changed to a real secret.

## Database Models

- `User`: registered user account.
- `Profile`: onboarding answers and fitness goal.
- `Exercise`: exercise catalog shown in the app.
- `WorkoutSession`: completed workout history.
- `Program`: seeded training program.
- `ProgramEnrollment`: user's active program and completed days.
- `Lesson`: article/video learning content.
- `LessonProgress`: completed lessons.
- `Achievement`: unlocked user achievements.

## API Routes

### Health

- `GET /`
- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Profile

- `GET /api/profile/me`
- `PUT /api/profile/me`

### Exercises

- `GET /api/exercises`
- `GET /api/exercises/:slug`

### Workouts

- `POST /api/workouts`
- `GET /api/workouts?limit=20`
- `GET /api/workouts/summary`

### Progress

- `GET /api/progress/overview`

Returns summary, XP, recent workouts, personal bests, activity days, completed lessons, achievements, and active programs.

### Programs

- `GET /api/programs`
- `GET /api/programs/:id`
- `GET /api/programs/enrollments/me`
- `POST /api/programs/:id/enroll`
- `DELETE /api/programs/:id/enroll`
- `POST /api/programs/:id/days/:dayId/complete`

### Lessons

- `GET /api/lessons`
- `GET /api/lessons/:id`
- `GET /api/lessons/progress/me`
- `POST /api/lessons/:id/complete`

### Achievements

- `GET /api/achievements/me`
- `POST /api/achievements/unlock`

## How To Explain It

Fastify is like the controller/router layer: it receives requests and chooses the handler.
Prisma is like the typed database access layer: it creates tables through migrations and queries PostgreSQL.
PostgreSQL is the database where real user data lives.
JWT is the access pass: protected routes read the token and know which user is making the request.
