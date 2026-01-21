import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useForgotPassword } from "@/store/auth-store";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function getForgotPasswordErrorMessage(error: unknown): string {
  if (!error) return "Failed to send reset email. Please try again.";

  const err = error as { message?: string; code?: string };
  const message = err.message?.toLowerCase() || "";

  if (message.includes("not found") || message.includes("no user") || message.includes("no account")) {
    return "No account found with this email address.";
  }
  if (message.includes("invalid") && message.includes("email")) {
    return "Please enter a valid email address.";
  }
  if (message.includes("rate") || message.includes("limit") || message.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (message.includes("network") || message.includes("connection")) {
    return "Network error. Please check your connection and try again.";
  }

  if (err.message && err.message.length > 0 && err.message.length < 200) {
    return err.message;
  }

  return "Failed to send reset email. Please try again.";
}

export function ForgotPassword() {
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setServerError(null);

    forgotPassword(
      { email: data.email },
      {
        onSuccess: () => {
          setSubmittedEmail(data.email);
          setSubmitted(true);
        },
        onError: (err) => {
          const message = getForgotPasswordErrorMessage(err);
          setServerError(message);
        },
      }
    );
  };

  const displayError = errors.email?.message || serverError;

  // Success state
  if (submitted) {
    return (
      <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
        <div className="flex w-full flex-col">
          {/* Header */}
          <header className="flex items-center px-6 py-5 sm:px-10">
            <Logo className="h-7" />
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
            <div className="mx-auto w-full max-w-sm">
              {/* Success icon */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                <CheckCircleIcon className="size-7 text-emerald-500 dark:text-emerald-400" />
              </div>

              {/* Header */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Check your email
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-zinc-900 dark:text-white">{submittedEmail}</span>
                </p>
              </div>

              {/* Help box */}
              <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="mt-0.5 size-5 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Didn't receive the email?
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Check your spam folder or{" "}
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="font-medium text-zinc-900 underline underline-offset-2 dark:text-white"
                      >
                        try again
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              <Button href="/login" className="mt-6 w-full" outline>
                <ArrowLeftIcon className="size-4" />
                Back to sign in
              </Button>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-6 pb-6 sm:px-10">
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo className="h-7" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Remember your password?{" "}
            <TextLink href="/login">
              <Strong>Sign in</Strong>
            </TextLink>
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <LockClosedIcon className="size-7 text-zinc-500 dark:text-zinc-400" />
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Reset your password
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
              {displayError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40">
                  <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{displayError}</p>
                </div>
              )}

              <div className="space-y-6">
                <Field>
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    autoComplete="email username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="email"
                    spellCheck={false}
                    enterKeyHint="send"
                    placeholder="you@example.com"
                    data-invalid={errors.email ? true : undefined}
                  />
                </Field>

                <Button type="submit" className="w-full" color="dark/zinc" disabled={isPending}>
                  {isPending ? "Sending..." : "Send reset link"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 pb-6 sm:px-10">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
