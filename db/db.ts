import { createPool } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

import * as schema from './schema';

const customVercelPool = createPool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({
  client: customVercelPool,
  schema,
  logger: process.env.NODE_ENV === 'development',
});
