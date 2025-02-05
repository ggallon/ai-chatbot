'use server';

import { ZodError } from 'zod';

import { createUser, getUserByEmail } from '@/lib/db/queries/user';
import { authFormSchema } from '@/lib/db/validations/auth';
import { signIn } from './auth';

export interface AuthActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const login = async (
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export const register = async (
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const user = await getUserByEmail(validatedData.email);
    if (user) {
      return { status: 'user_exists' };
    }

    const userEmail = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      image: `https://avatar.vercel.sh/${validatedData.email}`,
    });
    await signIn('credentials', {
      email: userEmail,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
