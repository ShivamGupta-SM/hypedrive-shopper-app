import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, Text, TextLink } from "@/components/text";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  KeyIcon,
} from "@heroicons/react/16/solid";
import { useForgotPassword, useNotification } from "@refinedev/core";
import { useState } from "react";

export function ForgotPassword() {
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const { open } = useNotification();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      open?.({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: error?.message || "Failed to send reset email",
          });
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <CheckCircleIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <Heading className="mt-6">Check your email</Heading>

          <Text className="mt-3">
            We've sent a password reset link to <Strong>{email}</Strong>. Please
            check your inbox and follow the instructions.
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
                    onClick={() => setSubmitted(false)}
                    className="font-medium text-emerald-600 underline dark:text-emerald-400"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          </div>

          <Button href="/login" className="mt-8 w-full" color="emerald">
            <ArrowLeftIcon className="size-4" />
            Back to sign in
          </Button>

          <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo className="mx-auto h-6" />

          <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <KeyIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <Heading className="mt-6">Reset your password</Heading>

          <Text className="mt-2">
            Enter your email and we'll send you a link to reset your password
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Button type="submit" className="w-full" color="emerald" disabled={isPending}>
            {isPending ? "Sending..." : "Send reset link"}
          </Button>

          <Text className="text-center">
            Remember your password?{" "}
            <TextLink href="/login">
              <Strong>Sign in</Strong>
            </TextLink>
          </Text>
        </form>

        <p className="mt-10 text-center text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
        </p>
      </div>
    </div>
  );
}
