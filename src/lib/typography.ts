/**
 * Typography Scale for Hypedrive Shopper
 *
 * Consistent typography classes for use across the application.
 * Based on Apple/iOS design principles with mobile-first approach.
 */

// =============================================================================
// TYPOGRAPHY CLASSES
// =============================================================================

export const typography = {
  /** Display - Hero numbers (balance, large stats) */
  display: "text-3xl font-bold tracking-tight",

  /** Heading - Page titles */
  heading: "text-xl font-semibold text-zinc-900 dark:text-white",

  /** Subheading - Section headers */
  subheading: "text-sm font-semibold text-zinc-900 dark:text-white",

  /** Body - Primary content */
  body: "text-sm text-zinc-600 dark:text-zinc-400",

  /** Body Small - Secondary content */
  bodySmall: "text-sm text-zinc-500 dark:text-zinc-400",

  /** Caption - Labels, metadata */
  caption: "text-xs text-zinc-500 dark:text-zinc-400",

  /** Caption Strong - Important labels */
  captionStrong: "text-xs font-medium text-zinc-500 dark:text-zinc-400",

  /** Micro - Badges, tiny text */
  micro: "text-[11px] font-medium",

  /** Uppercase Label - Settings style headers */
  uppercaseLabel: "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400",
} as const;

// =============================================================================
// SPACING SCALE
// =============================================================================

export const spacing = {
  /** Page section vertical spacing */
  pageSections: "space-y-6",

  /** Card padding */
  cardPadding: "p-4",

  /** Card internal gap */
  cardGap: "gap-3",

  /** Grid gap mobile */
  gridGapMobile: "gap-3",

  /** Grid gap desktop */
  gridGapDesktop: "sm:gap-4",

  /** List item padding */
  listItemPadding: "px-4 py-3",
} as const;

// =============================================================================
// CARD PATTERNS
// =============================================================================

export const cardStyles = {
  /** Standard card with subtle border */
  default: "rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",

  /** Elevated card with shadow (Settings style) */
  elevated: "rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",

  /** Interactive card with hover state */
  interactive: "rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700",

  /** Hero card (Balance card style) */
  hero: "rounded-2xl bg-emerald-600 p-5 dark:bg-emerald-700",

  /** Alert card base */
  alert: "rounded-xl border p-4",
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================

export const iconSizes = {
  /** Inline with caption text */
  xs: "size-3",

  /** Chevrons, tiny indicators */
  sm: "size-3.5",

  /** Standard icons in buttons, menu items */
  md: "size-4",

  /** Icons in list items, cards */
  lg: "size-5",

  /** Tab bar icons, primary nav */
  xl: "size-6",

  /** Empty state icons */
  "2xl": "size-8",

  /** Hero empty states */
  "3xl": "size-10",
} as const;

// =============================================================================
// GRID PATTERNS
// =============================================================================

export const gridPatterns = {
  /** 2 column mobile, 3 column desktop */
  campaignGrid: "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3",

  /** 1 column mobile, 2 column desktop */
  enrollmentGrid: "grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2",

  /** 3 column stat cards */
  statGrid: "grid grid-cols-3 gap-2",

  /** 4 column stat cards */
  statGridWide: "grid grid-cols-4 gap-2",
} as const;
