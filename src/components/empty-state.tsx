import { Button } from "@/components/button";
import { SparklesIcon } from "@heroicons/react/16/solid";

interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ComponentType<{ className?: string }>;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional secondary action (like "Clear filters") */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional className */
  className?: string;
}

/**
 * EmptyState - Unified empty state component
 *
 * @example Basic empty state
 * <EmptyState
 *   icon={ShoppingBagIcon}
 *   title="No enrollments yet"
 *   description="Start earning cashback by enrolling in campaigns."
 *   action={{ label: "Browse Campaigns", href: "/campaigns" }}
 * />
 *
 * @example With filter clear option
 * <EmptyState
 *   icon={SparklesIcon}
 *   title="No campaigns found"
 *   description="We couldn't find any campaigns matching your criteria."
 *   secondaryAction={{ label: "Clear filters", onClick: handleClear }}
 * />
 */
export function EmptyState({
  icon: Icon = SparklesIcon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50 ${className || ""}`}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="size-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-4 font-semibold text-zinc-900 dark:text-white">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-center text-sm text-zinc-500">
        {description}
      </p>
      {action && (
        <Button
          href={action.href}
          onClick={action.onClick}
          className="mt-5"
        >
          {action.label}
        </Button>
      )}
      {secondaryAction && (
        <Button outline onClick={secondaryAction.onClick} className="mt-5">
          {secondaryAction.label}
        </Button>
      )}
    </div>
  );
}

/**
 * InlineEmptyState - Smaller empty state for inline use (e.g., in cards)
 */
export function InlineEmptyState({
  icon: Icon = SparklesIcon,
  title,
  description,
  action,
  className,
}: Omit<EmptyStateProps, "secondaryAction">) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ""}`}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Icon className="size-6 text-zinc-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
        {title}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action && (
        <Button
          href={action.href}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
