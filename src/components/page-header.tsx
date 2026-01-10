import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Optional action element (button, link) aligned to the right */
  action?: React.ReactNode;
  /** Optional className for the container */
  className?: string;
}

/**
 * PageHeader - Consistent page title component
 *
 * Use this at the top of every page for consistent styling.
 *
 * @example
 * <PageHeader
 *   title="Campaigns"
 *   description="Browse campaigns and earn cashback on purchases"
 * />
 *
 * @example
 * <PageHeader
 *   title="Notifications"
 *   action={<Button plain>Mark all read</Button>}
 * />
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Heading>{title}</Heading>
          {description && (
            <Text className="mt-1">{description}</Text>
          )}
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
    </header>
  );
}
