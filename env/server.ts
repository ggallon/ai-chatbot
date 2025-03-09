import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(32),
    BLOB_READ_WRITE_TOKEN: z.string().startsWith('vercel_blob').min(32),
    POSTGRES_URL: z.string().url(),
    OPENAI_API_KEY: z.string().startsWith('sk-proj-').min(32),
    OPENAI_ORG: z.string().startsWith('org-').min(28),
    OPENAI_PROJECT: z.string().startsWith('proj_').min(28),
    OPEN_WEATHER_API_KEY: z.string().min(32),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV !== 'production',
});
