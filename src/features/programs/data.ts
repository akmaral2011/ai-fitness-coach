import type { Program } from '@/features/programs/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function workout(id: string, exercises: { e: string; s: number; r: number; rest?: number }[]) {
  return {
    id,
    type: 'workout' as const,
    exercises: exercises.map(x => ({
      exerciseId: x.e,
      sets: x.s,
      reps: x.r,
      restSeconds: x.rest ?? 60,
    })),
  };
}

function rest(id: string) {
  return { id, type: 'rest' as const, exercises: [] };
}

function recovery(id: string) {
  return { id, type: 'active_recovery' as const, exercises: [] };
}

// ─── programs ─────────────────────────────────────────────────────────────────

export const PROGRAMS: Program[] = [
  // ── 1. Beginner Foundation ──────────────────────────────────────────────────
  {
    id: 'foundation-4w',
    nameKey: 'programs.foundation.name',
    descriptionKey: 'programs.foundation.description',
    difficulty: 'beginner',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    estimatedMinutesPerSession: 30,
    emoji: '🌱',
    goalKeys: [
      'programs.foundation.goal1',
      'programs.foundation.goal2',
      'programs.foundation.goal3',
    ],
    weeks: [
      {
        number: 1,
        themeKey: 'programs.themes.foundation',
        days: [
          workout('w1d1', [
            { e: 'squat', s: 3, r: 8 },
            { e: 'pushup', s: 3, r: 5 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
          ]),
          rest('w1d2'),
          workout('w1d3', [
            { e: 'lunge', s: 3, r: 8 },
            { e: 'glute-bridge', s: 3, r: 12 },
            { e: 'calf-raise', s: 3, r: 15 },
          ]),
          rest('w1d4'),
          workout('w1d5', [
            { e: 'squat', s: 3, r: 10 },
            { e: 'pushup', s: 3, r: 8 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
            { e: 'calf-raise', s: 2, r: 15 },
          ]),
          rest('w1d6'),
          rest('w1d7'),
        ],
      },
      {
        number: 2,
        themeKey: 'programs.themes.build',
        days: [
          workout('w2d1', [
            { e: 'squat', s: 3, r: 10 },
            { e: 'pushup', s: 3, r: 8 },
            { e: 'glute-bridge', s: 3, r: 12 },
          ]),
          rest('w2d2'),
          workout('w2d3', [
            { e: 'lunge', s: 3, r: 10 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'calf-raise', s: 3, r: 18 },
          ]),
          rest('w2d4'),
          workout('w2d5', [
            { e: 'squat', s: 4, r: 10 },
            { e: 'pushup', s: 3, r: 10 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
            { e: 'glute-bridge', s: 2, r: 12 },
          ]),
          recovery('w2d6'),
          rest('w2d7'),
        ],
      },
      {
        number: 3,
        themeKey: 'programs.themes.progress',
        days: [
          workout('w3d1', [
            { e: 'squat', s: 4, r: 12 },
            { e: 'pushup', s: 4, r: 10 },
            { e: 'glute-bridge', s: 3, r: 15 },
          ]),
          rest('w3d2'),
          workout('w3d3', [
            { e: 'reverse-lunge', s: 3, r: 10 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
          ]),
          rest('w3d4'),
          workout('w3d5', [
            { e: 'squat', s: 4, r: 12 },
            { e: 'lunge', s: 3, r: 12 },
            { e: 'pushup', s: 4, r: 10 },
            { e: 'calf-raise', s: 3, r: 20 },
          ]),
          recovery('w3d6'),
          rest('w3d7'),
        ],
      },
      {
        number: 4,
        themeKey: 'programs.themes.peak',
        days: [
          workout('w4d1', [
            { e: 'squat', s: 4, r: 15 },
            { e: 'pushup', s: 4, r: 12 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
            { e: 'glute-bridge', s: 3, r: 15 },
          ]),
          rest('w4d2'),
          workout('w4d3', [
            { e: 'reverse-lunge', s: 4, r: 12 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'calf-raise', s: 3, r: 20 },
          ]),
          rest('w4d4'),
          workout('w4d5', [
            { e: 'squat', s: 5, r: 15 },
            { e: 'pushup', s: 5, r: 12 },
            { e: 'lunge', s: 4, r: 12 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
            { e: 'glute-bridge', s: 3, r: 15 },
          ]),
          recovery('w4d6'),
          rest('w4d7'),
        ],
      },
    ],
  },

  // ── 2. Intermediate Build ────────────────────────────────────────────────────
  {
    id: 'build-4w',
    nameKey: 'programs.build.name',
    descriptionKey: 'programs.build.description',
    difficulty: 'intermediate',
    durationWeeks: 4,
    sessionsPerWeek: 4,
    estimatedMinutesPerSession: 40,
    emoji: '⚡',
    goalKeys: ['programs.build.goal1', 'programs.build.goal2', 'programs.build.goal3'],
    weeks: [
      {
        number: 1,
        themeKey: 'programs.themes.foundation',
        days: [
          workout('w1d1', [
            { e: 'squat', s: 4, r: 10 },
            { e: 'deadlift', s: 4, r: 8 },
            { e: 'glute-bridge', s: 3, r: 12 },
            { e: 'calf-raise', s: 3, r: 15 },
          ]),
          workout('w1d2', [
            { e: 'pushup', s: 4, r: 10 },
            { e: 'shoulder-press', s: 4, r: 10 },
            { e: 'lateral-raise', s: 3, r: 12 },
            { e: 'tricep-dip', s: 3, r: 10 },
          ]),
          rest('w1d3'),
          workout('w1d4', [
            { e: 'lunge', s: 4, r: 10 },
            { e: 'reverse-lunge', s: 3, r: 10 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
          ]),
          workout('w1d5', [
            { e: 'bicep-curl', s: 4, r: 12 },
            { e: 'tricep-extension', s: 4, r: 12 },
            { e: 'shoulder-press', s: 3, r: 10 },
            { e: 'lateral-raise', s: 3, r: 12 },
          ]),
          rest('w1d6'),
          recovery('w1d7'),
        ],
      },
      {
        number: 2,
        themeKey: 'programs.themes.build',
        days: [
          workout('w2d1', [
            { e: 'squat', s: 4, r: 12 },
            { e: 'deadlift', s: 4, r: 10 },
            { e: 'glute-bridge', s: 4, r: 15 },
            { e: 'calf-raise', s: 3, r: 18 },
          ]),
          workout('w2d2', [
            { e: 'pushup', s: 4, r: 12 },
            { e: 'shoulder-press', s: 4, r: 12 },
            { e: 'tricep-dip', s: 4, r: 12 },
            { e: 'lateral-raise', s: 3, r: 15 },
          ]),
          rest('w2d3'),
          workout('w2d4', [
            { e: 'lunge', s: 4, r: 12 },
            { e: 'side-lunge', s: 3, r: 10 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
          ]),
          workout('w2d5', [
            { e: 'bicep-curl', s: 4, r: 12 },
            { e: 'tricep-extension', s: 4, r: 12 },
            { e: 'shoulder-press', s: 4, r: 10 },
            { e: 'lateral-raise', s: 3, r: 15 },
          ]),
          rest('w2d6'),
          recovery('w2d7'),
        ],
      },
      {
        number: 3,
        themeKey: 'programs.themes.progress',
        days: [
          workout('w3d1', [
            { e: 'squat', s: 5, r: 12 },
            { e: 'deadlift', s: 4, r: 10 },
            { e: 'reverse-lunge', s: 3, r: 12 },
            { e: 'calf-raise', s: 3, r: 20 },
          ]),
          workout('w3d2', [
            { e: 'pushup', s: 5, r: 12 },
            { e: 'tricep-dip', s: 4, r: 12 },
            { e: 'shoulder-press', s: 4, r: 12 },
            { e: 'tricep-extension', s: 3, r: 12 },
          ]),
          rest('w3d3'),
          workout('w3d4', [
            { e: 'lunge', s: 4, r: 12 },
            { e: 'side-lunge', s: 4, r: 12 },
            { e: 'glute-bridge', s: 4, r: 15 },
            { e: 'plank', s: 3, r: 1, rest: 90 },
          ]),
          workout('w3d5', [
            { e: 'bicep-curl', s: 4, r: 15 },
            { e: 'tricep-extension', s: 4, r: 15 },
            { e: 'lateral-raise', s: 4, r: 15 },
            { e: 'shoulder-press', s: 3, r: 12 },
          ]),
          recovery('w3d6'),
          rest('w3d7'),
        ],
      },
      {
        number: 4,
        themeKey: 'programs.themes.peak',
        days: [
          workout('w4d1', [
            { e: 'squat', s: 5, r: 15 },
            { e: 'deadlift', s: 5, r: 12 },
            { e: 'glute-bridge', s: 4, r: 15 },
            { e: 'calf-raise', s: 4, r: 20 },
          ]),
          workout('w4d2', [
            { e: 'pushup', s: 5, r: 15 },
            { e: 'tricep-dip', s: 5, r: 15 },
            { e: 'shoulder-press', s: 4, r: 12 },
            { e: 'lateral-raise', s: 4, r: 15 },
          ]),
          rest('w4d3'),
          workout('w4d4', [
            { e: 'lunge', s: 5, r: 15 },
            { e: 'reverse-lunge', s: 4, r: 12 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
            { e: 'plank', s: 4, r: 1, rest: 90 },
          ]),
          workout('w4d5', [
            { e: 'bicep-curl', s: 5, r: 15 },
            { e: 'tricep-extension', s: 5, r: 15 },
            { e: 'shoulder-press', s: 4, r: 12 },
            { e: 'lateral-raise', s: 4, r: 15 },
          ]),
          recovery('w4d6'),
          rest('w4d7'),
        ],
      },
    ],
  },

  // ── 3. Advanced Athlete ──────────────────────────────────────────────────────
  {
    id: 'athlete-4w',
    nameKey: 'programs.athlete.name',
    descriptionKey: 'programs.athlete.description',
    difficulty: 'advanced',
    durationWeeks: 4,
    sessionsPerWeek: 5,
    estimatedMinutesPerSession: 50,
    emoji: '🏆',
    goalKeys: ['programs.athlete.goal1', 'programs.athlete.goal2', 'programs.athlete.goal3'],
    weeks: [
      {
        number: 1,
        themeKey: 'programs.themes.foundation',
        days: [
          workout('w1d1', [
            { e: 'squat', s: 5, r: 15 },
            { e: 'deadlift', s: 5, r: 10 },
            { e: 'reverse-lunge', s: 4, r: 12 },
            { e: 'glute-bridge', s: 4, r: 15 },
          ]),
          workout('w1d2', [
            { e: 'burpee', s: 4, r: 10 },
            { e: 'mountain-climber', s: 4, r: 20 },
            { e: 'high-knees', s: 4, r: 20 },
            { e: 'jumping-jack', s: 3, r: 20 },
          ]),
          workout('w1d3', [
            { e: 'pushup', s: 5, r: 15 },
            { e: 'shoulder-press', s: 4, r: 12 },
            { e: 'tricep-dip', s: 4, r: 15 },
            { e: 'lateral-raise', s: 3, r: 15 },
          ]),
          rest('w1d4'),
          workout('w1d5', [
            { e: 'deadlift', s: 5, r: 12 },
            { e: 'squat', s: 4, r: 15 },
            { e: 'lunge', s: 4, r: 12 },
            { e: 'calf-raise', s: 4, r: 20 },
          ]),
          workout('w1d6', [
            { e: 'bicep-curl', s: 4, r: 15 },
            { e: 'tricep-extension', s: 4, r: 15 },
            { e: 'plank', s: 4, r: 1, rest: 90 },
            { e: 'mountain-climber', s: 3, r: 20 },
          ]),
          rest('w1d7'),
        ],
      },
      {
        number: 2,
        themeKey: 'programs.themes.build',
        days: [
          workout('w2d1', [
            { e: 'squat', s: 5, r: 20 },
            { e: 'deadlift', s: 5, r: 12 },
            { e: 'reverse-lunge', s: 4, r: 15 },
            { e: 'side-lunge', s: 4, r: 12 },
          ]),
          workout('w2d2', [
            { e: 'burpee', s: 5, r: 12 },
            { e: 'high-knees', s: 5, r: 25 },
            { e: 'mountain-climber', s: 4, r: 25 },
            { e: 'jumping-jack', s: 3, r: 25 },
          ]),
          workout('w2d3', [
            { e: 'pushup', s: 5, r: 18 },
            { e: 'tricep-dip', s: 5, r: 15 },
            { e: 'shoulder-press', s: 4, r: 15 },
            { e: 'tricep-extension', s: 4, r: 15 },
          ]),
          rest('w2d4'),
          workout('w2d5', [
            { e: 'deadlift', s: 5, r: 15 },
            { e: 'squat', s: 5, r: 20 },
            { e: 'glute-bridge', s: 4, r: 20 },
            { e: 'calf-raise', s: 4, r: 25 },
          ]),
          workout('w2d6', [
            { e: 'bicep-curl', s: 5, r: 15 },
            { e: 'lateral-raise', s: 4, r: 15 },
            { e: 'plank', s: 4, r: 1, rest: 90 },
            { e: 'superman', s: 3, r: 15 },
          ]),
          rest('w2d7'),
        ],
      },
      {
        number: 3,
        themeKey: 'programs.themes.progress',
        days: [
          workout('w3d1', [
            { e: 'squat', s: 6, r: 20 },
            { e: 'deadlift', s: 5, r: 15 },
            { e: 'lunge', s: 5, r: 15 },
            { e: 'wall-sit', s: 3, r: 1, rest: 90 },
          ]),
          workout('w3d2', [
            { e: 'burpee', s: 5, r: 15 },
            { e: 'mountain-climber', s: 5, r: 30 },
            { e: 'high-knees', s: 5, r: 30 },
            { e: 'jumping-jack', s: 4, r: 30 },
          ]),
          workout('w3d3', [
            { e: 'pushup', s: 6, r: 20 },
            { e: 'shoulder-press', s: 5, r: 15 },
            { e: 'tricep-dip', s: 5, r: 18 },
            { e: 'lateral-raise', s: 4, r: 15 },
          ]),
          rest('w3d4'),
          workout('w3d5', [
            { e: 'deadlift', s: 6, r: 15 },
            { e: 'reverse-lunge', s: 5, r: 15 },
            { e: 'side-lunge', s: 4, r: 15 },
            { e: 'glute-bridge', s: 4, r: 20 },
          ]),
          workout('w3d6', [
            { e: 'bicep-curl', s: 5, r: 18 },
            { e: 'tricep-extension', s: 5, r: 18 },
            { e: 'plank', s: 5, r: 1, rest: 90 },
            { e: 'superman', s: 4, r: 15 },
          ]),
          rest('w3d7'),
        ],
      },
      {
        number: 4,
        themeKey: 'programs.themes.peak',
        days: [
          workout('w4d1', [
            { e: 'squat', s: 6, r: 20 },
            { e: 'deadlift', s: 6, r: 15 },
            { e: 'lunge', s: 5, r: 20 },
            { e: 'glute-bridge', s: 5, r: 20 },
          ]),
          workout('w4d2', [
            { e: 'burpee', s: 6, r: 15 },
            { e: 'high-knees', s: 6, r: 30 },
            { e: 'mountain-climber', s: 5, r: 30 },
            { e: 'jumping-jack', s: 4, r: 30 },
          ]),
          workout('w4d3', [
            { e: 'pushup', s: 6, r: 20 },
            { e: 'tricep-dip', s: 6, r: 20 },
            { e: 'shoulder-press', s: 5, r: 15 },
            { e: 'tricep-extension', s: 5, r: 15 },
          ]),
          rest('w4d4'),
          workout('w4d5', [
            { e: 'squat', s: 6, r: 20 },
            { e: 'deadlift', s: 5, r: 15 },
            { e: 'reverse-lunge', s: 5, r: 15 },
            { e: 'wall-sit', s: 4, r: 1, rest: 90 },
          ]),
          workout('w4d6', [
            { e: 'bicep-curl', s: 5, r: 20 },
            { e: 'lateral-raise', s: 5, r: 20 },
            { e: 'plank', s: 5, r: 1, rest: 90 },
            { e: 'superman', s: 4, r: 20 },
          ]),
          rest('w4d7'),
        ],
      },
    ],
  },
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id);
}
