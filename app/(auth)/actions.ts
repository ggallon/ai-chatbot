"use server";

import { z } from "zod";

import { createUser, getUserByEmail } from "@/db/queries/user";

import { signIn } from "./auth";
import { authFormSchema } from "./auth.schema";

export interface AuthActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "user_exists";
}

export const login = async (
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export const register = async (
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await getUserByEmail(validatedData.email);
    if (user) {
      return { status: "user_exists" } as AuthActionState;
    }

    await createUser(validatedData.email, validatedData.password);
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
