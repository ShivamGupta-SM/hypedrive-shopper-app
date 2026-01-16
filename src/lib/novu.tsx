/**
 * Novu Notification Integration
 * Using @novu/react for headless notification functionality
 *
 * Docs: https://docs.novu.co/platform/sdks/react
 */

import {
	NovuProvider as BaseNovuProvider,
	useNotifications as useNovuNotifications,
	useCounts,
	usePreferences as useNovuPreferences,
	Inbox,
	Bell,
	Notifications,
} from "@novu/react";
import { createContext, useContext, type ReactNode } from "react";

// ============================================================================
// ENV CONFIG
// ============================================================================

const NOVU_APP_ID = import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER || "";
const NOVU_SUBSCRIBER_ID = import.meta.env.VITE_NOVU_SUBSCRIBER_ID || "";

/**
 * Check if Novu is properly configured
 */
export function isNovuConfigured(): boolean {
	return (
		!!NOVU_APP_ID &&
		!!NOVU_SUBSCRIBER_ID &&
		NOVU_APP_ID !== "your_novu_app_id_here" &&
		NOVU_SUBSCRIBER_ID !== "your_subscriber_id_here"
	);
}

// ============================================================================
// CONTEXT FOR CONFIGURATION STATE
// ============================================================================

const NovuConfigContext = createContext<{ isConfigured: boolean }>({
	isConfigured: false,
});

// ============================================================================
// PROVIDER
// ============================================================================

interface NovuProviderProps {
	children: ReactNode;
	applicationIdentifier?: string;
	subscriberId?: string;
}

/**
 * Novu Provider wrapper
 * Wraps the app to enable notification functionality
 *
 * @example
 * ```tsx
 * // In App.tsx
 * import { NovuProvider } from "@/lib/novu";
 *
 * function App() {
 *   return (
 *     <NovuProvider>
 *       <YourApp />
 *     </NovuProvider>
 *   );
 * }
 * ```
 */
export function NovuProvider({
	children,
	applicationIdentifier = NOVU_APP_ID,
	subscriberId = NOVU_SUBSCRIBER_ID,
}: NovuProviderProps) {
	const configured = isNovuConfigured();

	// Skip if not configured
	if (!configured) {
		console.warn(
			"[Novu] Not configured. Set VITE_NOVU_APPLICATION_IDENTIFIER and VITE_NOVU_SUBSCRIBER_ID in .env"
		);
		return (
			<NovuConfigContext.Provider value={{ isConfigured: false }}>
				{children}
			</NovuConfigContext.Provider>
		);
	}

	return (
		<NovuConfigContext.Provider value={{ isConfigured: true }}>
			<BaseNovuProvider
				applicationIdentifier={applicationIdentifier}
				subscriberId={subscriberId}
			>
				{children}
			</BaseNovuProvider>
		</NovuConfigContext.Provider>
	);
}

// ============================================================================
// INTERNAL HOOKS (used inside NovuProvider when configured)
// ============================================================================

function useNotificationsInternal() {
	const result = useNovuNotifications();
	return {
		notifications: result.notifications || [],
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		hasMore: result.hasMore,
		fetchMore: result.fetchMore,
		refetch: result.refetch,
		// Actions from the SDK
		readAll: result.readAll,
		seenAll: result.seenAll,
		archiveAll: result.archiveAll,
		archiveAllRead: result.archiveAllRead,
	};
}

function useUnreadCountInternal() {
	// useCounts requires filters array
	const { counts, isLoading } = useCounts({
		filters: [{ read: false }],
	});
	return {
		unreadCount: counts?.[0]?.count || 0,
		isLoading,
	};
}

function usePreferencesInternal() {
	const result = useNovuPreferences();
	return {
		preferences: result.preferences || [],
		isLoading: result.isLoading,
		refetch: result.refetch,
	};
}

// ============================================================================
// WRAPPER COMPONENTS FOR SAFE HOOK USAGE
// ============================================================================

/**
 * Wrapper to safely use Novu hooks
 * Only renders children with hook data when Novu is configured
 */
export function WithNovuNotifications({
	children,
}: {
	children: (data: ReturnType<typeof useNotificationsInternal>) => ReactNode;
}) {
	const { isConfigured } = useContext(NovuConfigContext);

	if (!isConfigured) {
		return (
			<>
				{children({
					notifications: [],
					isLoading: false,
					isFetching: false,
					hasMore: false,
					fetchMore: async () => {},
					refetch: async () => {},
					readAll: async () => ({}),
					seenAll: async () => ({}),
					archiveAll: async () => ({}),
					archiveAllRead: async () => ({}),
				})}
			</>
		);
	}

	return <NotificationsConsumer>{children}</NotificationsConsumer>;
}

function NotificationsConsumer({
	children,
}: {
	children: (data: ReturnType<typeof useNotificationsInternal>) => ReactNode;
}) {
	const data = useNotificationsInternal();
	return <>{children(data)}</>;
}

export function WithUnreadCount({
	children,
}: {
	children: (data: ReturnType<typeof useUnreadCountInternal>) => ReactNode;
}) {
	const { isConfigured } = useContext(NovuConfigContext);

	if (!isConfigured) {
		return <>{children({ unreadCount: 0, isLoading: false })}</>;
	}

	return <UnreadCountConsumer>{children}</UnreadCountConsumer>;
}

function UnreadCountConsumer({
	children,
}: {
	children: (data: ReturnType<typeof useUnreadCountInternal>) => ReactNode;
}) {
	const data = useUnreadCountInternal();
	return <>{children(data)}</>;
}

export function WithPreferences({
	children,
}: {
	children: (data: ReturnType<typeof usePreferencesInternal>) => ReactNode;
}) {
	const { isConfigured } = useContext(NovuConfigContext);

	if (!isConfigured) {
		return (
			<>
				{children({
					preferences: [],
					isLoading: false,
					refetch: async () => {},
				})}
			</>
		);
	}

	return <PreferencesConsumer>{children}</PreferencesConsumer>;
}

function PreferencesConsumer({
	children,
}: {
	children: (data: ReturnType<typeof usePreferencesInternal>) => ReactNode;
}) {
	const data = usePreferencesInternal();
	return <>{children(data)}</>;
}

// ============================================================================
// SIMPLE HOOK FOR CHECKING CONFIG STATUS
// ============================================================================

/**
 * Check if Novu is configured and ready
 * Safe to use anywhere
 */
export function useNovuStatus() {
	const { isConfigured } = useContext(NovuConfigContext);
	return { isConfigured };
}

// ============================================================================
// NOTIFICATION TYPES (for reference)
// ============================================================================

export interface NovuNotification {
	id: string;
	subject?: string;
	body: string;
	isRead: boolean;
	isArchived: boolean;
	createdAt: string;
	readAt?: string;
	archivedAt?: string;
	avatar?: string;
	primaryAction?: {
		label: string;
		url?: string;
	};
	secondaryAction?: {
		label: string;
		url?: string;
	};
	tags?: string[];
	data?: Record<string, unknown>;
}

export interface NovuPreference {
	workflow: {
		id: string;
		name: string;
		critical: boolean;
	};
	channels: {
		email?: boolean;
		sms?: boolean;
		in_app?: boolean;
		push?: boolean;
		chat?: boolean;
	};
}

// Re-export components from @novu/react
export { Inbox, Bell, Notifications };
