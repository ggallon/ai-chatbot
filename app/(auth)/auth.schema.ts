import { z } from "zod";

export const authFormSchema = z.object({
  email: z.string().trim().toLowerCase().email().min(5).max(255),
  password: z.string().min(8).max(70).trim(),
});
