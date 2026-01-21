import { cardStyles } from "@/lib/typography";

type CardVariant = "default" | "elevated" | "interactive";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  /** Card style variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Additional className */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

/**
 * Card - Consistent card container component
 *
 * @example Default card with medium padding
 * <Card>
 *   <p>Card content</p>
 * </Card>
 *
 * @example Elevated card (Settings style)
 * <Card variant="elevated" padding="none">
 *   <MenuRow ... />
 * </Card>
 *
 * @example Interactive card
 * <Card variant="interactive">
 *   <p>Clickable card</p>
 * </Card>
 */
export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
}: CardProps) {
  const variantClass = cardStyles[variant];
  const paddingClass = paddingStyles[padding];

  return (
    <div className={`${variantClass} ${paddingClass} ${className || ""}`}>
      {children}
    </div>
  );
}

/**
 * CardHeader - Header section inside a card
 */
export function CardHeader({
  title,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 ${className || ""}`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-4 text-zinc-400" />}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * CardBody - Body section inside a card (for cards with header)
 */
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className || ""}`}>{children}</div>;
}
