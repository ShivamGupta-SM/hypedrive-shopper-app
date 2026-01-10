type StatVariant = "default" | "success" | "warning" | "info";

interface StatCardProps {
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Label text (e.g., "Total", "Pending") */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtext below value */
  subtext?: string;
  /** Color variant */
  variant?: StatVariant;
  /** Optional className */
  className?: string;
}

const variantStyles: Record<StatVariant, { bg: string; text: string }> = {
  default: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-600 dark:text-amber-400",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-600 dark:text-sky-400",
  },
};

/**
 * StatCard - Unified stat display component
 *
 * Two styles based on whether icon is provided:
 * - With icon: Icon in colored box + label + value + subtext
 * - Without icon: Colored background card with value + label
 *
 * @example With icon (Wallet/Enrollments style)
 * <StatCard
 *   icon={CheckCircleIcon}
 *   label="Approved"
 *   value={12}
 *   variant="success"
 * />
 *
 * @example Without icon (Dashboard JourneyStats style)
 * <StatCard
 *   label="Total joined"
 *   value={24}
 *   variant="info"
 * />
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  // Style with icon (like Wallet/Enrollments list)
  if (Icon) {
    return (
      <div
        className={`flex flex-col rounded-xl bg-white p-3 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 ${className || ""}`}
      >
        <div
          className={`flex size-8 items-center justify-center rounded-lg ${styles.bg}`}
        >
          <Icon className={`size-4 ${styles.text}`} />
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-[10px] text-zinc-400">{subtext}</p>
        )}
      </div>
    );
  }

  // Style without icon (Dashboard JourneyStats style - colored background)
  return (
    <div className={`rounded-xl ${styles.bg} p-3.5 ${className || ""}`}>
      <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
      <p
        className={`mt-0.5 text-[11px] font-medium ${styles.text} opacity-70`}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * StatCardGrid - Container for stat cards
 *
 * @example 3 column grid
 * <StatCardGrid>
 *   <StatCard label="Total" value={10} />
 *   <StatCard label="Active" value={5} />
 *   <StatCard label="Done" value={5} />
 * </StatCardGrid>
 *
 * @example 4 column grid
 * <StatCardGrid columns={4}>
 *   ...
 * </StatCardGrid>
 */
export function StatCardGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 3 | 4;
  className?: string;
}) {
  const gridClass = columns === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className={`grid ${gridClass} gap-2 ${className || ""}`}>
      {children}
    </div>
  );
}
