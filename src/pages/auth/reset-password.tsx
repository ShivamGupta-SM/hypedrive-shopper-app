import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, Text, TextLink } from "@/components/text";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import { useNotification, useUpdatePassword } from "@refinedev/core";
import { useState } from "react";
import { useSearchParams } from "react-router";

export function ResetPassword() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();
  const { open } = useNotification();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      open?.({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    if (password.length < 8) {
      open?.({
        type: "error",
        message: "Password must be at least 8 characters",
      });
      return;
    }

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    updatePassword(
      { password, confirmPassword, token },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: error?.message || "Failed to reset password",
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

          <div className="mx-auto mt-8 flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
            <LockClosedIcon className="size-8 text-red-600 dark:text-red-400" />
          </div>

          <Heading className="mt-6">Invalid reset link</Heading>

          <Text className="mt-3">
            This password reset link is invalid or has expired. Please request a
            new one.
          </Text>

          <Button href="/forgot-password" className="mt-8 w-full" color="emerald">
            Request new link
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <CheckCircleIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <Heading className="mt-6">Password reset successful</Heading>

          <Text className="mt-3">
            Your password has been updated successfully. You can now sign in with
            your new password.
          </Text>

          <Button href="/login" className="mt-8 w-full" color="emerald">
            <ArrowLeftIcon className="size-4" />
            Sign in
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
            <LockClosedIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          <Heading className="mt-6">Create new password</Heading>

          <Text className="mt-2">
            Enter your new password below. Make sure it's at least 8 characters.
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <Field>
            <Label>New password</Label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="new-password"
              placeholder="Enter new password"
            />
            <p className="mt-2 text-xs text-zinc-500">At least 8 characters</p>
          </Field>

          <Field>
            <Label>Confirm password</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
              autoComplete="new-password"
              placeholder="Confirm new password"
            />
          </Field>

          <Button type="submit" className="w-full" color="emerald" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset password"}
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
