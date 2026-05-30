import { z } from 'zod';

export const programIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const completeProgramDayParamsSchema = z.object({
  id: z.string().min(1),
  dayId: z.string().min(1),
});
