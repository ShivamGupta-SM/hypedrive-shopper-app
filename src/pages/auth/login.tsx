import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { FormError } from "@/components/form-error";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { getLoginErrorMessage } from "@/lib/error-utils";
import { useLogin, useSocialLogin } from "@/store/auth-store";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { mutate: login, isPending } = useLogin();
  const { mutate: socialLogin, isPending: socialPending } = useSocialLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const prefilledEmail = searchParams.get("email") || "";
  const socialError = searchParams.get("error");

  // Show social auth error from callback
  useEffect(() => {
    if (socialError === "social_auth_failed") {
      toast.error("Social login failed. Please try again.");
    }
  }, [socialError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail,
      password: "",
    },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setServerError(null);
    const result = await socialLogin(provider, {
      onSuccess: (redirectUrl) => {
        if (redirectUrl) {
          // Redirect to OAuth provider
          window.location.href = redirectUrl;
        }
      },
      onError: (err) => {
        toast.error(err.message || "Social login failed");
      },
    });

    // If we got a redirectUrl but callback wasn't called (shouldn't happen)
    if (result?.success && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  const isLoading = isPending || socialPending;

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    const result = await login(
      { email: data.email, password: data.password },
      {
        onError: (err) => {
          const message = getLoginErrorMessage(err);
          setServerError(message);
        },
      }
    );

    if (result?.success && result.redirectTo) {
      navigate(result.redirectTo);
    }
  };

  const displayError = errors.email?.message || errors.password?.message || serverError;

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
            <div className="mb-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/20">
              <p className="text-sm font-medium text-zinc-400">Total cashback earned</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white">₹2,34,567</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-400">
                <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
                </svg>
                +23% from last month
              </p>
            </div>
            <blockquote>
              <p className="text-lg font-medium leading-relaxed text-white/90">
                "I've earned over ₹50,000 in cashback this year. The process is seamless and payouts are always on time."
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400">
                  PK
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Priya Kapoor</p>
                  <p className="text-xs text-zinc-500">Verified Shopper</p>
                </div>
              </footer>
            </blockquote>
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
                Welcome back
              </h1>
              <p className="mt-3 text-[15px] text-zinc-500 dark:text-zinc-400">
                Sign in to start earning rebates and track your savings.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                <FormError message={displayError} />

                <div className="space-y-4">
                  <Field>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      disabled={isLoading}
                      autoComplete="username email"
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <TextLink href="/forgot-password" className="text-xs">
                        Forgot?
                      </TextLink>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        disabled={isLoading}
                        autoComplete="current-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="done"
                        placeholder="••••••••"
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
                    <Checkbox name="remember" disabled={isLoading} />
                    <Label className="text-sm">Keep me signed in</Label>
                  </CheckboxField>

                  <Button type="submit" className="w-full" color="dark/zinc" disabled={isLoading}>
                    {isPending ? "Signing in..." : "Sign in"}
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

              {/* Sign up link */}
              <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                New to Hypedrive?{" "}
                <TextLink href="/register">
                  <Strong>Create account</Strong>
                </TextLink>
              </p>

              {/* Terms */}
              <p className="mt-6 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
                By continuing, you agree to Hypedrive's{" "}
                <TextLink href="/terms" target="_blank" className="font-semibold text-zinc-600 dark:text-zinc-400">
                  Terms of Service
                </TextLink>{" "}
                and{" "}
                <TextLink href="/privacy" target="_blank" className="font-semibold text-zinc-600 dark:text-zinc-400">
                  Privacy Policy
                </TextLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
