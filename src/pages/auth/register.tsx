import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { FormError } from "@/components/form-error";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { getRegisterErrorMessage, isUserExistsError } from "@/lib/error-utils";
import { useRegister, useSocialLogin } from "@/store/auth-store";
import {
  BanknotesIcon,
  BoltIcon,
  EyeIcon,
  EyeSlashIcon,
  GiftIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useDocumentTitle } from "@/hooks";

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  name: z
    .string()
    .min(1, "Please enter your full name")
    .min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(1, "Please enter a password")
    .min(8, "Password must be at least 8 characters"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Please accept the terms and conditions"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const benefits = [
  { id: "cashback", text: "50-100% + bonus on purchases", icon: SparklesIcon },
  { id: "tracking", text: "Instant tracking in real-time", icon: BoltIcon },
  { id: "payouts", text: "Fast payouts to your bank", icon: BanknotesIcon },
  { id: "deals", text: "Exclusive deals and offers", icon: GiftIcon },
];

export function Register() {
  useDocumentTitle("Create Account | HypeDrive");

  const { mutate: registerUser, isPending } = useRegister();
  const { mutate: socialLogin, isPending: socialPending } = useSocialLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setServerError(null);
    const result = await socialLogin(provider, {
      onSuccess: (redirectUrl) => {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      },
      onError: (err) => {
        toast.error(err.message || "Social login failed");
      },
    });

    if (result?.success && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  const isLoading = isPending || socialPending;

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const result = await registerUser(
      { email: data.email, password: data.password, name: data.name },
      {
        onSuccess: () => {
          toast.success("Account created! Complete your profile to start earning.");
        },
        onError: (err) => {
          if (isUserExistsError(err)) {
            toast.info("Account already exists. Sign in to continue.");
            navigate(`/login?email=${encodeURIComponent(data.email)}`);
            return;
          }
          const message = getRegisterErrorMessage(err);
          setServerError(message);
        },
      }
    );

    if (result?.success && result.redirectTo) {
      navigate(result.redirectTo);
    }
  };

  const displayError =
    errors.email?.message ||
    errors.name?.message ||
    errors.password?.message ||
    errors.acceptTerms?.message ||
    serverError;

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
      {/* Mobile: Bottom sheet style layout */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Desktop: Left visual panel */}
        <div className="relative hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-zinc-900">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 max-w-md p-12">
            {/* Title */}
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">Start earning today</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Get cashback on every purchase
              </h2>
            </div>

            {/* Benefits */}
            <ul className="space-y-5">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.id} className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Icon className="size-4 text-emerald-400" />
                    </div>
                    <span className="text-base text-white/80">{benefit.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-white">₹2.5Cr+</p>
                <p className="mt-1 text-sm text-zinc-500">Cashback paid</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="mt-1 text-sm text-zinc-500">Active shoppers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100+</p>
                <p className="mt-1 text-sm text-zinc-500">Partner brands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form section */}
        <div className="flex flex-1 flex-col lg:w-1/2">
          {/* Main content */}
          <div className="flex flex-1 flex-col justify-center px-6 py-8 lg:px-12">
            <div className="mx-auto w-full max-w-sm">
              {/* Logo */}
              <Logo className="mb-8 h-8" />

              {/* Title */}
              <h1 className="text-[28px] font-bold text-zinc-900 dark:text-white">
                Get Started
              </h1>
              <p className="mt-3 text-[15px] text-zinc-500 dark:text-zinc-400">
                Create your account to start earning rebates and track your savings.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                <FormError message={displayError} />

                <div className="space-y-4">
                  <Field>
                    <Label>Full name</Label>
                    <Input
                      type="text"
                      {...register("name")}
                      disabled={isLoading}
                      autoComplete="name"
                      autoCapitalize="words"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="John Doe"
                      data-invalid={errors.name ? true : undefined}
                    />
                  </Field>

                  <Field>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      {...register("email")}
                      disabled={isLoading}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      spellCheck={false}
                      enterKeyHint="next"
                      placeholder="you@example.com"
                      data-invalid={errors.email ? true : undefined}
                    />
                  </Field>

                  <Field>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        disabled={isLoading}
                        autoComplete="new-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="done"
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

                  <CheckboxField>
                    <Checkbox
                      name="terms"
                      checked={acceptTerms}
                      onChange={(checked) => setValue("acceptTerms", checked, { shouldValidate: true })}
                      disabled={isLoading}
                    />
                    <Label className="text-sm">
                      I agree to the{" "}
                      <TextLink href="/terms" target="_blank">
                        Terms of Service
                      </TextLink>{" "}
                      and{" "}
                      <TextLink href="/privacy" target="_blank">
                        Privacy Policy
                      </TextLink>
                    </Label>
                  </CheckboxField>

                  <Button type="submit" className="w-full" color="dark/zinc" disabled={isLoading}>
                    {isPending ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              </form>

              {/* Social login options */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-[15px]">{socialPending ? "Connecting..." : "Continue with Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 active:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                  <span className="text-[15px]">{socialPending ? "Connecting..." : "Continue with Apple"}</span>
                </button>
              </div>

              {/* Sign in link */}
              <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <TextLink href="/login">
                  <Strong>Sign in</Strong>
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
