import { z } from 'zod';

export const listExercisesQuerySchema = z.object({
  category: z.enum(['strength', 'cardio', 'mobility', 'hiit']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  muscle: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export const exerciseSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
