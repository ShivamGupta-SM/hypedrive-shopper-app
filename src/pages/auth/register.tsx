import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, Text, TextLink } from "@/components/text";
import {
  BanknotesIcon,
  GiftIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { useNotification, useRegister } from "@refinedev/core";
import { useState } from "react";

export function Register() {
  const { mutate: register, isPending } = useRegister();
  const { open } = useNotification();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !password) {
      open?.({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    if (!acceptTerms) {
      open?.({
        type: "error",
        message: "Please accept the terms and conditions",
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

    register(
      { email, password, name },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Account created! Complete your profile to start earning.",
          });
        },
        onError: (error) => {
          open?.({
            type: "error",
            message: error?.message || "Registration failed",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden w-1/2 flex-col justify-between bg-cyan-950 p-10 lg:flex xl:p-12">
        <Logo className="h-6 text-white" />

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Join Hypedrive Today
            </h1>
            <p className="mt-3 text-base text-cyan-200/80">
              Create your account and start earning cashback on your purchases
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-cyan-800/50 bg-cyan-900/40 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-800/60">
                <GiftIcon className="size-5 text-cyan-300" />
              </div>
              <p className="mt-4 font-semibold text-white">Free to Join</p>
              <p className="mt-1 text-sm text-cyan-300/70">No fees, start earning instantly</p>
            </div>
            <div className="rounded-2xl border border-cyan-800/50 bg-cyan-900/40 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-800/60">
                <BanknotesIcon className="size-5 text-cyan-300" />
              </div>
              <p className="mt-4 font-semibold text-white">Real Cashback</p>
              <p className="mt-1 text-sm text-cyan-300/70">Earn money on purchases</p>
            </div>
            <div className="rounded-2xl border border-cyan-800/50 bg-cyan-900/40 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-800/60">
                <SparklesIcon className="size-5 text-cyan-300" />
              </div>
              <p className="mt-4 font-semibold text-white">Premium Campaigns</p>
              <p className="mt-1 text-sm text-cyan-300/70">Exclusive brand offers</p>
            </div>
            <div className="rounded-2xl border border-cyan-800/50 bg-cyan-900/40 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-800/60">
                <ShieldCheckIcon className="size-5 text-cyan-300" />
              </div>
              <p className="mt-4 font-semibold text-white">Secure Payouts</p>
              <p className="mt-1 text-sm text-cyan-300/70">Quick bank withdrawals</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-cyan-400/60">
          &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center bg-white p-6 dark:bg-zinc-950 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo className="h-6" />
          </div>

          <div className="mt-8 lg:mt-0">
            <Heading>Create your account</Heading>
            <Text className="mt-2">
              Join Hypedrive to earn rewards on your purchases
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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
              <Label>Full name</Label>
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                autoComplete="name"
                placeholder="Enter your full name"
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
                autoComplete="new-password"
                placeholder="Create a password"
              />
              <p className="mt-2 text-xs text-zinc-500">At least 8 characters</p>
            </Field>

            <CheckboxField>
              <Checkbox
                name="terms"
                checked={acceptTerms}
                onChange={(checked) => setAcceptTerms(checked)}
                disabled={isPending}
              />
              <Label>
                I agree to the{" "}
                <TextLink href="#" target="_blank">
                  Terms of Service
                </TextLink>{" "}
                and{" "}
                <TextLink href="#" target="_blank">
                  Privacy Policy
                </TextLink>
              </Label>
            </CheckboxField>

            <Button type="submit" className="w-full" color="cyan" disabled={isPending}>
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <Text className="mt-10 text-center">
            Already have an account?{" "}
            <TextLink href="/login">
              <Strong>Sign in</Strong>
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
