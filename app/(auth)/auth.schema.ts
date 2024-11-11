import { z } from 'zod';

export const authFormSchema = z.object({
  email: z.string().email().min(3).max(255).trim(),
  password: z.string().min(8).max(70).trim(),
});
