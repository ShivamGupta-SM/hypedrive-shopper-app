import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Logo } from "@/components/logo";
import { Strong, Text, TextLink } from "@/components/text";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

type VerificationStatus = "loading" | "success" | "error" | "expired";

export function VerifyEmail() {
  const { open } = useNotification();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const { mutate: verifyEmail } = useCustomMutation();
  const { mutate: resendEmail, mutation: { isPending: isResending } } = useCustomMutation();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (token) {
      verifyEmail(
        {
          url: "/auth/verify-email",
          method: "post",
          values: { token },
        },
        {
          onSuccess: () => {
            setStatus("success");
          },
          onError: (error) => {
            if (error?.message?.includes("expired")) {
              setStatus("expired");
            } else {
              setStatus("error");
            }
          },
        }
      );
    }
  }, [token, verifyEmail]);

  const handleResendEmail = () => {
    if (!email) {
      open?.({
        type: "error",
        message: "Email address not found. Please register again.",
      });
      return;
    }

    resendEmail(
      {
        url: "/auth/resend-verification",
        method: "post",
        values: { email },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Verification email sent! Check your inbox.",
          });
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: error?.message || "Failed to resend verification email",
          });
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto h-6" />

          <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50">
            <EnvelopeIcon className="size-8 text-amber-600 dark:text-amber-400" />
          </div>

          <Heading className="mt-6">Check your email</Heading>

          <Text className="mt-3">
            We've sent a verification link to your email address. Please click the
            link to verify your account.
          </Text>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-200 dark:bg-zinc-800">
                <EnvelopeIcon className="size-5 text-stone-500 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Didn't receive the email?
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="font-medium text-emerald-600 underline disabled:opacity-50 dark:text-emerald-400"
                  >
                    {isResending ? "sending..." : "resend email"}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <Button href="/login" className="mt-8 w-full" outline>
            Back to sign in
          </Button>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto h-6" />

          <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-stone-200 dark:bg-zinc-800">
            <div className="size-6 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-600 dark:border-zinc-600 dark:border-t-emerald-400" />
          </div>

          <Heading className="mt-6">Verifying your email</Heading>

          <Text className="mt-3">Please wait while we verify your email address...</Text>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <CheckCircleIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <Heading className="mt-6">Email verified!</Heading>

          <Text className="mt-3">
            Your email has been verified successfully. You can now sign in to your
            account and start earning cashback.
          </Text>

          <Button href="/login" className="mt-8 w-full" color="emerald">
            Sign in to your account
          </Button>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto h-6" />

          <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50">
            <ExclamationTriangleIcon className="size-8 text-amber-600 dark:text-amber-400" />
          </div>

          <Heading className="mt-6">Link expired</Heading>

          <Text className="mt-3">
            This verification link has expired. Please request a new one to verify
            your email address.
          </Text>

          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            className="mt-8 w-full"
            color="emerald"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>

          <Text className="mt-6 text-center">
            <TextLink href="/login">
              <Strong>Back to sign in</Strong>
            </TextLink>
          </Text>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm text-center">
        <Logo className="mx-auto h-6" />

        <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
          <ExclamationTriangleIcon className="size-8 text-red-600 dark:text-red-400" />
        </div>

        <Heading className="mt-6">Verification failed</Heading>

        <Text className="mt-3">
          We couldn't verify your email address. The link may be invalid or has
          already been used.
        </Text>

        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          className="mt-8 w-full"
          color="emerald"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>

        <Text className="mt-6 text-center">
          <TextLink href="/login">
            <Strong>Back to sign in</Strong>
          </TextLink>
        </Text>

        <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
        </p>
      </div>
    </div>
  );
}
