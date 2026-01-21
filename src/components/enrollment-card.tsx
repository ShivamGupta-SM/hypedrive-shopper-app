import { Badge } from "@/components/badge";
import { getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Link } from "@/components/link";
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useMemo } from "react";

// =============================================================================
// ENROLLMENT CARD - Shared component for enrollments list and dashboard
// =============================================================================

export interface EnrollmentCardProps {
  enrollment: {
    id: string;
    orderId?: string;
    orderValueDecimal?: string;
    currency?: string;
    status: string;
    lockedRebatePercentage?: number;
    lockedBonusAmountDecimal?: string;
    purchaseDate?: string;
    expiresAt?: string;
    createdAt?: string;
    campaignId?: string;
    campaign?: {
      title?: string;
      product?: {
        name?: string;
        primaryImage?: string;
      };
      platform?: {
        name?: string;
        icon?: string;
      };
    };
    deliverables?: Array<{
      campaignDeliverableId: string;
      name: string;
      isRequired: boolean;
      requireLink: boolean;
      requireScreenshot: boolean;
      instructions?: string;
      proofLink?: string;
      proofScreenshot?: string;
    }>;
    payoutAmountDecimal?: string;
  };
}

// Format currency
function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Status config - same pattern as campaigns/show.tsx (Catalyst Badge component)
function getStatusConfig(status: string): {
  label: string;
  icon: typeof CheckCircleIcon;
  color: "emerald" | "amber" | "red" | "zinc" | "sky";
} {
  const statusInfo: Record<string, { label: string; icon: typeof CheckCircleIcon; color: "emerald" | "amber" | "red" | "zinc" | "sky" }> = {
    awaiting_submission: { label: "Pending", icon: DocumentTextIcon, color: "amber" },
    awaiting_review: { label: "In Review", icon: ClockIcon, color: "sky" },
    changes_requested: { label: "Changes Needed", icon: ExclamationTriangleIcon, color: "amber" },
    approved: { label: "Approved", icon: CheckCircleIcon, color: "emerald" },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
    withdrawn: { label: "Withdrawn", icon: XMarkIcon, color: "zinc" },
    expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
  };

  const info = statusInfo[status] || { label: status, icon: ClockIcon, color: "zinc" as const };

  return {
    label: info.label,
    icon: info.icon,
    color: info.color,
  };
}

// Get icon for deliverable type based on name - uses platform icons when available
function getDeliverableIconInfo(name: string): { platformName: string | null; fallbackType: string; color: string } {
  const nameLower = name.toLowerCase();

  // Check for platform-specific deliverables
  if (nameLower.includes('amazon') || nameLower.includes('review')) {
    return { platformName: 'amazon', fallbackType: 'document', color: 'text-orange-500' };
  }
  if (nameLower.includes('instagram') || nameLower.includes('insta') || nameLower.includes('reel')) {
    return { platformName: 'instagram', fallbackType: 'document', color: 'text-pink-500' };
  }
  if (nameLower.includes('youtube') || nameLower.includes('video')) {
    return { platformName: 'youtube', fallbackType: 'document', color: 'text-red-500' };
  }
  if (nameLower.includes('facebook') || nameLower.includes('fb')) {
    return { platformName: 'facebook', fallbackType: 'document', color: 'text-blue-600' };
  }
  if (nameLower.includes('twitter') || nameLower.includes('tweet') || nameLower.includes('x post')) {
    return { platformName: 'twitter', fallbackType: 'document', color: 'text-zinc-900 dark:text-white' };
  }
  if (nameLower.includes('flipkart')) {
    return { platformName: 'flipkart', fallbackType: 'document', color: 'text-yellow-500' };
  }
  if (nameLower.includes('google')) {
    return { platformName: 'google', fallbackType: 'document', color: 'text-blue-500' };
  }

  // Generic types without platform icons
  if (nameLower.includes('rating') || nameLower.includes('star')) {
    return { platformName: null, fallbackType: 'star', color: 'text-amber-500' };
  }
  if (nameLower.includes('photo') || nameLower.includes('image')) {
    return { platformName: null, fallbackType: 'photo', color: 'text-violet-500' };
  }

  return { platformName: null, fallbackType: 'document', color: 'text-zinc-500' };
}

