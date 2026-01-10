import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
	CatchAllNavigate,
	DocumentTitleHandler,
	NavigateToResource,
	UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { authProvider } from "./authProvider";
import { AppLayout } from "./components/app-layout";
import { Dashboard } from "./pages/dashboard";
import { CampaignsList, CampaignShow } from "./pages/campaigns";
import { EnrollmentsList, EnrollmentShow } from "./pages/enrollments";
import { Settings } from "./pages/settings";
import { Wallet } from "./pages/wallet";
import { ForgotPassword, Login, Register } from "./pages/auth";
import { AuthLayout } from "./pages/auth/layout";

function App() {
	return (
		<BrowserRouter>
			<RefineKbarProvider>
				<DevtoolsProvider>
					<Refine
						dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
						routerProvider={routerProvider}
						authProvider={authProvider}
						resources={[
							{
								name: "dashboard",
								list: "/",
							},
							{
								name: "campaigns",
								list: "/campaigns",
								show: "/campaigns/:id",
							},
							{
								name: "enrollments",
								list: "/enrollments",
								show: "/enrollments/:id",
							},
							{
								name: "wallet",
								list: "/wallet",
							},
							{
								name: "settings",
								list: "/settings",
							},
						]}
						options={{
							syncWithLocation: true,
							warnWhenUnsavedChanges: true,
							projectId: "0BFOvy-Ztt0eK-TW91qS",
						}}
					>
						<Routes>
							<Route
								path="/"
								element={
									<Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
										<AppLayout />
									</Authenticated>
								}
							>
								<Route index element={<Dashboard />} />
								<Route path="campaigns">
									<Route index element={<CampaignsList />} />
									<Route path=":id" element={<CampaignShow />} />
								</Route>
								<Route path="enrollments">
									<Route index element={<EnrollmentsList />} />
									<Route path=":id" element={<EnrollmentShow />} />
								</Route>
								<Route path="wallet" element={<Wallet />} />
								<Route path="settings" element={<Settings />} />
								<Route path="*" element={<ErrorComponent />} />
							</Route>
							<Route
								element={
									<Authenticated key="authenticated-outer" fallback={<Outlet />}>
										<NavigateToResource />
									</Authenticated>
								}
							>
								<Route element={<AuthLayout />}>
									<Route path="login" element={<Login />} />
									<Route path="register" element={<Register />} />
									<Route path="forgot-password" element={<ForgotPassword />} />
								</Route>
							</Route>
						</Routes>

						<RefineKbar />
						<UnsavedChangesNotifier />
						<DocumentTitleHandler />
					</Refine>
					<DevtoolsPanel />
				</DevtoolsProvider>
			</RefineKbarProvider>
		</BrowserRouter>
	);
}

export default App;
