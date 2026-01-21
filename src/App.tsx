import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import "./App.css";
import { handleAuthError } from "@/store/auth-store";
import { isAPIError } from "@/hooks/use-api";

// Apply saved theme on startup (before React hydration to prevent flash)
function initializeTheme() {
	const savedTheme = localStorage.getItem("theme") || "system";
	const root = document.documentElement;

	if (savedTheme === "system") {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		root.setAttribute("data-theme", prefersDark ? "dark" : "light");
	} else {
		root.setAttribute("data-theme", savedTheme);
	}
}

// Run immediately
initializeTheme();

import { ProtectedRoute, PublicRoute, OnboardingRoute } from "./components/protected-route";
import { AppInitializer } from "./components/app-initializer";
import { AppLayout } from "./components/app-layout";
import { Dashboard } from "./pages/dashboard";
import { CampaignsList, CampaignShow } from "./pages/campaigns";
import { EnrollmentsList, EnrollmentShow } from "./pages/enrollments";
import { Settings } from "./pages/settings";
import { Support } from "./pages/support";
import { Wallet } from "./pages/wallet";
import { TransactionShow } from "./pages/wallet/transactions/show";
import { WithdrawalsList } from "./pages/wallet/withdrawals/list";
import { WithdrawalShow } from "./pages/wallet/withdrawals/show";
import { ForgotPassword, Login, Register, ResetPassword, VerifyEmail, Onboarding } from "./pages/auth";
import { AuthLayout } from "./pages/auth/layout";
import { TermsOfService, PrivacyPolicy, RefundPolicy } from "./pages/legal";
import IconsDemoPage from "./pages/demo/icons";

// Create a React Query client with sensible defaults
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * 1000, // 30 seconds
			gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time, formerly cacheTime)
			retry: (failureCount, error) => {
				// Don't retry on 401 errors - handle auth failure instead
				if (isAPIError(error) && error.status === 401) {
					handleAuthError();
					return false;
				}
				return failureCount < 1;
			},
			refetchOnWindowFocus: false,
		},
	},
});

// Export queryClient for use in logout
export { queryClient };

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppInitializer>
					<Routes>
						{/* Protected Routes */}
						<Route element={<ProtectedRoute />}>
							<Route element={<AppLayout />}>
								<Route index element={<Dashboard />} />
								<Route path="campaigns">
									<Route index element={<CampaignsList />} />
									<Route path=":id" element={<CampaignShow />} />
								</Route>
								<Route path="enrollments">
									<Route index element={<EnrollmentsList />} />
									<Route path=":id" element={<EnrollmentShow />} />
								</Route>
								<Route path="wallet">
									<Route index element={<Wallet />} />
									<Route path="transactions/:id" element={<TransactionShow />} />
									<Route path="withdrawals" element={<WithdrawalsList />} />
									<Route path="withdrawals/:id" element={<WithdrawalShow />} />
								</Route>
								<Route path="settings" element={<Settings />} />
								<Route path="support" element={<Support />} />
							</Route>
						</Route>

						{/* Onboarding Route - requires auth but NO shopper profile */}
						<Route element={<OnboardingRoute />}>
							<Route path="onboarding" element={<Onboarding />} />
						</Route>

						{/* Public Routes (auth pages) */}
						<Route element={<PublicRoute />}>
							<Route element={<AuthLayout />}>
								<Route path="login" element={<Login />} />
								<Route path="register" element={<Register />} />
								<Route path="forgot-password" element={<ForgotPassword />} />
								<Route path="reset-password" element={<ResetPassword />} />
								<Route path="verify-email" element={<VerifyEmail />} />
							</Route>
						</Route>

						{/* Legal Pages (public, no auth required) */}
						<Route path="terms" element={<TermsOfService />} />
						<Route path="privacy" element={<PrivacyPolicy />} />
						<Route path="refund" element={<RefundPolicy />} />

						{/* Demo Pages */}
						<Route path="demo/icons" element={<IconsDemoPage />} />
					</Routes>
					<Toaster
						position="top-center"
						closeButton
						duration={4000}
						gap={8}
					/>
				</AppInitializer>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
