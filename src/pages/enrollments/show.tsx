import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import {
  InstagramIcon,
  YouTubeIcon,
  TwitterIcon,
  FacebookIcon,
  TikTokIcon,
  AmazonIcon,
  FlipkartIcon,
  MyntraIcon,
  MeeshoIcon,
  NykaaIcon,
  AjioIcon,
  BigBasketIcon,
  BlinkitIcon,
  ZeptoIcon,
  DunzoIcon,
  JioMartIcon,
  SwiggyIcon,
  ZomatoIcon,
  GoogleIcon,
  LinkedInIcon,
  PinterestIcon,
  SnapchatIcon,
  WhatsAppIcon,
  TelegramIcon,
  ThreadsIcon,
  ShopifyIcon,
  PaytmIcon,
  PhonePeIcon,
  EbayIcon,
  AliExpressIcon,
  WalmartIcon,
  TargetIcon,
  EtsyIcon,
} from "@/components/icons/platform-icons";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import {
  useEnrollmentDetail,
  useEnrollmentPricing,
  useFileUpload,
  useSubmitTasks,
  useWithdrawEnrollment,
  useResubmitEnrollment,
  getAssetUrl,
  type shared,
} from "@/hooks/use-api";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { formatCurrency } from "@/lib/money-utils";
import { SkeletonWrapper, BoxSkeleton } from "@/lib/skeleton";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  PhotoIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StarIcon,
  VideoCameraIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { showError, showSuccess } from "@/lib/toast";

type EnrollmentStatusType = shared.EnrollmentStatus;

// ============================================================================
// LOADING SKELETON
// ============================================================================

function EnrollmentShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-4 lg:space-y-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            <BoxSkeleton height={160} borderRadius={12} />
            <BoxSkeleton height={100} borderRadius={12} />
            <BoxSkeleton height={250} borderRadius={12} />
          </div>
          <div className="mt-4 space-y-4 lg:mt-0">
            <BoxSkeleton height={180} borderRadius={12} />
            <BoxSkeleton height={200} borderRadius={12} />
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusConfig(status: EnrollmentStatusType): {
  color: "emerald" | "amber" | "red" | "zinc" | "sky";
  label: string;
  icon: typeof CheckCircleIcon;
  message?: string;
} {
  const configs: Record<
    EnrollmentStatusType,
    {
      color: "emerald" | "amber" | "red" | "zinc" | "sky";
      label: string;
      icon: typeof CheckCircleIcon;
      message?: string;
    }
  > = {
    awaiting_submission: {
      color: "amber",
      label: "Action Required",
      icon: ClipboardDocumentListIcon,
      message: "Complete your deliverables to earn cashback",
    },
    awaiting_review: {
      color: "sky",
      label: "Under Review",
      icon: ClockIcon,
      message: "Our team is reviewing your submission",
    },
    changes_requested: {
      color: "amber",
      label: "Changes Needed",
      icon: ExclamationTriangleIcon,
      message: "Please update your submission based on feedback",
    },
    approved: {
      color: "emerald",
      label: "Approved",
      icon: CheckCircleIcon,
      message: "Congratulations! Your cashback has been credited",
    },
    permanently_rejected: {
      color: "red",
      label: "Rejected",
      icon: XCircleIcon,
      message: "Your submission did not meet the requirements",
    },
    withdrawn: {
      color: "zinc",
      label: "Withdrawn",
      icon: XMarkIcon,
      message: "You withdrew from this campaign",
    },
    expired: {
      color: "zinc",
      label: "Expired",
      icon: ClockIcon,
      message: "The submission deadline has passed",
    },
  };
  return (
    configs[status] || {
      color: "zinc",
      label: status,
      icon: ClockIcon,
    }
  );
}

// ============================================================================
// IMAGE DROPZONE COMPONENT
// ============================================================================

function ImageDropzone({
  value,
  onChange,
  onUploading,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  onUploading?: (uploading: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    uploadFile,
    isPending: uploading,
    error: uploadError,
    reset: resetUploadError,
  } = useFileUpload();

  const error = localError || uploadError;

  const handleUpload = useCallback(
    async (file: File) => {
      setLocalError(null);
      resetUploadError();
      onUploading?.(true);

      const result = await uploadFile({
        file,
        folder: "uploads",
        maxRetries: 3,
      });

      onUploading?.(false);

      if (result.success && result.fileUrl) {
        onChange(result.fileUrl);
      } else if (result.error) {
        setLocalError(result.error);
      }
    },
    [onChange, onUploading, uploadFile, resetUploadError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const [imageError, setImageError] = useState(false);
  const displayUrl = value ? getAssetUrl(value) : undefined;

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        {imageError ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 p-4 text-center">
            <PhotoIcon className="size-8 text-zinc-400" />
            <p className="text-xs text-zinc-500">Image could not be loaded</p>
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Open link
            </a>
          </div>
        ) : (
          <img
            src={displayUrl}
            alt="Screenshot preview"
            className="max-h-40 w-full object-contain"
            onError={() => setImageError(true)}
          />
        )}
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setImageError(false);
          }}
          className="absolute right-2 top-2 rounded-full bg-zinc-900/70 p-1.5 text-white"
        >
          <XCircleIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
            : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/30 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <>
            <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600 dark:border-zinc-600 dark:border-t-emerald-400" />
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Uploading...
            </p>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CameraIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Upload screenshot
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Drag & drop or click to browse
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
              PNG, JPG up to 10MB
            </p>
          </>
        )}
      </label>
      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS STEPPER
