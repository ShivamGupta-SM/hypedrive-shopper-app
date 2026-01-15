import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, Text, TextLink } from "@/components/text";
import {
  BanknotesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { useLogin, useNotification } from "@refinedev/core";
import { useState } from "react";

export function Login() {
  const { mutate: login, isPending } = useLogin();
  const { open } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      open?.({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    login(
      { email, password },
      {
        onError: (error) => {
          open?.({
            type: "error",
            message: error?.message || "Login failed",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-10 lg:flex xl:p-12">
        <Logo className="h-6" theme="light" />

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-semibold text-white xl:text-5xl">
              Welcome back to Hypedrive
            </h1>
            <p className="mt-3 text-base text-zinc-400">
              Sign in to track your earnings and manage your campaigns
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-700/60">
                  <BanknotesIcon className="size-5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">Earn Real Cashback</p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Get rewarded on every purchase you make
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-700/60">
                  <RocketLaunchIcon className="size-5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">Exclusive Campaigns</p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Access special offers from top brands
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-700/60">
                  <ShieldCheckIcon className="size-5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">Fast & Secure Payouts</p>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Quick withdrawals directly to your bank
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center bg-stone-100 p-6 dark:bg-zinc-950 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo className="h-6" />
          </div>

          <div className="mt-8 lg:mt-0">
            <Heading>Sign in to your account</Heading>
            <Text className="mt-2">
              Enter your credentials to access your dashboard
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

            <Field>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </Field>

            <div className="flex items-center justify-between">
              <CheckboxField>
                <Checkbox name="remember" disabled={isPending} />
                <Label>Remember me</Label>
              </CheckboxField>
              <TextLink href="/forgot-password">
                <Strong>Forgot password?</Strong>
              </TextLink>
            </div>

            <Button type="submit" className="w-full" color="emerald" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <Text className="mt-10 text-center">
            Don't have an account?{" "}
            <TextLink href="/register">
              <Strong>Sign up</Strong>
            </TextLink>
          </Text>

          <p className="mt-10 text-center text-xs text-zinc-400 dark:text-zinc-500 lg:hidden">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
