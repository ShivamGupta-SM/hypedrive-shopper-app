import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { queryKeys, getAuthenticatedClient } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  WalletIcon,
  BanknotesIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

// Format phone number as user types: +91 98765 43210
function formatPhoneNumber(value: string): string {
  const hasPlus = value.startsWith("+");
  const digits = value.replace(/\D/g, "");

  if (!digits) return hasPlus ? "+" : "";

  let formatted = "+";

  if (digits.length <= 2) {
    formatted += digits;
  } else if (digits.length <= 7) {
    formatted += digits.slice(0, 2) + " " + digits.slice(2);
  } else {
    formatted += digits.slice(0, 2) + " " + digits.slice(2, 7) + " " + digits.slice(7, 12);
  }

  return formatted;
}

// Calculate max date (must be at least 13 years old)
function getMaxDOB(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date.toISOString().split("T")[0];
}

const onboardingSchema = z.object({
  firstName: z
    .string()
    .min(1, "Please enter your first name")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Please enter your last name")
    .min(2, "Last name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Please enter a valid phone number (e.g., +91 98765 43210)" }
    ),
  dob: z.string().min(1, "Please enter your date of birth"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: "profile", label: "Create profile", description: "Basic details for your account" },
  { id: "wallet", label: "Wallet setup", description: "Auto-created for instant payouts" },
  { id: "start", label: "Start earning", description: "Shop and earn cashback" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Split user.name into first/last if possible
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const defaultFirstName = nameParts[0] || "";
  const defaultLastName = nameParts.slice(1).join(" ") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      phoneNumber: "+91 ",
      dob: "",
    },
  });

  const phoneNumber = watch("phoneNumber");

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      setValue("phoneNumber", formatted, { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data: OnboardingFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Convert formatted phone to E.164 format for API
      const e164Phone = "+" + data.phoneNumber.replace(/\D/g, "");

      // Call register endpoint to create shopper + wallet
      const client = getAuthenticatedClient();
      await client.shoppers.register({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phoneNumber: e164Phone,
        dob: data.dob,
      });

      // Invalidate TanStack Query cache - this is now the single source of truth
      await queryClient.invalidateQueries({ queryKey: queryKeys.shopperProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet });

      toast.success("Profile created! Welcome to Hypedrive.");

      // Navigate to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create profile";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError =
    errors.firstName?.message ||
    errors.lastName?.message ||
    errors.phoneNumber?.message ||
    errors.dob?.message ||
    serverError;

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      {/* Left Section - Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <header className="flex items-center px-6 py-5 sm:px-10">
          <Logo className="h-7" />
        </header>

        {/* Form Container */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                  1
                </div>
                <div className="h-0.5 w-8 bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                  2
                </div>
                <div className="h-0.5 w-8 bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex size-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                  3
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Step 1 of 3</p>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Complete your profile
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                A few more details to set up your wallet and start earning cashback.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
              {displayError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40">
                  <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{displayError}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <Label>First name</Label>
                    <Input
                      type="text"
                      {...register("firstName")}
                      disabled={isSubmitting}
                      autoComplete="given-name"
                      autoCapitalize="words"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="John"
                      data-invalid={errors.firstName ? true : undefined}
                    />
                  </Field>

                  <Field>
                    <Label>Last name</Label>
                    <Input
                      type="text"
                      {...register("lastName")}
                      disabled={isSubmitting}
                      autoComplete="family-name"
                      autoCapitalize="words"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="Doe"
                      data-invalid={errors.lastName ? true : undefined}
                    />
                  </Field>
                </div>

                <Field>
                  <Label>Phone number</Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={isSubmitting}
                    autoComplete="tel"
                    inputMode="tel"
                    autoCapitalize="none"
                    autoCorrect="off"
                    enterKeyHint="next"
                    placeholder="+91 98765 43210"
                    data-invalid={errors.phoneNumber ? true : undefined}
                  />
                </Field>

                <Field>
                  <Label>Date of birth</Label>
                  <Input
                    type="date"
                    {...register("dob")}
                    disabled={isSubmitting}
                    autoComplete="bday"
                    enterKeyHint="done"
                    max={getMaxDOB()}
                    data-invalid={errors.dob ? true : undefined}
                  />
                </Field>

                <Button type="submit" className="w-full" color="dark/zinc" disabled={isSubmitting}>
                  {isSubmitting ? "Creating profile..." : "Continue"}
                </Button>
              </div>
            </form>

            {/* Mobile steps preview */}
            <div className="mt-10 lg:hidden">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">What happens next?</p>
              <ul className="mt-4 space-y-3">
                {steps.map((step) => (
                  <li key={step.id} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {step.label}
                  </li>
                ))}
              </ul>
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

      {/* Right Section - Visual (Desktop only) */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-zinc-900">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-12">
            {/* Main content */}
            <div className="flex flex-1 flex-col justify-center">
              {/* Title */}
              <div className="mb-10">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">Almost there</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                  Your cashback journey starts here
                </h2>
              </div>

              {/* Steps */}
              <ul className="space-y-6">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex items-start gap-4">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-white/60"
                    }`}>
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className={`text-base font-medium ${
                        index === 0 ? "text-white" : "text-white/60"
                      }`}>{step.label}</p>
                      <p className="mt-0.5 text-sm text-zinc-500">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Features */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
                    <WalletIcon className="size-5 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">Auto wallet</p>
                  <p className="mt-1 text-xs text-zinc-500">Created instantly</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
                    <BanknotesIcon className="size-5 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">Fast payouts</p>
                  <p className="mt-1 text-xs text-zinc-500">Direct to bank</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheckIcon className="size-5 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">Secure</p>
                  <p className="mt-1 text-xs text-zinc-500">Bank-grade security</p>
                </div>
              </div>
            </div>

            {/* Bottom badges */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                Free to join
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                Min. ₹100 withdrawal
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