// ============================================================================

function ProgressStepper({ status }: { status: EnrollmentStatusType }) {
  const steps = [
    { key: "enrolled", label: "Enrolled", icon: ShoppingCartIcon },
    { key: "submitted", label: "Submitted", icon: CameraIcon },
    { key: "review", label: "Review", icon: DocumentCheckIcon },
    { key: "paid", label: "Paid", icon: BanknotesIcon },
  ];

  let completedSteps = 1;
  let currentStep = 0;

  if (status === "awaiting_submission" || status === "changes_requested") {
    completedSteps = 1;
    currentStep = 1;
  } else if (status === "awaiting_review") {
    completedSteps = 2;
    currentStep = 2;
  } else if (status === "approved") {
    completedSteps = 4;
    currentStep = 3;
  } else if (
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired"
  ) {
    completedSteps = 1;
    currentStep = -1;
  }

  const isRejected =
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired";

  const progressPercent = ((completedSteps - 1) / (steps.length - 1)) * 100;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:p-5 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="relative">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const isComplete = index < completedSteps;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="relative z-10 flex flex-col items-center"
                style={{ width: `${100 / steps.length}%` }}
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full sm:size-10 ${
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-zinc-900 text-white ring-4 ring-zinc-900/10 dark:bg-white dark:text-zinc-900 dark:ring-white/20"
                        : isRejected && index >= 1
                          ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {isComplete ? (
                    <CheckIcon className="size-4 sm:size-5" />
                  ) : (
                    <Icon className="size-4 sm:size-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-center text-[10px] font-medium leading-tight sm:text-xs ${
                    isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress gauge line */}
        <div
          className="absolute left-0 right-0 top-4.5 sm:top-5"
          style={{
            marginLeft: `${100 / steps.length / 2}%`,
            marginRight: `${100 / steps.length / 2}%`,
          }}
        >
          <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          {!isRejected && (
            <div
              className="absolute inset-y-0 left-0 h-1 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DAYS LEFT GAUGE - Responsive semicircle
// ============================================================================

function GaugeSVG({
  size,
  strokeWidth,
  percent,
  strokeColor,
  daysRemaining,
}: {
  size: number;
  strokeWidth: number;
  percent: number;
  strokeColor: string;
  daysRemaining: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size / 2 + strokeWidth}
      viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
      className="overflow-visible"
    >
      <title>{daysRemaining} days remaining</title>
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="#e4e4e7"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="dark:stroke-zinc-700"
      />
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
  );
}

function DaysLeftGauge({
  expiresAt,
  status,
  maxDays = 60,
  compact = false,
  className,
}: {
  expiresAt?: string;
  status: EnrollmentStatusType;
  maxDays?: number;
  compact?: boolean;
  className?: string;
}) {
  const { daysRemaining, isUrgent, percent } = useMemo(() => {
    if (!expiresAt) return { daysRemaining: null, isUrgent: false, percent: 0 };
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return { daysRemaining: 0, isUrgent: true, percent: 0 };
    return {
      daysRemaining: diff,
      isUrgent: diff <= 3,
      percent: Math.min((diff / maxDays) * 100, 100),
    };
  }, [expiresAt, maxDays]);

  if (!expiresAt || status === "approved" || status === "permanently_rejected") {
    return null;
  }

  const textColor = isUrgent
    ? "text-amber-600 dark:text-amber-400"
    : "text-emerald-600 dark:text-emerald-400";
  const bgColor = isUrgent
    ? "bg-amber-50 dark:bg-amber-950/30"
    : "bg-emerald-50 dark:bg-emerald-950/30";

  // Compact mode: just a badge-like display
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${bgColor} ${className || ""}`}>
        <ClockIcon className={`size-3.5 ${textColor}`} />
        <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
          {daysRemaining}d left
        </span>
      </div>
    );
  }

  const strokeColor = isUrgent ? "#f59e0b" : "#10b981";

  return (
    <div className={`flex shrink-0 flex-col items-center ${className || ""}`}>
      {/* Mobile: 72px */}
      <div className="relative sm:hidden" style={{ width: 72, height: 72 / 2 + 8 }}>
        <GaugeSVG size={72} strokeWidth={5} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining ?? 0} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-lg font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[7px] font-semibold uppercase tracking-wide opacity-70">days</span>
        </div>
      </div>
      {/* Tablet: 88px */}
      <div className="relative hidden sm:block lg:hidden" style={{ width: 88, height: 88 / 2 + 8 }}>
        <GaugeSVG size={88} strokeWidth={5} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining ?? 0} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-xl font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[8px] font-semibold uppercase tracking-wide opacity-70">days left</span>
        </div>
      </div>
      {/* Desktop: 100px */}
      <div className="relative hidden lg:block" style={{ width: 100, height: 100 / 2 + 8 }}>
        <GaugeSVG size={100} strokeWidth={6} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining ?? 0} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-2xl font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">days left</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TASK ICON
// ============================================================================

function TaskIcon({ name, category }: { name?: string; category?: string }) {
  const nameLower = name?.toLowerCase() || "";
  const categoryLower = category?.toLowerCase() || "";

  // E-COMMERCE PLATFORMS - Check BEFORE generic "review" check
  if (nameLower.includes("flipkart")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <FlipkartIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("amazon")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 sm:size-10 dark:bg-amber-900/40">
        <AmazonIcon className="size-4 text-amber-600 sm:size-5 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("myntra")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1.5 sm:size-10 dark:bg-pink-900/40">
        <MyntraIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("meesho")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1.5 sm:size-10 dark:bg-pink-900/40">
        <MeeshoIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("nykaa")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1.5 sm:size-10 dark:bg-pink-900/40">
        <NykaaIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("ajio")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 px-1.5 sm:size-10 dark:bg-amber-900/40">
        <AjioIcon className="h-auto w-full text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("bigbasket") || nameLower.includes("big basket")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:size-10 dark:bg-green-900/40">
        <BigBasketIcon className="size-4 text-green-600 sm:size-5 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("blinkit")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yellow-100 px-1.5 sm:size-10 dark:bg-yellow-900/40">
        <BlinkitIcon className="h-auto w-full text-yellow-600 dark:text-yellow-500" />
      </div>
    );
  }
  if (nameLower.includes("zepto")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 px-1.5 sm:size-10 dark:bg-violet-900/40">
        <ZeptoIcon className="h-auto w-full text-violet-600 dark:text-violet-400" />
      </div>
    );
  }
  if (nameLower.includes("dunzo")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:size-10 dark:bg-green-900/40">
        <DunzoIcon className="size-4 text-green-600 sm:size-5 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("jiomart") || nameLower.includes("jio mart")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <JioMartIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("swiggy")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 sm:size-10 dark:bg-orange-900/40">
        <SwiggyIcon className="size-4 text-orange-600 sm:size-5 dark:text-orange-400" />
      </div>
    );
  }
  if (nameLower.includes("zomato")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:size-10 dark:bg-red-900/40">
        <ZomatoIcon className="size-4 text-red-600 sm:size-5 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("shopify")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:size-10 dark:bg-green-900/40">
        <ShopifyIcon className="size-4 text-green-600 sm:size-5 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("ebay")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <EbayIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("aliexpress") || nameLower.includes("ali express")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:size-10 dark:bg-red-900/40">
        <AliExpressIcon className="size-4 text-red-600 sm:size-5 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("walmart")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <WalmartIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("target")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:size-10 dark:bg-red-900/40">
        <TargetIcon className="size-4 text-red-600 sm:size-5 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("etsy")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 sm:size-10 dark:bg-orange-900/40">
        <EtsyIcon className="size-4 text-orange-600 sm:size-5 dark:text-orange-400" />
      </div>
    );
  }
  if (nameLower.includes("paytm")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 sm:size-10 dark:bg-sky-900/40">
        <PaytmIcon className="size-4 text-sky-600 sm:size-5 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("phonepe") || nameLower.includes("phone pe")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 sm:size-10 dark:bg-indigo-900/40">
        <PhonePeIcon className="size-4 text-indigo-600 sm:size-5 dark:text-indigo-400" />
      </div>
    );
  }
  if (nameLower.includes("google")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <GoogleIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }

  // SOCIAL MEDIA PLATFORMS
  if (nameLower.includes("youtube")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:size-10 dark:bg-red-900/40">
        <YouTubeIcon className="size-4 text-red-600 sm:size-5 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("instagram")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-purple-100 via-pink-100 to-orange-100 sm:size-10 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-orange-900/40">
        <InstagramIcon className="size-4 text-pink-600 sm:size-5 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("twitter") || nameLower.includes(" x ")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 sm:size-10 dark:bg-zinc-800">
        <TwitterIcon className="size-4 text-zinc-900 sm:size-5 dark:text-white" />
      </div>
    );
  }
  if (nameLower.includes("facebook")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:size-10 dark:bg-blue-900/40">
        <FacebookIcon className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("tiktok")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 sm:size-10 dark:bg-zinc-800">
        <TikTokIcon className="size-4 text-zinc-900 sm:size-5 dark:text-white" />
      </div>
    );
  }
  if (nameLower.includes("linkedin")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 sm:size-10 dark:bg-sky-900/40">
        <LinkedInIcon className="size-4 text-sky-600 sm:size-5 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("pinterest")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 sm:size-10 dark:bg-red-900/40">
        <PinterestIcon className="size-4 text-red-600 sm:size-5 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("snapchat")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yellow-100 sm:size-10 dark:bg-yellow-900/40">
        <SnapchatIcon className="size-4 text-yellow-600 sm:size-5 dark:text-yellow-500" />
      </div>
    );
  }
  if (nameLower.includes("whatsapp")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:size-10 dark:bg-green-900/40">
        <WhatsAppIcon className="size-4 text-green-600 sm:size-5 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("telegram")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 sm:size-10 dark:bg-sky-900/40">
        <TelegramIcon className="size-4 text-sky-600 sm:size-5 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("threads")) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 sm:size-10 dark:bg-zinc-800">
        <ThreadsIcon className="size-4 text-zinc-900 sm:size-5 dark:text-white" />
      </div>
    );
  }

  // GENERIC TASK TYPES - Check AFTER platform checks
  if (nameLower.includes("review") || categoryLower === "review") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 sm:size-10 dark:bg-amber-900/40">
        <StarIcon className="size-4 text-amber-600 sm:size-5 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("video") || categoryLower === "video") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 sm:size-10 dark:bg-rose-900/40">
        <VideoCameraIcon className="size-4 text-rose-600 sm:size-5 dark:text-rose-400" />
      </div>
    );
  }
  if (nameLower.includes("photo") || categoryLower === "photo") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 sm:size-10 dark:bg-sky-900/40">
        <PhotoIcon className="size-4 text-sky-600 sm:size-5 dark:text-sky-400" />
      </div>
    );
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 sm:size-10 dark:bg-zinc-800">
      <ClipboardDocumentListIcon className="size-4 text-zinc-500 sm:size-5 dark:text-zinc-400" />
    </div>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface EnrollmentTask {
  enrollmentTaskId: string;
  taskName: string;
  taskDescription?: string;
  category: string;
  requireLink: boolean;
  requireScreenshot: boolean;
  isRequired: boolean;
  instructions?: string;
  proofLink?: string;
  proofScreenshot?: string;
  submissionId?: string;
  submittedAt?: string;
  feedback?: string;
}

interface TaskDraft {
  proofLink: string;
  proofScreenshot?: string;
}

// ============================================================================
// TASKS WIZARD MODAL
// ============================================================================

function TasksWizardModal({
  open,
  onClose,
  tasks,
  enrollmentId,
  enrollmentStatus,
  onSubmitSuccess,
}: {
  open: boolean;
  onClose: () => void;
  tasks: EnrollmentTask[];
  enrollmentId: string;
  enrollmentStatus: EnrollmentStatusType;
  onSubmitSuccess: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, TaskDraft>>({});
  const [uploadingTasks, setUploadingTasks] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const { submitTasks, isPending: submitting } = useSubmitTasks();

  const totalSteps = tasks.length + 1;
  const isReviewStep = currentStep === tasks.length;
  const currentTask = !isReviewStep ? tasks[currentStep] : null;

  useEffect(() => {
    if (open) {
      const initialDrafts: Record<string, TaskDraft> = {};
      for (const task of tasks) {
        initialDrafts[task.enrollmentTaskId] = {
          proofLink: task.proofLink || "",
          proofScreenshot: task.proofScreenshot || undefined,
        };
      }
      setDrafts(initialDrafts);
      setCurrentStep(0);
      setShowSuccess(false);
    }
  }, [open, tasks]);

  const updateDraft = useCallback((taskId: string, updates: Partial<TaskDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates },
    }));
  }, []);

  const setTaskUploading = useCallback((taskId: string, uploading: boolean) => {
    setUploadingTasks((prev) => {
      const next = new Set(prev);
      if (uploading) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }, []);

  const isTaskComplete = useCallback(
    (task: EnrollmentTask) => {
      const draft = drafts[task.enrollmentTaskId];
      if (!draft) return false;
      const linkOk = !task.requireLink || !!draft.proofLink;
      const screenshotOk = !task.requireScreenshot || !!draft.proofScreenshot;
      return linkOk && screenshotOk;
    },
    [drafts]
  );

  const allRequiredComplete = useMemo(() => {
    return tasks.filter((t) => t.isRequired).every((t) => isTaskComplete(t));
  }, [tasks, isTaskComplete]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => isTaskComplete(t)).length;
  }, [tasks, isTaskComplete]);

  const anyUploading = uploadingTasks.size > 0;

  const canProceed = useMemo(() => {
    if (!currentTask) return true;
    if (!currentTask.isRequired) return true;
    return isTaskComplete(currentTask);
  }, [currentTask, isTaskComplete]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmitAll = async () => {
    try {
      const submissions = tasks
        .filter((task) => {
          const draft = drafts[task.enrollmentTaskId];
          return draft && (draft.proofLink || draft.proofScreenshot);
        })
        .map((task) => ({
          enrollmentTaskId: task.enrollmentTaskId,
          proofLink: drafts[task.enrollmentTaskId]?.proofLink || undefined,
          proofScreenshot: drafts[task.enrollmentTaskId]?.proofScreenshot || undefined,
        }));

      if (submissions.length === 0) {
        showError("No tasks to submit", "Please complete at least one task");
        return;
      }

      await submitTasks({ enrollmentId, submissions });
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit tasks";
      showError("Submission failed", message);
    }
  };

  const handleClose = () => {
    if (showSuccess) onSubmitSuccess();
    onClose();
  };

  const canEdit = enrollmentStatus === "awaiting_submission" || enrollmentStatus === "changes_requested";

  // Success State
  if (showSuccess) {
    return (
      <Dialog open={open} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center px-2 py-8 text-center xs:py-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 xs:size-20 dark:bg-emerald-900/40">
            <CheckCircleIcon className="size-8 text-emerald-600 xs:size-10 dark:text-emerald-400" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-zinc-900 xs:text-xl dark:text-white">
            Submitted!
          </h3>
          <p className="mt-2 text-sm text-zinc-500 xs:text-base dark:text-zinc-400">
            Your tasks are now under review.
          </p>
        </div>
        <DialogActions>
          <Button color="emerald" onClick={handleClose} className="w-full">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <XMarkIcon className="size-5" />
      </button>

      {/* Header - Modern minimal step indicator */}
      <div className="mb-4">
        {/* Top row: Task title + close button handles its own space */}
        <div className="flex items-center gap-3 pr-10">
          {isReviewStep ? (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : (
            <TaskIcon name={currentTask?.taskName} category={currentTask?.category} />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-zinc-900 dark:text-white">
              {isReviewStep ? "Review & Submit" : currentTask?.taskName}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress bar - based on tasks completed, not steps */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
            {completedCount}/{tasks.length}
          </span>
        </div>
      </div>

      <DialogBody className="mt-0!">
        {/* Task Content */}
        {currentTask && (
          <div className="space-y-3 xs:space-y-4">
            {/* Instructions Box - Combines description + instructions + badge */}
            <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
              {/* Header with badge */}
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-zinc-800 xs:text-sm dark:text-zinc-200">
                  What to do
                </h4>
                {currentTask.isRequired ? (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                    Required
                  </span>
                ) : (
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                    Optional
                  </span>
                )}
              </div>
              {/* Content - show instructions if available, otherwise description */}
              <p className="mt-1.5 whitespace-pre-line text-xs text-zinc-600 xs:text-sm dark:text-zinc-400">
                {currentTask.instructions || currentTask.taskDescription || "Complete this task and upload your proof."}
              </p>
            </div>

            {/* Changes Requested Feedback */}
            {currentTask.feedback && enrollmentStatus === "changes_requested" && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 xs:p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 xs:text-sm dark:text-amber-300">
                    Changes Requested
                  </p>
                  <p className="mt-1 text-xs text-amber-700 xs:text-sm dark:text-amber-400">
                    {currentTask.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              {currentTask.requireLink && (
                <Field>
                  <Label className="text-sm font-medium">Proof Link</Label>
                  <div className="mt-2">
                    <Input
                      type="url"
                      value={drafts[currentTask.enrollmentTaskId]?.proofLink || ""}
                      onChange={(e) =>
                        updateDraft(currentTask.enrollmentTaskId, { proofLink: e.target.value })
                      }
                      placeholder="https://instagram.com/p/..."
                      disabled={!canEdit}
                    />
                  </div>
                </Field>
              )}

              {currentTask.requireScreenshot && (
                <ImageDropzone
                  value={drafts[currentTask.enrollmentTaskId]?.proofScreenshot}
                  onChange={(url) =>
                    updateDraft(currentTask.enrollmentTaskId, { proofScreenshot: url })
                  }
                  onUploading={(uploading) =>
                    setTaskUploading(currentTask.enrollmentTaskId, uploading)
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* Review Step */}
        {isReviewStep && (
          <div className="space-y-3">
            {/* Summary Header - changes based on completion */}
            {completedCount === tasks.length ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Ready to Submit
                  </h4>
                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                    All {tasks.length} tasks completed
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircleIcon className="size-5" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {tasks.length - completedCount} task{tasks.length - completedCount > 1 ? 's' : ''} remaining
                  </h4>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {completedCount} of {tasks.length} completed
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-500 text-white">
                  <ExclamationTriangleIcon className="size-5" />
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {tasks.map((task, index) => {
                const draft = drafts[task.enrollmentTaskId];
                const isComplete = isTaskComplete(task);

                return (
                  <button
                    key={task.enrollmentTaskId}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left xs:p-4 ${
                      isComplete
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                    }`}
                  >
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full xs:size-8 ${
                        isComplete
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {isComplete ? <CheckIcon className="size-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {task.taskName}
                      </p>
                      {isComplete && draft?.proofLink && (
                        <p className="mt-0.5 truncate text-xs text-emerald-600 dark:text-emerald-400">
                          {draft.proofLink}
                        </p>
                      )}
                      {isComplete && draft?.proofScreenshot && !draft?.proofLink && (
                        <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                          Screenshot uploaded
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-zinc-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogBody>

      {/* Footer Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-5 xs:pt-6 dark:border-zinc-700">
        {currentStep === 0 ? (
          <Button color="zinc" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <Button color="zinc" onClick={handleBack}>
            <ChevronLeftIcon className="size-4" />
            Back
          </Button>
        )}

        {isReviewStep ? (
          <Button
            color="emerald"
            onClick={handleSubmitAll}
            disabled={!allRequiredComplete || submitting || anyUploading || !canEdit}
          >
            {submitting ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="size-4" />
                Submit
              </>
            )}
          </Button>
        ) : !currentTask?.isRequired && !isTaskComplete(currentTask!) ? (
          // Skip button - lighter appearance for optional tasks
          <Button
            outline
            onClick={handleNext}
            disabled={anyUploading}
          >
            Skip for now
            <ChevronRightIcon className="size-4" />
          </Button>
        ) : (
          // Next button - prominent for required tasks
          <Button
            color="dark/zinc"
            onClick={handleNext}
            disabled={anyUploading || !canProceed}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        )}
      </div>
    </Dialog>
  );
}

// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================

function ActivityTimeline({
  history,
}: {
  history: {
    id: string;
    fromStatus?: string;
    toStatus: string;
    changedByName?: string;
    reason?: string;
    changedAt: string;
  }[];
}) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {history.slice(0, 5).map((entry) => {
        const statusConfig = getStatusConfig(entry.toStatus as EnrollmentStatusType);

        return (
          <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
            <div
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                  : statusConfig.color === "amber"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    : statusConfig.color === "red"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                      : statusConfig.color === "sky"
                        ? "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <statusConfig.icon className="size-3" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {entry.toStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              {entry.reason && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{entry.reason}</p>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-zinc-400">
              {formatRelativeTime(entry.changedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// ORDER SCREENSHOT INLINE (for combined card)
// ============================================================================

function OrderScreenshotInline({ screenshotUrl }: { screenshotUrl: string }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const resolvedUrl = getAssetUrl(screenshotUrl);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowFullImage(true)}
        className="group relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <img
          src={resolvedUrl}
          alt="Order screenshot"
          className="h-40 w-full object-contain p-2 sm:h-48 lg:h-56"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/0 opacity-0 transition-all group-hover:bg-zinc-900/50 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-900">
            <PhotoIcon className="size-4" />
            View full
          </div>
        </div>
      </button>

      <Dialog open={showFullImage} onClose={() => setShowFullImage(false)} size="2xl">
        <DialogTitle>Order Screenshot</DialogTitle>
        <DialogBody>
          <img src={resolvedUrl} alt="Order screenshot" className="w-full rounded-lg" />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowFullImage(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// EARNINGS CARD
// ============================================================================

function EarningsCard({
  status,
  estimatedPayout,
  orderValue,
  rebatePercentage,
  bonusAmount,
  tasksComplete,
  tasksTotal,
  className,
}: {
  status: string;
  estimatedPayout: string | number;
  orderValue: string;
  rebatePercentage: number;
  bonusAmount?: string | null;
  tasksComplete: number;
  tasksTotal: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl bg-zinc-900 shadow-sm dark:bg-zinc-800 ${className || ""}`}>
      <div className="p-4 lg:p-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 lg:text-xs">
          {status === "approved" ? "Cashback Earned" : "Estimated Cashback"}
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-400 sm:text-3xl lg:text-4xl">
          {formatCurrency(estimatedPayout)}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-zinc-500">Order Value</span>
          <span className="font-medium text-zinc-300">{formatCurrency(orderValue)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-zinc-500">Cashback Rate</span>
          <span className="font-medium text-emerald-400">{rebatePercentage}%</span>
        </div>
        {bonusAmount && Number(bonusAmount) > 0 && (
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Bonus</span>
            <span className="font-medium text-emerald-400">
              +{formatCurrency(bonusAmount)}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {tasksTotal > 0 && (
          <div className="mt-4 border-t border-zinc-800 pt-4 dark:border-zinc-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Tasks completed</span>
              <span className="font-medium text-zinc-400">{tasksComplete}/{tasksTotal}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${
                  tasksComplete === tasksTotal ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${tasksTotal > 0 ? (tasksComplete / tasksTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnrollmentShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: enrollment, loading, error, refetch } = useEnrollmentDetail(id || "");
  const { data: pricing } = useEnrollmentPricing(id || "");

  const { withdrawEnrollment, isPending: withdrawing } = useWithdrawEnrollment();
  const { resubmitEnrollment, isPending: resubmitting } = useResubmitEnrollment();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);

  const statusConfig = useMemo(() => {
    if (!enrollment) return null;
    return getStatusConfig(enrollment.status);
  }, [enrollment?.status]);

  const estimatedPayout = useMemo(() => {
    if (!enrollment) return 0;
    if (pricing?.formatted?.shopperPayout) return pricing.formatted.shopperPayout;
    const baseAmount = (parseFloat(enrollment.orderValueDecimal) * enrollment.lockedRebatePercentage) / 100;
    const bonus = enrollment.lockedBonusAmountDecimal ? parseFloat(enrollment.lockedBonusAmountDecimal) : 0;
    return baseAmount + bonus;
  }, [enrollment, pricing]);

  const handleWithdraw = async () => {
    if (!enrollment) return;
    try {
      await withdrawEnrollment(enrollment.id);
      setShowWithdrawDialog(false);
      showSuccess("Enrollment withdrawn", "You have withdrawn from this campaign");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to withdraw";
      showError("Withdrawal failed", message);
    }
  };

  const handleResubmit = async () => {
    if (!enrollment) return;
    try {
      await resubmitEnrollment(enrollment.id);
      setShowResubmitDialog(false);
      showSuccess("Resubmitted", "Your enrollment will be reviewed again");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resubmit";
      showError("Resubmission failed", message);
    }
  };

  const handleTaskSubmitSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) return <EnrollmentShowSkeleton />;

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
          <ShoppingBagIcon className="size-8 text-red-400" />
        </div>
        <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Enrollment not found
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The enrollment you're looking for doesn't exist.
        </p>
        <Button className="mt-6" onClick={() => navigate("/enrollments")} color="dark/zinc">
          <ArrowLeftIcon className="size-4" />
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const tasksComplete = enrollment.tasks?.filter((t) => t.proofLink || t.proofScreenshot).length || 0;
  const tasksTotal = enrollment.tasks?.length || 0;
  const productImage = enrollment.campaign?.productImage;
  const productName = enrollment.campaign?.productName || enrollment.campaign?.title;
  const canEdit = enrollment.status === "awaiting_submission" || enrollment.status === "changes_requested";

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* TWO COLUMN LAYOUT */}
      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
          {/* HERO CARD */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {/* Main Content */}
            <div className="p-4 lg:p-5">
              {/* Top Row: Badge + Days Left (mobile) */}
              <div className="flex items-center justify-between">
                <Badge color={statusConfig?.color || "zinc"}>
                  {statusConfig?.icon && <statusConfig.icon className="mr-1 size-3" />}
                  {statusConfig?.label}
                </Badge>
                {/* Days Left - Mobile only compact badge */}
                <DaysLeftGauge expiresAt={enrollment.expiresAt} status={enrollment.status} compact className="sm:hidden" />
              </div>

              {/* Product Info Row */}
              <div className="mt-3 flex gap-3 sm:gap-4">
                {/* Product Image */}
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:size-20 lg:size-24 dark:bg-zinc-800">
                  {productImage ? (
                    <img src={productImage} alt={productName || "Product"} className="size-full object-contain p-1" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <CubeIcon className="size-6 text-zinc-300 sm:size-8 dark:text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/campaigns/${enrollment.campaignId}`}
                    className="flex items-start gap-1 text-sm font-semibold text-zinc-900 hover:text-zinc-600 sm:text-base lg:text-lg dark:text-white dark:hover:text-zinc-300"
                  >
                    <span className="line-clamp-2">{enrollment.campaign.title}</span>
                    <ArrowTopRightOnSquareIcon className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
                  </Link>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <HashtagIcon className="size-3" />
                      {enrollment.orderId}
                    </span>
                    {enrollment.purchaseDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="size-3" />
                        {formatDate(enrollment.purchaseDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Days Left Gauge - Desktop/Tablet */}
                <DaysLeftGauge expiresAt={enrollment.expiresAt} status={enrollment.status} className="hidden sm:flex" />
              </div>
            </div>

            {/* Alert Banners */}
            {enrollment.status === "changes_requested" && enrollment.rejection && (
              <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 lg:px-5 dark:border-amber-900/50 dark:bg-amber-950/30">
                <ExclamationTriangleIcon className="size-4 shrink-0 text-amber-600 lg:size-5 dark:text-amber-400" />
                <p className="text-xs text-amber-700 lg:text-sm dark:text-amber-300">
                  <span className="font-medium">Changes requested: </span>
                  {enrollment.rejection.reason}
                </p>
              </div>
            )}

            {enrollment.status === "permanently_rejected" && enrollment.rejection && (
              <div className="flex items-start gap-2 border-t border-red-200 bg-red-50 px-4 py-3 lg:px-5 dark:border-red-900/50 dark:bg-red-950/30">
                <XCircleIcon className="size-4 shrink-0 text-red-600 lg:size-5 dark:text-red-400" />
                <p className="text-xs text-red-700 lg:text-sm dark:text-red-300">
                  <span className="font-medium">Rejected: </span>
                  {enrollment.rejection.reason}
                </p>
              </div>
            )}
          </div>

          {/* PROGRESS STEPPER */}
          <ProgressStepper status={enrollment.status} />

          {/* EARNINGS CARD - Mobile only (3rd position) */}
          <EarningsCard
            status={enrollment.status}
            estimatedPayout={estimatedPayout}
            orderValue={enrollment.orderValueDecimal}
            rebatePercentage={enrollment.lockedRebatePercentage}
            bonusAmount={enrollment.lockedBonusAmountDecimal}
            tasksComplete={tasksComplete}
            tasksTotal={tasksTotal}
            className="lg:hidden"
          />

          {/* TASKS CARD */}
          {enrollment.tasks && enrollment.tasks.length > 0 && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="size-4 text-rose-500 lg:size-5" />
                  <span className="text-sm font-medium text-zinc-900 lg:text-base dark:text-white">
                    Deliverables
                  </span>
                </div>
                <span className="text-xs text-zinc-400 lg:text-sm">
                  {tasksComplete}/{tasksTotal}
                </span>
              </div>

              {/* Task List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {enrollment.tasks.map((task, index) => {
                  const isSubmitted = !!(task.proofLink || task.proofScreenshot);
                  const hasFeedback = !!task.feedback && enrollment.status === "changes_requested";

                  return (
                    <div key={task.enrollmentTaskId} className="flex items-center gap-3 px-4 py-3 lg:px-5">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSubmitted
                            ? "bg-emerald-500 text-white"
                            : hasFeedback
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {isSubmitted ? <CheckIcon className="size-3.5" /> : index + 1}
                      </div>

                      <TaskIcon name={task.taskName} category={task.category} />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {task.taskName}
                        </p>
                        {isSubmitted && task.submittedAt ? (
                          <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                            Submitted {formatRelativeTime(task.submittedAt)}
                          </p>
                        ) : hasFeedback ? (
                          <p className="mt-0.5 truncate text-[11px] text-amber-600 dark:text-amber-400">
                            {task.feedback}
                          </p>
                        ) : task.taskDescription ? (
                          <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {task.taskDescription}
                          </p>
                        ) : null}
                      </div>

                      {task.isRequired && !isSubmitted && (
                        <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-600 dark:bg-red-900/40 dark:text-red-400">
                          Required
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="border-t border-zinc-100 p-4 lg:px-5 dark:border-zinc-700">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Primary CTA */}
                    <Button
                      color={tasksComplete === tasksTotal ? "emerald" : "dark/zinc"}
                      onClick={() => setShowTasksModal(true)}
                    >
                      {tasksComplete === tasksTotal ? (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Submit
                        </>
                      ) : (
                        <>
                          <CameraIcon className="size-4" />
                          Tasks
                        </>
                      )}
                    </Button>

                    {/* Withdraw */}
                    {enrollment.status === "awaiting_submission" && (
                      <Button
                        color="rose"
                        onClick={() => setShowWithdrawDialog(true)}
                      >
                        <XCircleIcon className="size-4" />
                        Withdraw
                      </Button>
                    )}

                    {/* Resubmit */}
                    {enrollment.status === "changes_requested" && enrollment.canResubmit && (
                      <Button
                        color="emerald"
                        onClick={() => setShowResubmitDialog(true)}
                      >
                        <ArrowPathIcon className="size-4" />
                        Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Status Footer */}
              {!canEdit && (
                <div className="border-t border-zinc-100 p-4 lg:px-5 dark:border-zinc-700">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-50 py-2.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {enrollment.status === "awaiting_review" ? (
                      <>
                        <ClockIcon className="size-4" />
                        Under Review
                      </>
                    ) : enrollment.status === "approved" ? (
                      <>
                        <CheckCircleIcon className="size-4 text-emerald-500" />
                        All Tasks Approved
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="size-4" />
                        Submissions Closed
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDER INFO - Combined Details + Screenshot */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 lg:px-5 dark:border-zinc-700">
              <ShoppingBagIcon className="size-4 text-sky-500 lg:size-5" />
              <span className="text-sm font-medium text-zinc-900 lg:text-base dark:text-white">Order Information</span>
            </div>
            <div className="p-4 lg:p-5">
              {/* Order Details - Grid layout */}
              <div className="space-y-3.5">
                {/* Order ID with copy */}
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">Order ID</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(enrollment.orderId);
                      showSuccess("Copied!", "Order ID copied to clipboard");
                    }}
                    className="group flex items-center gap-1.5 text-right"
                  >
                    <span className="break-all font-mono text-sm font-medium text-zinc-900 dark:text-white">
                      {enrollment.orderId}
                    </span>
                    <DocumentDuplicateIcon className="size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
                  </button>
                </div>

                {/* Order Value */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Order Value</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatCurrency(enrollment.orderValueDecimal)}
                  </span>
                </div>

                {/* Purchase Date */}
                {enrollment.purchaseDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Purchase Date</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {formatDate(enrollment.purchaseDate)}
                    </span>
                  </div>
                )}

                {/* Deadline */}
                {enrollment.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Deadline</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {formatDate(enrollment.expiresAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Screenshot - Full width on mobile, better size */}
              {enrollment.ocrData?.screenshotUrl && (
                <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <OrderScreenshotInline screenshotUrl={enrollment.ocrData.screenshotUrl} />
                </div>
              )}
            </div>
          </div>

          {/* MOBILE ONLY SECTIONS */}
          {/* Activity - Mobile */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 lg:hidden dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <ClockIcon className="size-4 text-violet-500" />
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Activity</span>
              </div>
              <ActivityTimeline history={enrollment.history} />
            </div>
          )}

          {/* Help Card - Mobile */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 lg:hidden dark:bg-zinc-800/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
              <ChatBubbleLeftRightIcon className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Need help?</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Contact support for questions about your enrollment.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar (hidden on mobile, shown on desktop) */}
        <div className="hidden flex-col gap-4 lg:flex">
          {/* Earnings Card */}
          <EarningsCard
            status={enrollment.status}
            estimatedPayout={estimatedPayout}
            orderValue={enrollment.orderValueDecimal}
            rebatePercentage={enrollment.lockedRebatePercentage}
            bonusAmount={enrollment.lockedBonusAmountDecimal}
            tasksComplete={tasksComplete}
            tasksTotal={tasksTotal}
          />

          {/* Activity */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <ClockIcon className="size-4 text-violet-500" />
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Activity</span>
              </div>
              <ActivityTimeline history={enrollment.history} />
            </div>
          )}

          {/* Help Card */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
              <ChatBubbleLeftRightIcon className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Need help?</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Contact support for questions about your enrollment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={showWithdrawDialog} onClose={() => setShowWithdrawDialog(false)} size="sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-7 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4">Withdraw Enrollment?</DialogTitle>
          <DialogDescription className="mt-2">
            This action cannot be undone and you will lose any potential earnings.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
          <Button color="red" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showResubmitDialog} onClose={() => setShowResubmitDialog(false)} size="sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <ArrowPathIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="mt-4">Resubmit for Review?</DialogTitle>
          <DialogDescription className="mt-2">
            Make sure you've addressed all the requested changes.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowResubmitDialog(false)}>Cancel</Button>
          <Button color="emerald" onClick={handleResubmit} disabled={resubmitting}>
            <CheckCircleIcon className="size-4" />
            {resubmitting ? "Submitting..." : "Resubmit"}
          </Button>
        </DialogActions>
      </Dialog>

      {enrollment.tasks && enrollment.tasks.length > 0 && (
        <TasksWizardModal
          open={showTasksModal}
          onClose={() => setShowTasksModal(false)}
          tasks={enrollment.tasks}
          enrollmentId={enrollment.id}
          enrollmentStatus={enrollment.status}
          onSubmitSuccess={handleTaskSubmitSuccess}
        />
      )}
    </div>
  );
}
