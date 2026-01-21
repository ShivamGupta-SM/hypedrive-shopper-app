import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { apiClient } from "@/hooks/use-api";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

type VerificationStatus = "loading" | "success" | "error" | "expired";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      apiClient.auth
        .verifyEmail({ token })
        .then(() => {
          setStatus("success");
        })
        .catch((error: Error) => {
          if (error?.message?.includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
        });
    }
  }, [token]);

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      toast.error("Email address not found. Please register again.");
      return;
    }

    setIsResending(true);
    try {
      await apiClient.auth.sendVerificationEmail({ email });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend verification email";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }, [email]);

  // No token - show "check your email" state
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
              {/* Icon */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50">
                <EnvelopeIcon className="size-7 text-amber-500 dark:text-amber-400" />
              </div>

              {/* Header */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Check your email
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  We've sent a verification link to your email address. Please click the link to verify your account.
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
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="font-medium text-zinc-900 underline underline-offset-2 disabled:opacity-50 dark:text-white"
                      >
                        {isResending ? "sending..." : "resend email"}
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

  // Loading state
  if (status === "loading") {
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
              {/* Loading spinner */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
              </div>

              {/* Header */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Verifying your email
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  Please wait while we verify your email address...
                </p>
              </div>
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
  if (status === "success") {
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
                  Email verified!
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  Your email has been verified successfully. You can now sign in to your account.
                </p>
              </div>

              <Button href="/login" className="mt-8 w-full" color="dark/zinc">
                Sign in to your account
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

  // Expired state
  if (status === "expired") {
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
              {/* Warning icon */}
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50">
                <ExclamationTriangleIcon className="size-7 text-amber-500 dark:text-amber-400" />
              </div>

              {/* Header */}
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Link expired
                </h1>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                  This verification link has expired. Please request a new one to verify your email.
                </p>
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="mt-8 w-full"
                color="dark/zinc"
              >
                {isResending ? "Sending..." : "Resend verification email"}
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

  // Error state
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
              <ExclamationTriangleIcon className="size-7 text-red-500 dark:text-red-400" />
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Verification failed
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                We couldn't verify your email address. The link may be invalid or has already been used.
              </p>
            </div>

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="mt-8 w-full"
              color="dark/zinc"
            >
              {isResending ? "Sending..." : "Resend verification email"}
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
