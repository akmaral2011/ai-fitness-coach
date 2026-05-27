# Deployment

Recommended setup:

- Frontend: Vercel
- Backend API: Render Web Service
- Database: Supabase PostgreSQL, or Render PostgreSQL from `render.yaml`

## Backend on Render

1. Push the repository to GitHub.
2. In Render, create a new Blueprint from this repository.
3. Render will read `render.yaml` and create:
   - `ai-fitness-coach-api`
   - `ai-fitness-coach-db`
4. Set the backend environment variable:
   - `FRONTEND_URL=https://your-vercel-domain.vercel.app`
5. After deploy, check:
   - `https://your-render-api.onrender.com/health`

The backend start command runs Prisma migrations and seed data before starting the API.

## Backend on Render Web Service + Supabase

Use these settings if the Render Blueprint asks for payment:

- Root directory: `backend`
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm run db:migrate && npm run seed && npm start`

Environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=replace-with-a-long-production-secret
FRONTEND_URL=https://your-vercel-domain.vercel.app
GOOGLE_CLIENT_ID=disabled
```

## Frontend on Vercel

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-render-api.onrender.com
```

Build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install --legacy-peer-deps`

The `vercel.json` file includes SPA rewrites for React Router.

## Share Link

Send users the Vercel frontend URL:

```text
https://your-vercel-domain.vercel.app
```

The backend URL is only used internally by the frontend.
