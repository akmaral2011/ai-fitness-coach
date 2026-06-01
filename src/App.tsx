import { Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ErrorBoundary from '@/components/ErrorBoundary';
import AppLayout from '@/components/app/AppLayout';
import ProtectedRoute from '@/features/auth/ProtectedRoute';
import { useAuthStore } from '@/features/auth/authStore';
import { clearSessionData } from '@/features/auth/sessionData';
import { apiRequest } from '@/lib/api';

import './i18n';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Onboarding = lazy(() => import('./features/profile/Onboarding'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const ExerciseCatalog = lazy(() => import('./features/exercises/ExerciseCatalog'));
const ExerciseDetail = lazy(() => import('./features/exercises/ExerciseDetail'));
const WorkoutMode = lazy(() => import('./features/workout/WorkoutMode'));
const ProgressPage = lazy(() => import('./features/progress/Progress'));
const LeaderboardPage = lazy(() => import('./features/leaderboard/Leaderboard'));
const ProfilePage = lazy(() => import('./features/profile/Profile'));
const ProgramsPage = lazy(() => import('./features/programs/Programs'));
const ProgramDetailPage = lazy(() => import('./features/programs/ProgramDetail'));
const LearnPage = lazy(() => import('./features/learn/Learn'));
const ArticleDetailPage = lazy(() => import('./features/learn/ArticleDetail'));

const queryClient = new QueryClient();

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SessionVerifier() {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const setSession = useAuthStore(s => s.setSession);
  const signOut = useAuthStore(s => s.signOut);
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!userId) return;

      if (!token) {
        clearSessionData();
        signOut();
        return;
      }

      try {
        const response = await apiRequest<{
          user: {
            id: string;
            name: string;
            email: string;
            pictureUrl?: string | null;
            emailVerified?: boolean;
          };
        }>('/api/auth/me', { token });

        if (cancelled) return;

        const current = useAuthStore.getState();
        if (current.token !== token) return;

        const verifiedUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          picture: response.user.pictureUrl ?? undefined,
          emailVerified: response.user.emailVerified,
        };

        if (
          current.user?.id !== verifiedUser.id ||
          current.user.name !== verifiedUser.name ||
          current.user.email !== verifiedUser.email ||
          current.user.picture !== verifiedUser.picture ||
          current.user.emailVerified !== verifiedUser.emailVerified
        ) {
          setSession({ token, user: verifiedUser });
        }
      } catch {
        if (!cancelled && useAuthStore.getState().token === token) {
          clearSessionData();
          signOut();
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [setSession, signOut, token, userId]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionVerifier />
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireProfile={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/catalog"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExerciseCatalog />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/exercise/:id"
              element={
                <ProtectedRoute>
                  <ExerciseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/workout/:id"
              element={
                <ProtectedRoute>
                  <WorkoutMode />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/progress"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProgressPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/leaderboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LeaderboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/programs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProgramsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/programs/:id"
              element={
                <ProtectedRoute>
                  <ProgramDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/learn"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LearnPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/learn/:id"
              element={
                <ProtectedRoute>
                  <ArticleDetailPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const container = document.getElementById('react-root');
if (!container) throw new Error('Root element #react-root not found');
createRoot(container).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
