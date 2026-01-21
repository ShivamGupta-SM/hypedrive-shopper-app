import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  ShoppingBagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import type { shared } from "@/hooks/use-api";
import { useInfiniteEnrollments } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/money-utils";
import { EnrollmentCardSkeleton, SkeletonWrapper } from "@/lib/skeleton";
import { getStatusColors } from "@/lib/theme";

type EnrollmentStatus = shared.EnrollmentStatus;

function getStatusConfig(status: EnrollmentStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  bgClass: string;
  iconClass: string;
} {
  // Get colors from centralized theme
  const colors = getStatusColors(status);

  // Status-specific labels and icons
  const statusInfo: Record<EnrollmentStatus, { label: string; icon: typeof CheckCircleIcon }> = {
    awaiting_submission: { label: "Pending", icon: DocumentTextIcon },
    awaiting_review: { label: "In Review", icon: ClockIcon },
    changes_requested: { label: "Changes Needed", icon: ExclamationTriangleIcon },
    approved: { label: "Approved", icon: CheckCircleIcon },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon },
    withdrawn: { label: "Withdrawn", icon: XMarkIcon },
    expired: { label: "Expired", icon: ClockIcon },
  };

  const info = statusInfo[status] || { label: status, icon: ClockIcon };

  return {
    label: info.label,
    icon: info.icon,
    bgClass: colors.bg,
    iconClass: colors.icon,
  };
}

function LoadingSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <EnrollmentCardSkeleton key={`skeleton-${n}`} />
        ))}
      </div>
    </SkeletonWrapper>
  );
}

// Semicircle gauge for deadline visualization - clean and simple
function DeadlineGauge({
  daysRemaining,
  totalDays = 30
}: {
  daysRemaining: number;
  totalDays?: number;
}) {
  const percent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  const isExpired = daysRemaining <= 0;
  const isUrgent = daysRemaining <= 3;

  const strokeColor = isExpired
    ? "#ef4444"
    : isUrgent
      ? "#f59e0b"
      : "#10b981";

  const textColor = isExpired
    ? "text-red-600 dark:text-red-400"
    : isUrgent
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 8 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          <title>{daysRemaining} days remaining</title>
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
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Center value */}
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-base font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[7px] font-medium uppercase tracking-wide opacity-70">days</span>
        </div>
      </div>
    </div>
  );
}

// Get icon for deliverable type based on name
function getDeliverableIcon(name: string): { icon: string; color: string } {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('amazon') || nameLower.includes('review')) {
    return { icon: 'amazon', color: 'text-orange-500' };
  }
  if (nameLower.includes('instagram') || nameLower.includes('insta') || nameLower.includes('reel')) {
    return { icon: 'instagram', color: 'text-pink-500' };
  }
  if (nameLower.includes('youtube') || nameLower.includes('video')) {
    return { icon: 'youtube', color: 'text-red-500' };
  }
  if (nameLower.includes('facebook') || nameLower.includes('fb')) {
    return { icon: 'facebook', color: 'text-blue-600' };
  }
  if (nameLower.includes('twitter') || nameLower.includes('tweet') || nameLower.includes('x')) {
    return { icon: 'twitter', color: 'text-sky-500' };
  }
  if (nameLower.includes('rating') || nameLower.includes('star')) {
    return { icon: 'star', color: 'text-amber-500' };
  }
  if (nameLower.includes('photo') || nameLower.includes('image')) {
    return { icon: 'photo', color: 'text-violet-500' };
  }
  return { icon: 'document', color: 'text-zinc-500' };
}

