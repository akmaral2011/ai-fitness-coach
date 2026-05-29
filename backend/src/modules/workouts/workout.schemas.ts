import { z } from 'zod';

export const createWorkoutSchema = z.object({
  exerciseId: z.string().min(1).optional(),
  exerciseSlug: z.string().min(1).optional(),
  repCount: z.number().int().min(0),
  averageScore: z.number().int().min(0).max(100),
  durationSeconds: z.number().int().min(1),
  scoreHistory: z.array(z.number().int().min(0).max(100)).default([]),
  completedAt: z.string().datetime().optional(),
});

export const workoutListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
