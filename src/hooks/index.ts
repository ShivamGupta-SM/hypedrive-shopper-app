/**
 * Custom hooks and re-exports from usehooks-ts
 * Provides commonly used hooks throughout the app
 */

// Re-export commonly used hooks from usehooks-ts
export {
	// Storage
	useLocalStorage,
	useSessionStorage,
	useReadLocalStorage,

	// Media & Responsive
	useMediaQuery,

	// DOM & Events
	useOnClickOutside,
	useEventListener,
	useHover,
	useIntersectionObserver,
	useScrollLock,
	useWindowSize,
	useResizeObserver,
	useScreen,

	// State Management
	useBoolean,
	useCounter,
	useToggle,
	useCopyToClipboard,
	useDebounceValue,
	useDebounceCallback,
	useMap,

	// Effects & Lifecycle
	useIsMounted,
	useIsClient,
	useUnmount,

	// Timing
	useInterval,
	useTimeout,
	useCountdown,
	useStep,

	// Input & Form
	useDocumentTitle,
} from "usehooks-ts";

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

import { useMediaQuery, useLocalStorage } from "usehooks-ts";

/**
 * Check if we're on a mobile device (< 768px)
 */
export function useIsMobile() {
	return !useMediaQuery("(min-width: 768px)");
}

/**
 * Check if we're on a tablet device (768px - 1024px)
 */
export function useIsTablet() {
	const isTabletUp = useMediaQuery("(min-width: 768px)");
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	return isTabletUp && !isDesktop;
}

/**
 * Check if we're on a desktop device (>= 1024px)
 */
export function useIsDesktop() {
	return useMediaQuery("(min-width: 1024px)");
}

/**
 * Get current breakpoint
 */
export function useBreakpoint(): "mobile" | "tablet" | "desktop" | "wide" {
	const isWide = useMediaQuery("(min-width: 1280px)");
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isTablet = useMediaQuery("(min-width: 768px)");

	if (isWide) return "wide";
	if (isDesktop) return "desktop";
	if (isTablet) return "tablet";
	return "mobile";
}

/**
 * Theme preference hook
 */
export function useTheme() {
	const [theme, setTheme] = useLocalStorage<"light" | "dark" | "system">("theme", "system");

	const isDark = useMediaQuery("(prefers-color-scheme: dark)");

	const resolvedTheme = theme === "system" ? (isDark ? "dark" : "light") : theme;

	return {
		theme,
		setTheme,
		resolvedTheme,
		isDark: resolvedTheme === "dark",
	};
}

/**
 * Reduced motion preference
 */
export function usePrefersReducedMotion() {
	return useMediaQuery("(prefers-reduced-motion: reduce)");
}
