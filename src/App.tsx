import { Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppLayout from '@/components/app/AppLayout';
import ProtectedRoute from '@/features/auth/ProtectedRoute';
import { useAuthStore } from '@/features/auth/authStore';

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
const ProfilePage = lazy(() => import('./features/profile/Profile'));
const ProgramsPage = lazy(() => import('./features/programs/Programs'));
const ProgramDetailPage = lazy(() => import('./features/programs/ProgramDetail'));
const LearnPage = lazy(() => import('./features/learn/Learn'));
const ArticleDetailPage = lazy(() => import('./features/learn/ArticleDetail'));

const queryClient = new QueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function GoogleRedirectHandler() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('access_token');
    if (!accessToken) return;

    window.history.replaceState(null, '', window.location.pathname);

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then((data: { sub: string; name?: string; email: string; picture?: string }) => {
        setUser({
          id: data.sub,
          name: data.name ?? data.email,
          email: data.email,
          picture: data.picture,
        });
        navigate('/app/dashboard', { replace: true });
      })
      .catch(() => console.error('Failed to fetch Google user info'));
  }, [navigate, setUser]);

  return null;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GoogleRedirectHandler />
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
    </GoogleOAuthProvider>
  );
}

const container = document.getElementById('react-root');
if (!container) throw new Error('Root element #react-root not found');
createRoot(container).render(<App />);
