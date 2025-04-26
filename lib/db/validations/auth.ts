import { object, string } from 'zod';

export const authFormSchema = object({
  email: string().max(64).email(),
  password: string().min(6).max(64).trim(),
});