// Simple icon component for deliverables
function DeliverableIcon({ type, className }: { type: string; className?: string }) {
  const baseClass = `shrink-0 ${className || 'size-3'}`;

  switch (type) {
    case 'amazon':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.13.063.1.08.22.05.36-.03.14-.1.28-.2.4-.5.6-1.1 1.1-1.8 1.5-2.1 1.2-4.5 2.1-7.2 2.6-.9.2-1.8.3-2.7.4-.6 0-1.1.1-1.7.1-2.6 0-5.1-.5-7.6-1.5-2.3-.9-4.4-2.2-6.3-3.8-.3-.3-.4-.5-.3-.8z"/>
          <path d="M6.265 13.768c0-1.18.314-2.2.944-3.057.63-.857 1.456-1.51 2.474-1.96 1.018-.45 2.127-.73 3.326-.84.5-.04 1.22-.08 2.16-.13v-.55c0-.91-.13-1.56-.4-1.95-.44-.6-1.13-.9-2.07-.9-.5 0-.92.1-1.28.3-.36.2-.57.5-.62.9-.02.2-.07.4-.15.55-.1.15-.26.25-.47.3l-2.7-.4c-.16-.03-.28-.1-.35-.2-.07-.1-.08-.22-.04-.35.2-1.06.72-1.9 1.54-2.5.82-.6 1.81-1 2.97-1.2.5-.09 1.05-.13 1.65-.13 1.18 0 2.23.2 3.15.6.92.4 1.57.96 1.95 1.68.38.72.57 1.61.57 2.67v5.26c0 .5.04.95.1 1.35.07.4.2.73.4 1 .06.1.1.2.13.28.02.08 0 .17-.07.25l-2.14 1.6c-.14.1-.26.15-.38.13-.12-.02-.24-.09-.35-.2-.35-.37-.6-.7-.77-.99-.17-.3-.33-.66-.5-1.08-.94 1.08-2.05 1.8-3.35 2.15-.5.13-1.04.2-1.63.2-1.12 0-2.06-.34-2.82-1.03-.76-.69-1.14-1.65-1.14-2.87zm3.77-.6c0 .55.14.99.41 1.32.27.33.64.5 1.1.5.06 0 .13 0 .22-.02.09-.01.18-.03.28-.06.53-.15.97-.46 1.32-.94.35-.48.52-1.05.52-1.7v-.9l-1.46.08c-1.11.06-1.86.29-2.26.68-.23.23-.13.52-.13 1.04z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'star':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
      );
    case 'photo':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
        </svg>
      );
  }
}

