import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';
const email = `smoke-${Date.now()}@fitcoach.test`;
const password = 'Password123';
const prisma = new PrismaClient();

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Smoke testing ${baseUrl}`);
  let userId = null;

  try {
    const health = await request('/health');
    assert(health.status === 'ok', 'Health check did not return ok');

    const auth = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Test',
        email,
        password,
      }),
    });
    assert(auth.token, 'Register did not return a token');
    assert(auth.user?.email === email, 'Register returned the wrong user');
    assert(auth.verificationToken, 'Register did not return an email verification token');
    userId = auth.user.id;

    const token = auth.token;

    const verified = await request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: auth.verificationToken }),
    });
    assert(verified.user?.emailVerified, 'Email verification failed');

    const me = await request('/api/auth/me', { token });
    assert(me.user?.email === email, 'Auth me did not return the registered user');

    const forgot = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    assert(forgot.resetToken, 'Forgot password did not return a dev reset token');

    const newPassword = 'Password456';
    const reset = await request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: forgot.resetToken, password: newPassword }),
    });
    assert(reset.message, 'Password reset failed');

    const login = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: newPassword }),
    });
    assert(login.token, 'Login with reset password failed');

    const profile = await request('/api/profile/me', {
      method: 'PUT',
      token,
      body: JSON.stringify({
        goal: 'stay_active',
        gender: 'female',
        heightCm: 165,
        weightKg: 58,
        ageYears: 24,
        activityLevel: 'moderate',
        fitnessLevel: 'beginner',
        injuries: ['none'],
      }),
    });
    assert(profile.profile?.isOnboardingComplete, 'Profile was not marked complete');

    const exercises = await request('/api/exercises');
    assert(exercises.exercises?.length >= 20, 'Expected at least 20 exercises');

    const workout = await request('/api/workouts', {
      method: 'POST',
      token,
      body: JSON.stringify({
        exerciseSlug: 'squat',
        repCount: 12,
        averageScore: 88,
        durationSeconds: 45,
        scoreHistory: [82, 88, 92],
      }),
    });
    assert(workout.workout?.exerciseId === 'squat', 'Workout was not saved correctly');

    const lesson = await request('/api/lessons/squat-video/complete', {
      method: 'POST',
      token,
    });
    assert(lesson.ok, 'Lesson completion failed');

    const progress = await request('/api/progress/overview', { token });
    assert(progress.summary?.totalSessions === 1, 'Progress summary session count is wrong');
    assert(progress.lessonsCompleted === 1, 'Progress lesson count is wrong');

    console.log('Smoke test passed');
    console.log(
      JSON.stringify(
        {
          user: email,
          totalExercises: exercises.exercises.length,
          summary: progress.summary,
          xp: progress.xp,
        },
        null,
        2
      )
    );
  } finally {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => null);
      console.log(`Cleaned up smoke user ${email}`);
    }
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
