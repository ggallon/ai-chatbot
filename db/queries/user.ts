import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { user, type User } from "@/db/schema";
import { hashPassword } from "@/lib/utils/hash";

export async function createUser(email: string, password: string) {
  try {
    const hash = await hashPassword(password);
    await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function getUserByEmail(
  email: User["email"]
): Promise<Omit<User, "password"> | undefined> {
  return await db.query.user.findFirst({
    columns: { password: false },
    where: eq(user.email, email),
  });
}

export async function getUserByEmailWithPassword(
  email: User["email"]
): Promise<User | undefined> {
  return await db.query.user.findFirst({
    where: eq(user.email, email),
  });
}