// Icon component for deliverables - uses platform icons when available
function DeliverableIcon({ name, className, isComplete }: { name: string; className?: string; isComplete?: boolean }) {
  const baseClass = `shrink-0 ${className || 'size-3'}`;
  const iconInfo = getDeliverableIconInfo(name);

  // Use platform icon if available
  if (iconInfo.platformName) {
    const PlatformIconComponent = getPlatformIcon(iconInfo.platformName);
    if (PlatformIconComponent) {
      return <PlatformIconComponent className={`${baseClass} ${isComplete ? 'text-emerald-500' : iconInfo.color}`} />;
    }
  }

  // Fallback to generic icons
  const colorClass = isComplete ? 'text-emerald-500' : iconInfo.color;

  switch (iconInfo.fallbackType) {
    case 'star':
      return (
        <svg className={`${baseClass} ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
      );
    case 'photo':
      return (
        <svg className={`${baseClass} ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={`${baseClass} ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
        </svg>
      );
  }
}

/**
 * EnrollmentCard - iOS-style enrollment card with 3-column footer
 * Matches the design from enrollments list page
 *
 * @example
 * <EnrollmentCard enrollment={enrollment} />
 */
// Semicircle gauge component for deadline visualization (same pattern as enrollments/show.tsx)
function DeadlineGauge({ daysRemaining, maxDays = 30 }: { daysRemaining: number; maxDays?: number }) {
  const percent = Math.min((daysRemaining / maxDays) * 100, 100);
  const isUrgent = daysRemaining <= 3;
  const isWarning = daysRemaining <= 7;

  const strokeColor = isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
  const textColor = isUrgent
    ? "text-red-600 dark:text-red-400"
    : isWarning
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  // Gauge size for card footer
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + strokeWidth }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-zinc-700"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Days number centered below arc */}
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-sm font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[7px] font-semibold uppercase tracking-wide opacity-70">days</span>
        </div>
      </div>
    </div>
  );
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  const estimatedPayout = useMemo(() => {
    if (enrollment.payoutAmountDecimal) {
      return parseFloat(enrollment.payoutAmountDecimal);
    }
    const orderValue = parseFloat(enrollment.orderValueDecimal || "0");
    const rebate = (orderValue * (enrollment.lockedRebatePercentage || 0)) / 100;
    const bonus = enrollment.lockedBonusAmountDecimal
      ? parseFloat(enrollment.lockedBonusAmountDecimal)
      : 0;
    return rebate + bonus;
  }, [
    enrollment.orderValueDecimal,
    enrollment.lockedRebatePercentage,
    enrollment.lockedBonusAmountDecimal,
    enrollment.payoutAmountDecimal,
  ]);

  const deadlineInfo = useMemo(() => {
    if (!enrollment.expiresAt) return null;
    const expiresAt = new Date(enrollment.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { daysRemaining };
  }, [enrollment.expiresAt]);

  const hasDeadline = deadlineInfo !== null && deadlineInfo.daysRemaining > 0;
  const showGauge = hasDeadline && (
    enrollment.status === "awaiting_submission" ||
    enrollment.status === "changes_requested" ||
    enrollment.status === "awaiting_review"
  );

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title || "Campaign";
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;

  const deliverables = enrollment.deliverables || [];

  // Format date
  const enrollmentDate = enrollment.createdAt
    ? new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      {/* Main Content */}
      <div className="p-3 sm:p-4">
        {/* Product Section */}
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div className="size-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ShoppingBagIcon className="size-8 text-zinc-400" />
                </div>
              )}
            </div>
            {platformName && (() => {
              const PlatformIconComponent = getPlatformIcon(platformName);
              if (PlatformIconComponent) {
                return (
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md border-2 border-white bg-white dark:border-zinc-900 dark:bg-zinc-900">
                    <PlatformIconComponent className={`size-3.5 ${getPlatformColor(platformName)}`} />
                  </div>
                );
              }
              if (platformIcon) {
                return (
                  <img
                    src={platformIcon}
                    alt={platformName}
                    loading="lazy"
                    decoding="async"
                    className="absolute -bottom-1 -right-1 size-5 rounded-md border-2 border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
                  />
                );
              }
              return null;
            })()}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            {/* Title + Status Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white">
                {productName}
              </h3>
              <Badge color={statusConfig.color} className="inline-flex shrink-0 items-center gap-1 text-xs!">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Order & Date Info */}
            <div className="mt-1.5 space-y-0.5">
              {enrollment.orderId && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5C0 2.784.784 2 1.75 2zm0 1.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75z"/>
                    <path d="M3.5 5.5h3v3h-3v-3zm0 4.5h3v2h-3v-2zm4.5-4.5h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h2v1h-2v-1z"/>
                  </svg>
                  <span className="font-medium">{enrollment.orderId}</span>
                </div>
              )}
              {enrollmentDate && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M4 1.75a.75.75 0 01.75.75V3h6.5V2.5a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115.75 5.75v7.5A2.75 2.75 0 0113 16H3A2.75 2.75 0 01.25 13.25v-7.5A2.75 2.75 0 013 3h.25V2.5a.75.75 0 01.75-.75zm10.25 4.5a1.25 1.25 0 00-1.25-1.25H3A1.25 1.25 0 001.75 6.25v.5h12.5v-.5z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium">{enrollmentDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliverables Section - Horizontal scrollable chips */}
        {deliverables.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-white">Required Deliverables</p>
            <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4">
              <div className="flex gap-1.5 pb-1" style={{ minWidth: 'max-content' }}>
                {deliverables.map((d) => {
                  const isComplete = !!(d.proofLink || d.proofScreenshot);
                  return (
                    <span
                      key={d.campaignDeliverableId}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <DeliverableIcon name={d.name} className="size-3" isComplete={isComplete} />
                      {d.name}
                      {isComplete && <CheckCircleIcon className="size-3 text-emerald-500" />}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edge-to-edge divider */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Footer Stats - 3-column layout with dividers (matching campaign card) */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
        {/* Order Value */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Order Value</span>
          <span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
            {enrollment.orderValueDecimal ? formatCurrency(enrollment.orderValueDecimal) : "—"}
          </span>
        </div>

        {/* Cashback */}
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {enrollment.status === "approved" ? "Earned" : "Cashback"}
          </span>
          <span className="text-xs font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400">
            {formatCurrency(estimatedPayout)}
          </span>
        </div>

        {/* Days Left with Gauge */}
        <div className="flex flex-col items-center justify-center py-2">
          {showGauge && deadlineInfo ? (
            <DeadlineGauge daysRemaining={deadlineInfo.daysRemaining} />
          ) : (
            <>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Status</span>
              <span className="text-xs font-semibold text-zinc-600 sm:text-sm dark:text-zinc-300">
                {enrollment.status === "approved"
                  ? "Complete"
                  : enrollment.status === "permanently_rejected"
                    ? "Rejected"
                    : "—"}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * EnrollmentCardGrid - Container for enrollment cards
 */
export function EnrollmentCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4 ${className || ""}`}>
      {children}
    </div>
  );
}
