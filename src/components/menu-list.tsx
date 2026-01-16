import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { Badge } from "@/components/badge";

// =============================================================================
// MENU LIST COMPONENTS
// iOS-style grouped menu patterns extracted for reuse across the app
// =============================================================================

// Duotone icon color presets for circle icons
export const duotoneColors = {
  sky: { bg: "bg-sky-100 dark:bg-sky-900/40", icon: "text-sky-600 dark:text-sky-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/40", icon: "text-orange-600 dark:text-orange-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-400" },
  red: { bg: "bg-red-100 dark:bg-red-900/40", icon: "text-red-600 dark:text-red-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/40", icon: "text-amber-600 dark:text-amber-400" },
  zinc: { bg: "bg-zinc-100 dark:bg-zinc-800", icon: "text-zinc-500 dark:text-zinc-400" },
} as const;

export type DuotoneColor = keyof typeof duotoneColors;

/**
 * MenuSection - iOS-style grouped section container
 *
 * @example
 * <MenuSection>
 *   <MenuRow icon={UserIcon} iconBg="bg-sky-500" label="Profile" onClick={() => {}} isFirst />
 *   <MenuSeparator />
 *   <MenuRow icon={CogIcon} iconBg="bg-zinc-500" label="Settings" onClick={() => {}} isLast />
 * </MenuSection>
 */
export function MenuSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {children}
    </div>
  );
}

/**
 * MenuSectionHeader - iOS-style uppercase section header (above MenuSection)
 *
 * @example
 * <MenuSectionHeader>Account</MenuSectionHeader>
 * <MenuSection>...</MenuSection>
 */
export function MenuSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {children}
    </h3>
  );
}

/**
 * MenuSectionFooter - Small text below MenuSection for additional context
 *
 * @example
 * <MenuSection>...</MenuSection>
 * <MenuSectionFooter>Additional information here.</MenuSectionFooter>
 */
export function MenuSectionFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 px-4 text-[13px] text-zinc-500 dark:text-zinc-400">
      {children}
    </p>
  );
}

/**
 * MenuSeparator - iOS-style indented divider (starts after icon)
 * Calculation: px-4 (16px) + size-9 (36px) + gap-3 (12px) = 64px
 */
export function MenuSeparator() {
  return <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />;
}

/**
 * MenuRow - iOS-style menu item row
 *
 * @example Basic navigation row
 * <MenuRow
 *   icon={UserIcon}
 *   iconBg="bg-sky-500"
 *   label="Profile"
 *   onClick={() => navigate('/profile')}
 *   isFirst
 * />
 *
 * @example Row with value
 * <MenuRow
 *   icon={PhoneIcon}
 *   iconBg="bg-emerald-500"
 *   label="Phone"
 *   value="+91 98765 43210"
 * />
 *
 * @example Row with badge
 * <MenuRow
 *   icon={BellIcon}
 *   iconBg="bg-amber-500"
 *   label="Notifications"
 *   badge="3"
 *   badgeColor="amber"
 * />
 *
 * @example Destructive row (logout, delete)
 * <MenuRow
 *   icon={TrashIcon}
 *   iconBg="bg-red-500"
 *   label="Delete Account"
 *   onClick={handleDelete}
 *   destructive
 *   isLast
 * />
 */
export function MenuRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  badge,
  badgeColor,
  onClick,
  destructive,
  isFirst,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  /** Legacy: solid background color (e.g., "bg-sky-500") */
  iconBg?: string;
  /** Preferred: duotone circle style */
  iconColor?: DuotoneColor;
  label: string;
  value?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "red" | "zinc";
  onClick?: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const Component = onClick ? "button" : "div";

  // Use duotone colors if iconColor is provided, otherwise fall back to legacy iconBg
  // All icon containers use rounded-xl (squircle) for consistency
  const useDuotone = iconColor && duotoneColors[iconColor];
  const containerClasses = useDuotone
    ? `flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors[iconColor].bg}`
    : `flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`;
  const iconClasses = useDuotone
    ? `size-4 ${duotoneColors[iconColor].icon}`
    : "size-4 text-white";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 bg-white px-4 py-3 text-left ${
        onClick ? "active:bg-zinc-100 dark:active:bg-zinc-800" : ""
      } dark:bg-zinc-900 ${isFirst ? "rounded-t-xl" : ""} ${
        isLast ? "rounded-b-xl" : ""
      }`}
    >
      <div className={containerClasses}>
        <Icon className={iconClasses} />
      </div>
      <span
        className={`shrink-0 text-[15px] ${
          destructive ? "text-red-500" : "text-zinc-900 dark:text-white"
        }`}
      >
        {label}
      </span>
      {value && (
        <span className="min-w-0 flex-1 truncate text-right text-[15px] text-zinc-400 dark:text-zinc-500">
          {value}
        </span>
      )}
      {badge && (
        <Badge color={badgeColor || "zinc"} className="shrink-0 text-[11px]">
          {badge}
        </Badge>
      )}
      {onClick && !destructive && (
        <ChevronRightIcon className="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
      )}
    </Component>
  );
}

/**
 * MenuActionButton - Full-width action button inside MenuSection
 *
 * @example
 * <MenuSection>
 *   <MenuRow ... isLast={false} />
 *   <MenuSeparator />
 *   <MenuActionButton onClick={handleAdd} color="sky">
 *     <PlusIcon className="size-4" />
 *     Add Item
 *   </MenuActionButton>
 * </MenuSection>
 */
export function MenuActionButton({
  children,
  onClick,
  color = "sky",
  isFirst,
  isLast = true,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: "sky" | "emerald" | "amber" | "red" | "zinc";
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const colorClasses = {
    sky: "text-sky-600 dark:text-sky-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    zinc: "text-zinc-600 dark:text-zinc-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 bg-white py-3 text-[15px] font-medium active:bg-zinc-50 dark:bg-zinc-900 dark:active:bg-zinc-800 ${
        colorClasses[color]
      } ${isFirst ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * MenuDangerButton - Destructive action button (logout, delete)
 *
 * @example
 * <MenuSection>
 *   <MenuDangerButton onClick={handleLogout}>
 *     <ArrowRightStartOnRectangleIcon className="size-4" />
 *     Sign Out
 *   </MenuDangerButton>
 * </MenuSection>
 */
export function MenuDangerButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[15px] font-medium text-red-500 shadow-sm ring-1 ring-zinc-200 active:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800 dark:active:bg-zinc-800"
    >
      {children}
    </button>
  );
}