function EnrollmentCard({
  enrollment,
}: {
  enrollment: {
    id: string;
    orderId: string;
    orderValueDecimal: string;
    currency: string;
    status: EnrollmentStatus;
    lockedRebatePercentage: number;
    lockedBonusAmountDecimal?: string;
    purchaseDate?: string;
    expiresAt?: string;
    createdAt: string;
    campaignId: string;
    campaign?: {
      title: string;
      product?: {
        name: string;
        primaryImage?: string;
      };
      platform?: {
        name: string;
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
  };
}) {
  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  const estimatedPayout = useMemo(() => {
    const orderValue = parseFloat(enrollment.orderValueDecimal);
    const rebate = (orderValue * enrollment.lockedRebatePercentage) / 100;
    const bonus = enrollment.lockedBonusAmountDecimal
      ? parseFloat(enrollment.lockedBonusAmountDecimal)
      : 0;
    return rebate + bonus;
  }, [
    enrollment.orderValueDecimal,
    enrollment.lockedRebatePercentage,
    enrollment.lockedBonusAmountDecimal,
  ]);

  const deadlineInfo = useMemo(() => {
    if (!enrollment.expiresAt) return null;
    const expiresAt = new Date(enrollment.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const formattedDate = expiresAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return { daysRemaining, formattedDate };
  }, [enrollment.expiresAt]);

  const hasDeadline = deadlineInfo !== null && deadlineInfo.daysRemaining > 0;
  // Show gauge for all active (in-progress) statuses
  const showGauge = hasDeadline && (
    enrollment.status === "awaiting_submission" ||
    enrollment.status === "changes_requested" ||
    enrollment.status === "awaiting_review"
  );

  const productName = enrollment.campaign?.product?.name || enrollment.campaign?.title;
  const productImage = enrollment.campaign?.product?.primaryImage;
  const platformIcon = enrollment.campaign?.platform?.icon;
  const platformName = enrollment.campaign?.platform?.name;

  // Get deliverables from API
  const deliverables = enrollment.deliverables || [];

  // Format date
  const enrollmentDate = new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
                  alt={productName || "Product"}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex size-full items-center justify-center"><svg class="size-6 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5z" clip-rule="evenodd" /></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <ShoppingBagIcon className="size-8 text-zinc-400" />
                </div>
              )}
            </div>
            {platformIcon && (
              <img
                src={platformIcon}
                alt={platformName}
                loading="lazy"
                decoding="async"
                className="absolute -bottom-1 -right-1 size-5 rounded-md border-2 border-white bg-white object-contain dark:border-zinc-900 dark:bg-zinc-900"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            {/* Title + Status Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white">
                {productName || "Campaign Enrollment"}
              </h3>
              <div className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusConfig.bgClass}`}>
                <StatusIcon className={`size-3 ${statusConfig.iconClass}`} />
                <span className="text-zinc-700 dark:text-zinc-200">{statusConfig.label}</span>
              </div>
            </div>

            {/* Order & Date Info */}
            <div className="mt-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5C0 2.784.784 2 1.75 2zm0 1.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75z"/>
                  <path d="M3.5 5.5h3v3h-3v-3zm0 4.5h3v2h-3v-2zm4.5-4.5h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h2v1h-2v-1z"/>
                </svg>
                <span className="font-medium">{enrollment.orderId}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M4 1.75a.75.75 0 01.75.75V3h6.5V2.5a.75.75 0 011.5 0V3h.25A2.75 2.75 0 0115.75 5.75v7.5A2.75 2.75 0 0113 16H3A2.75 2.75 0 01.25 13.25v-7.5A2.75 2.75 0 013 3h.25V2.5a.75.75 0 01.75-.75zm10.25 4.5a1.25 1.25 0 00-1.25-1.25H3A1.25 1.25 0 001.75 6.25v.5h12.5v-.5z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">{enrollmentDate}</span>
              </div>
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
                  const isComplete = d.proofLink || d.proofScreenshot;
                  const iconInfo = getDeliverableIcon(d.name);
                  return (
                    <span
                      key={d.campaignDeliverableId}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "border-zinc-200 bg-gradient-to-b from-white to-zinc-50 text-zinc-700 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800/80 dark:text-zinc-300"
                      }`}
                    >
                      <DeliverableIcon type={iconInfo.icon} className={`size-3 ${isComplete ? 'text-emerald-500' : iconInfo.color}`} />
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

      {/* Pricing Section - 3 columns with dividers */}
      <div className="relative border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="grid grid-cols-3 items-end px-3 py-3 sm:px-4">
          {/* Order Value */}
          <div className="text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Order Value</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">
              {formatCurrency(enrollment.orderValueDecimal)}
            </p>
          </div>

          {/* Cashback */}
          <div className="text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {enrollment.status === "approved" ? "Earned" : "Cashback"}
            </p>
            <p className="mt-0.5 text-base font-semibold text-emerald-600 sm:text-lg dark:text-emerald-400">
              {formatCurrency(estimatedPayout)}
            </p>
          </div>

          {/* Days Left / Status */}
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {showGauge ? "Days Left" : "Status"}
            </p>
            {showGauge && deadlineInfo ? (
              <div className="-mb-1">
                <DeadlineGauge daysRemaining={deadlineInfo.daysRemaining} />
              </div>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {enrollment.status === "approved" ? "Complete" : enrollment.status === "permanently_rejected" ? "Rejected" : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Vertical Dividers */}
        <div className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </Link>
  );
}


// Tab types for filtering
type TabType = "all" | "pending" | "changes_requested" | "in_progress" | "completed" | "expired";

// Tab button component
function TabButton({
  label,
  icon: Icon,
  iconColor,
  isActive,
  onClick,
  count,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${
        isActive
          ? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
          : "bg-white text-zinc-600 ring-zinc-200 active:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:active:bg-zinc-700"
      }`}
    >
      {Icon && <Icon className={`size-4 ${isActive ? "" : iconColor || ""}`} />}
      {label}
      {count !== undefined && count > 0 && (
        <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
          isActive
            ? "bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Map tab to status filters - defined outside component to avoid recreating
const tabStatusMap: Record<TabType, EnrollmentStatus[] | undefined> = {
  all: undefined,
  pending: ["awaiting_submission"],
  changes_requested: ["changes_requested"],
  in_progress: ["awaiting_review"],
  completed: ["approved", "permanently_rejected", "withdrawn"],
  expired: ["expired"],
};

// Tab label mapping
const tabLabels: Record<TabType, string> = {
  all: "All",
  pending: "Pending",
  changes_requested: "Action Required",
  in_progress: "Under Review",
  completed: "Completed",
  expired: "Expired",
};

export function EnrollmentsList() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const params = useMemo(
    () => ({
      limit: 20,
    }),
    []
  );

  const {
    data: enrollments,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useInfiniteEnrollments(params);

  // Filter enrollments based on active tab and search query
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments;

    // Filter by tab status
    const tabStatuses = tabStatusMap[activeTab];
    if (tabStatuses) {
      filtered = filtered.filter((e) => tabStatuses.includes(e.status as EnrollmentStatus));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((e) => {
        const campaignTitle = e.campaign?.title?.toLowerCase() || "";
        const productName = e.campaign?.product?.name?.toLowerCase() || "";
        const orderId = e.orderId?.toLowerCase() || "";
        return campaignTitle.includes(query) || productName.includes(query) || orderId.includes(query);
      });
    }

    return filtered;
  }, [enrollments, activeTab, searchQuery]);

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const stats = useMemo(() => {
    if (!enrollments.length) return null;
    return {
      total: enrollments.length,
      pending: enrollments.filter(
        (e) => e.status === "awaiting_submission"
      ).length,
      changesRequested: enrollments.filter(
        (e) => e.status === "changes_requested"
      ).length,
      inProgress: enrollments.filter(
        (e) => e.status === "awaiting_review"
      ).length,
      completed: enrollments.filter(
        (e) =>
          e.status === "approved" ||
          e.status === "permanently_rejected" ||
          e.status === "withdrawn"
      ).length,
      expired: enrollments.filter(
        (e) => e.status === "expired"
      ).length,
    };
  }, [enrollments]);

  // Check if user has any enrollments at all
  const hasAnyEnrollments = enrollments.length > 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <Heading>Enrollments</Heading>
        <Text className="mt-0.5 text-sm">Track your campaign enrollments and earnings</Text>
      </div>

      {/* Search Bar - only show when there are enrollments */}
      {hasAnyEnrollments && (
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            name="search"
            placeholder="Search by product, campaign, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      )}

      {/* Tabs - only show when there are enrollments */}
      {hasAnyEnrollments && (
        <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabButton
            label={tabLabels.all}
            icon={QueueListIcon}
            iconColor="text-sky-500"
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <TabButton
            label={tabLabels.pending}
            icon={DocumentTextIcon}
            iconColor="text-amber-500"
            isActive={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            count={stats?.pending}
          />
          <TabButton
            label={tabLabels.changes_requested}
            icon={ExclamationTriangleIcon}
            iconColor="text-orange-500"
            isActive={activeTab === "changes_requested"}
            onClick={() => setActiveTab("changes_requested")}
            count={stats?.changesRequested}
          />
          <TabButton
            label={tabLabels.in_progress}
            icon={ClockIcon}
            iconColor="text-sky-500"
            isActive={activeTab === "in_progress"}
            onClick={() => setActiveTab("in_progress")}
            count={stats?.inProgress}
          />
          <TabButton
            label={tabLabels.completed}
            icon={CheckCircleIcon}
            iconColor="text-emerald-500"
            isActive={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
          />
          <TabButton
            label={tabLabels.expired}
            icon={XCircleIcon}
            iconColor="text-red-500"
            isActive={activeTab === "expired"}
            onClick={() => setActiveTab("expired")}
            count={stats?.expired}
          />
        </div>
      )}

      {/* Results count - only show when there are filtered results */}
      {!loading && filteredEnrollments.length > 0 && (
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 sm:pb-3 dark:border-zinc-700">
          <p className="text-[13px] text-zinc-500 sm:text-sm">
            {`${filteredEnrollments.length} enrollment${filteredEnrollments.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-12 sm:py-16 dark:bg-zinc-900/50">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <XMarkIcon className="size-6 text-red-500" />
          </div>
          <p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-zinc-500">Unable to load enrollments</p>
          <Button onClick={() => refetch()} outline className="mt-5">
            Try again
          </Button>
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={
                  enrollment as Parameters<typeof EnrollmentCard>[0]["enrollment"]
                }
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4 sm:py-6">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
                  Loading more...
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          preset="enrollments"
          title={activeTab !== "all" || searchQuery.trim() !== "" ? "No matching enrollments" : "No enrollments yet"}
          description={activeTab !== "all" || searchQuery.trim() !== "" ? "Try adjusting your filters to find your enrollments." : "Start earning cashback by enrolling in campaigns."}
          action={activeTab === "all" && searchQuery.trim() === "" ? { label: "Browse Campaigns", href: "/campaigns" } : undefined}
        />
      )}
    </div>
  );
}
