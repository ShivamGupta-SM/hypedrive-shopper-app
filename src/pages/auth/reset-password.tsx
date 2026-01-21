import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useUpdatePassword } from "@/store/auth-store";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Please enter your new password")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function getResetPasswordErrorMessage(error: unknown): string {
  if (!error) return "Failed to reset password. Please try again.";

  const err = error as { message?: string; code?: string };
  const message = err.message?.toLowerCase() || "";

  if (message.includes("expired") || message.includes("invalid token") || message.includes("token")) {
    return "This reset link has expired. Please request a new one.";
  }
  if (message.includes("password") && message.includes("weak")) {
    return "Password is too weak. Use at least 8 characters with letters and numbers.";
  }
  if (message.includes("password") && message.includes("short")) {
    return "Password must be at least 8 characters long.";
  }
  if (message.includes("same") || message.includes("previous") || message.includes("old password")) {
    return "New password cannot be the same as your old password.";
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

  return "Failed to reset password. Please try again.";
}

export function ResetPassword() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const onSubmit = (data: ResetPasswordFormData) => {
    setServerError(null);

    if (!token) {
      setServerError("Invalid reset link");
      return;
    }

    updatePassword(
      { token, newPassword: data.password },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err) => {
          const message = getResetPasswordErrorMessage(err);
          setServerError(message);
        },
      }
    );
  };

  const displayError =
    errors.password?.message || errors.confirmPassword?.message || serverError;

  // Invalid token state
  if (!token) {
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
              {/* Error icon */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
                <LockClosedIcon className="size-7 text-red-500 dark:text-red-400" />
              </div>

              {/* Header */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Invalid reset link
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <Button href="/forgot-password" className="mt-8 w-full" color="dark/zinc">
                Request new link
              </Button>

              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
                <TextLink href="/login">
                  <Strong>Back to sign in</Strong>
                </TextLink>
              </p>
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

  // Success state
  if (success) {
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
                  Password updated
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>

              <Button href="/login" className="mt-8 w-full" color="dark/zinc">
                <ArrowLeftIcon className="size-4" />
                Sign in
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

  // Reset form
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
                Create new password
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                Enter your new password below. Make sure it's at least 8 characters.
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
                  <Label>New password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={isPending}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="Min. 8 characters"
                      data-invalid={errors.password ? true : undefined}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Field>
                  <Label>Confirm password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      disabled={isPending}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      placeholder="Confirm new password"
                      data-invalid={errors.confirmPassword ? true : undefined}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Button type="submit" className="w-full" color="dark/zinc" disabled={isPending}>
                  {isPending ? "Resetting..." : "Reset password"}
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
