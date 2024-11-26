"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { register, type AuthActionState } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/auth-form";
import { AuthHeader } from "@/components/auth-header";
import { SubmitButton } from "@/components/submit-button";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    register,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    switch (state.status) {
      case "failed":
        toast.error("Failed to create account");
        break;
      case "invalid_data":
        toast.error("Failed validating your submission!");
        break;
      case "user_exists":
        toast.error("Account already exists");
        break;
      case "success":
        toast.success("Account created successfully");
        setIsSuccessful(true);
        router.refresh();
        break;
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
      <AuthHeader
        title="Sign Up"
        description="Create an account with your email and password"
      />
      <AuthForm type="register" action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
          {"Already have an account? "}
          <Link
            href="/login"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Sign in
          </Link>
          {" instead."}
        </p>
      </AuthForm>
    </div>
  );
}
