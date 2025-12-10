import { z } from 'zod';

export const uploadSchema = z.object({
  category: z.enum(['tech', 'vlog', 'shorts', 'gaming', 'tutorial']),
  language: z
    .string()
    .min(2)
    .max(7)
    .regex(/^[a-z]{2}(-[a-z]{2})?$/i, 'Use ISO language code like en or en-US'),
  monetization: z.enum(['enabled', 'disabled', 'limited']),
  scheduleTime: z
    .string()
    .trim()
    .optional()
});

export type UploadInput = z.infer<typeof uploadSchema>;
