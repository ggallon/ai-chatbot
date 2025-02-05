import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import { lower, user, type InsertUser } from '@/lib/db/schema';

export async function getUserByEmail(email: string) {
  try {
    return await db.query.user.findFirst({
      where: eq(lower(user.email), email.toLowerCase()),
    });
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser({ email, image, password }: InsertUser) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db
      .insert(user)
      .values({ email: email.toLowerCase(), image, password: hash })
      .returning({ userEmail: user.email });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}
