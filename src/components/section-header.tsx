import { Link } from "@/components/link";
import { ChevronRightIcon } from "@heroicons/react/16/solid";

interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional "View all" style action link */
  action?: {
    label: string;
    href: string;
  };
  /** Variant: default (semibold) or uppercase (iOS Settings style) */
  variant?: "default" | "uppercase";
  /** Optional className */
  className?: string;
}

/**
 * SectionHeader - Consistent section title component
 *
 * @example Default variant (for Dashboard sections)
 * <SectionHeader
 *   title="Earn cashback"
 *   action={{ label: "View all", href: "/campaigns" }}
 * />
 *
 * @example Uppercase variant (for Settings style)
 * <SectionHeader
 *   title="Account"
 *   variant="uppercase"
 * />
 */
export function SectionHeader({
  title,
  action,
  variant = "default",
  className,
}: SectionHeaderProps) {
  if (variant === "uppercase") {
    return (
      <h3
        className={`mb-2 px-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${className || ""}`}
      >
        {title}
      </h3>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          {action.label}
          <ChevronRightIcon className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/**
 * SectionFooter - Small helper text below a section (iOS Settings style)
 */
export function SectionFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mt-2 px-4 text-xs text-zinc-500 dark:text-zinc-400 ${className || ""}`}
    >
      {children}
    </p>
  );
}
