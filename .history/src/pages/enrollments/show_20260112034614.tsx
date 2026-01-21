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
import { Heading, Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { useEnrollmentDetail, useEnrollmentPricing } from "@/hooks/use-api";
import type { shared } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { getStatusColors, type EnrollmentStatus } from "@/lib/theme";
import {
  SkeletonWrapper,
  BoxSkeleton,
  TextSkeleton,
  CircleSkeleton,
} from "@/lib/skeleton";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

type EnrollmentStatusType = shared.EnrollmentStatus;

// ============================================================================
// LOADING SKELETON
// ============================================================================

function EnrollmentShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-5">
        {/* Hero Section Skeleton */}
        <div className="grid items-stretch gap-5 lg:grid-cols-5">
          {/* Product Image */}
          <div className="lg:col-span-2">
            <BoxSkeleton height={280} borderRadius={12} />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* Badges */}
            <div className="flex gap-2">
              <BoxSkeleton width={80} height={24} borderRadius={9999} />
              <BoxSkeleton width={70} height={24} borderRadius={9999} />
            </div>

            {/* Title */}
            <TextSkeleton width="80%" height={28} />
            <TextSkeleton width="60%" height={16} />

            {/* Earnings Card */}
            <BoxSkeleton height={120} borderRadius={12} />

            {/* Progress Steps */}
            <BoxSkeleton height={100} borderRadius={12} />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-5 lg:col-span-2">
            <BoxSkeleton height={200} borderRadius={12} />
            <BoxSkeleton height={300} borderRadius={12} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <BoxSkeleton height={180} borderRadius={12} />
            <BoxSkeleton height={150} borderRadius={12} />
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

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
      icon: DocumentTextIcon,
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError(null);
      setUploading(true);
      onUploading?.(true);

      try {
        const client = getAuthenticatedClient();
        const { uploadUrl, fileUrl } = await client.storage.requestUploadUrl({
          filename: file.name,
          contentType: file.type,
          folder: "uploads",
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        onChange(fileUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        onUploading?.(false);
      }
    },
    [onChange, onUploading]
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

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        <img
          src={value}
          alt="Screenshot preview"
          className="max-h-48 w-full object-contain"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
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
            : "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50"
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
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Uploading...
            </p>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-700">
              <ArrowUpTrayIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Drop image here or click to upload
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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

function EnrollmentProgressStepper({
  status,
  className,
}: {
  status: EnrollmentStatusType;
  className?: string;
}) {
  const steps = [
    {
      key: "enrolled",
      icon: ShoppingCartIcon,
      title: "Enrolled",
      description: "Joined campaign",
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    },
    {
      key: "submitted",
      icon: CameraIcon,
      title: "Submit",
      description: "Upload proof",
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    },
    {
      key: "review",
      icon: DocumentCheckIcon,
      title: "Review",
      description: "Under review",
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    },
    {
      key: "approved",
      icon: BanknotesIcon,
      title: "Paid",
      description: "Cashback credited",
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
  ];

  // Determine current step
  let currentStepIndex = 0;
  if (status === "awaiting_submission" || status === "changes_requested") {
    currentStepIndex = 1;
  } else if (status === "awaiting_review") {
    currentStepIndex = 2;
  } else if (status === "approved") {
    currentStepIndex = 4; // All complete
  } else if (
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired"
  ) {
    currentStepIndex = -1; // Failed state
  }

  const isRejected =
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired";

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 ${className || ""}`}
    >
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <SparklesIcon className="size-4 text-violet-500 dark:text-violet-400" />
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Progress
        </p>
      </div>
      <div className="flex flex-1 items-center p-4">
        <div className="relative grid w-full grid-cols-4">
          {/* Connector line between icons */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-4 h-0.5 bg-zinc-200 dark:bg-zinc-700" />
          {/* Progress line */}
          {currentStepIndex > 0 && !isRejected && (
            <div
              className="pointer-events-none absolute left-[12.5%] top-4 h-0.5 bg-emerald-500 transition-all"
              style={{
                width: `${Math.min(100, ((currentStepIndex - 1) / 3) * 75)}%`,
              }}
            />
          )}

          {steps.map((step, index) => {
            const isComplete = currentStepIndex > index;
            const isCurrent = currentStepIndex === index + 1;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`relative z-10 flex size-8 items-center justify-center rounded-full transition-all ${
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-zinc-800 text-white ring-2 ring-zinc-800/20 dark:bg-white dark:text-zinc-900 dark:ring-white/20"
                        : isRejected && index >= 1
                          ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                          : step.color
                  }`}
                >
                  {isComplete ? (
                    <CheckCircleIcon className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DEADLINE GAUGE
// ============================================================================

function DeadlineGauge({
  expiresAt,
  status,
}: {
  expiresAt?: string;
  status: EnrollmentStatusType;
}) {
  const { daysRemaining, percentage, isUrgent, isExpired } = useMemo(() => {
    if (!expiresAt)
      return { daysRemaining: null, percentage: 0, isUrgent: false, isExpired: false };

    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
      return { daysRemaining: 0, percentage: 100, isUrgent: true, isExpired: true };
    }

    // Assume 14 day default period
    const totalDays = 14;
    const elapsed = totalDays - diff;
    const pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

    return {
      daysRemaining: diff,
      percentage: pct,
      isUrgent: diff <= 3,
      isExpired: false,
    };
  }, [expiresAt]);

  if (!expiresAt || status === "approved" || status === "permanently_rejected") {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ClockIcon
            className={`size-4 ${isUrgent ? "text-red-500" : "text-amber-500"}`}
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Deadline
          </span>
        </div>
        <span
          className={`text-xs font-medium ${
            isUrgent
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-900 dark:text-white"
          }`}
        >
          {isExpired
            ? "Expired"
            : daysRemaining === 0
              ? "Today!"
              : daysRemaining === 1
                ? "1 day left"
                : `${daysRemaining} days left`}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${
            isUrgent ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-zinc-400">
        {formatDate(expiresAt)}
      </p>
    </div>
  );
}

// ============================================================================
// DELIVERABLE CARD - REDESIGNED
// ============================================================================

interface DeliverableSubmission {
  campaignDeliverableId: string;
  proofLink?: string;
  proofScreenshot?: string;
}

function DeliverableCard({
  deliverable,
  enrollmentId,
  enrollmentStatus,
  onSubmit,
  onUpdate,
  onDelete,
  index,
}: {
  deliverable: {
    id: string;
    campaignDeliverableId: string;
    deliverableName: string;
    deliverableDescription?: string;
    isRequired: boolean;
    requireLink: boolean;
    requireScreenshot: boolean;
    instructions?: string;
    proofLink?: string;
    proofScreenshot?: string;
    submittedAt?: string;
  };
  enrollmentId: string;
  enrollmentStatus: EnrollmentStatusType;
  onSubmit: (submission: DeliverableSubmission) => void;
  onUpdate: (
    enrollmentId: string,
    deliverableId: string,
    data: { proofLink?: string; proofScreenshot?: string }
  ) => Promise<void>;
  onDelete: (enrollmentId: string, deliverableId: string) => Promise<void>;
  index: number;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [proofLink, setProofLink] = useState(deliverable.proofLink || "");
  const [proofScreenshot, setProofScreenshot] = useState<string | undefined>(
    deliverable.proofScreenshot || undefined
  );
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const isSubmitted = !!(deliverable.proofLink || deliverable.proofScreenshot);
  const canSubmit =
    enrollmentStatus === "awaiting_submission" ||
    enrollmentStatus === "changes_requested";
  const canDelete = isSubmitted && !deliverable.isRequired && canSubmit;

  // Deliverable icon based on name/type
  const DeliverableIcon = useMemo(() => {
    const name = deliverable.deliverableName.toLowerCase();
    if (name.includes("youtube") || name.includes("video")) {
      return {
        icon: CameraIcon,
        color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
      };
    }
    if (name.includes("instagram") || name.includes("story") || name.includes("reel")) {
      return {
        icon: CameraIcon,
        color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
      };
    }
    if (name.includes("review") || name.includes("rating")) {
      return {
        icon: ChatBubbleLeftRightIcon,
        color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
      };
    }
    if (name.includes("unbox")) {
      return {
        icon: CubeIcon,
        color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
      };
    }
    return {
      icon: ClipboardDocumentListIcon,
      color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    };
  }, [deliverable.deliverableName]);

  const handleSubmit = async () => {
    if (isSubmitted) {
      setUpdating(true);
      try {
        await onUpdate(enrollmentId, deliverable.id, {
          proofLink: proofLink || undefined,
          proofScreenshot: proofScreenshot || undefined,
        });
        setShowDialog(false);
      } finally {
        setUpdating(false);
      }
    } else {
      onSubmit({
        campaignDeliverableId: deliverable.campaignDeliverableId,
        proofLink: proofLink || undefined,
        proofScreenshot: proofScreenshot || undefined,
      });
      setShowDialog(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(enrollmentId, deliverable.id);
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-xl border transition-all ${
          isSubmitted
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {/* Task Number Badge */}
        <div className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-br-lg bg-zinc-100 text-[10px] font-bold text-zinc-400 dark:bg-zinc-800">
          {index + 1}
        </div>

        <div className="p-4 pl-8">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isSubmitted
                  ? "bg-emerald-100 dark:bg-emerald-900/50"
                  : DeliverableIcon.color
              }`}
            >
              {isSubmitted ? (
                <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <DeliverableIcon.icon className="size-5" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {deliverable.deliverableName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {deliverable.isRequired && (
                      <Badge color="red" className="text-[10px]">
                        Required
                      </Badge>
                    )}
                    {deliverable.requireLink && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                        <LinkIcon className="size-3" /> Link
                      </span>
                    )}
                    {deliverable.requireScreenshot && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                        <CameraIcon className="size-3" /> Screenshot
                      </span>
                    )}
                  </div>
                </div>

                {isSubmitted && (
                  <Badge color="emerald" className="shrink-0 text-[10px]">
                    Submitted
                  </Badge>
                )}
              </div>

              {/* Instructions */}
              {deliverable.instructions && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {deliverable.instructions}
                </p>
              )}

              {/* Submitted Proof */}
              {isSubmitted && (
                <div className="mt-3 space-y-2">
                  {deliverable.proofLink && (
                    <a
                      href={deliverable.proofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
                    >
                      <LinkIcon className="size-3.5 shrink-0 text-zinc-400" />
                      <span className="min-w-0 truncate">
                        {deliverable.proofLink}
                      </span>
                      <ArrowTopRightOnSquareIcon className="ml-auto size-3.5 shrink-0 text-zinc-400" />
                    </a>
                  )}
                  {deliverable.proofScreenshot && (
                    <a
                      href={deliverable.proofScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
                    >
                      <PhotoIcon className="size-3.5 shrink-0 text-zinc-400" />
                      <span>View Screenshot</span>
                      <ArrowTopRightOnSquareIcon className="ml-auto size-3.5 shrink-0 text-zinc-400" />
                    </a>
                  )}
                  {deliverable.submittedAt && (
                    <p className="text-[10px] text-zinc-400">
                      Submitted {formatRelativeTime(deliverable.submittedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              {canSubmit && (
                <div className="mt-3 flex gap-2">
                  <Button
                    outline={isSubmitted}
                    color={isSubmitted ? "zinc" : "dark/zinc"}
                    className="text-xs"
                    onClick={() => setShowDialog(true)}
                  >
                    {isSubmitted ? (
                      <>
                        <ArrowPathIcon className="size-3.5" />
                        Update
                      </>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="size-3.5" />
                        Submit Proof
                      </>
                    )}
                  </Button>
                  {canDelete && (
                    <Button
                      outline
                      className="text-xs text-red-600 dark:text-red-400"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <XCircleIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit/Update Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} size="md">
        <DialogTitle>{deliverable.deliverableName}</DialogTitle>
        <DialogDescription>
          {deliverable.instructions ||
            "Provide proof of completion for this deliverable."}
        </DialogDescription>
        <DialogBody>
          <div className="space-y-4">
            {deliverable.requireLink && (
              <Field>
                <Label>Proof Link</Label>
                <div className="mt-2">
                  <Input
                    type="url"
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Paste the link to your completed deliverable
                </p>
              </Field>
            )}
            {deliverable.requireScreenshot && (
              <Field>
                <Label>Screenshot</Label>
                <div className="mt-2">
                  <ImageDropzone
                    value={proofScreenshot}
                    onChange={setProofScreenshot}
                    onUploading={setUploadingScreenshot}
                  />
                </div>
              </Field>
            )}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            color="dark/zinc"
            onClick={handleSubmit}
            disabled={
              updating ||
              uploadingScreenshot ||
              (deliverable.requireLink && !proofLink) ||
              (deliverable.requireScreenshot && !proofScreenshot)
            }
          >
            <CheckCircleIcon className="size-4" />
            {updating ? "Saving..." : isSubmitted ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4">Delete Submission?</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure? You can submit it again later.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
    <div className="space-y-0">
      {history.map((entry, index) => {
        const statusConfig = getStatusConfig(entry.toStatus as EnrollmentStatusType);
        const StatusIcon = statusConfig.icon;
        const isLast = index === history.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-3">
            {/* Vertical Line */}
            {!isLast && (
              <div className="absolute left-[11px] top-7 h-[calc(100%-4px)] w-0.5 bg-zinc-200 dark:bg-zinc-700" />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-100 dark:bg-emerald-900/50"
                  : statusConfig.color === "amber"
                    ? "bg-amber-100 dark:bg-amber-900/50"
                    : statusConfig.color === "red"
                      ? "bg-red-100 dark:bg-red-900/50"
                      : statusConfig.color === "sky"
                        ? "bg-sky-100 dark:bg-sky-900/50"
                        : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              <StatusIcon
                className={`size-3 ${
                  statusConfig.color === "emerald"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : statusConfig.color === "amber"
                      ? "text-amber-600 dark:text-amber-400"
                      : statusConfig.color === "red"
                        ? "text-red-600 dark:text-red-400"
                        : statusConfig.color === "sky"
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-zinc-500 dark:text-zinc-400"
                }`}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {entry.toStatus
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <span className="text-[10px] text-zinc-400">
                  {formatRelativeTime(entry.changedAt)}
                </span>
              </div>
              {entry.reason && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.reason}
                </p>
              )}
              {entry.changedByName && (
                <p className="mt-0.5 text-[10px] text-zinc-400">
                  by {entry.changedByName}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// OCR DATA CARD
// ============================================================================

function OCRDataCard({
  ocrData,
}: {
  ocrData: {
    id: string;
    screenshotUrl: string;
    extractedOrderId?: string;
    extractedOrderValue?: number;
    extractedPurchaseDate?: string;
    extractedProductName?: string;
    extractedSellerName?: string;
    extractedPlatform?: string;
    confidence?: number;
  };
}) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <ShieldCheckIcon className="size-4 text-emerald-500" />
          <Subheading className="text-sm">Order Verification</Subheading>
          {ocrData.confidence !== undefined && (
            <Badge
              color={
                ocrData.confidence > 0.8
                  ? "emerald"
                  : ocrData.confidence > 0.5
                    ? "amber"
                    : "red"
              }
              className="ml-auto"
            >
              {Math.round(ocrData.confidence * 100)}% match
            </Badge>
          )}
        </div>
        <div className="p-4">
          {/* Screenshot Preview */}
          {ocrData.screenshotUrl && (
            <button
              type="button"
              onClick={() => setShowFullImage(true)}
              className="relative mb-4 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <img
                src={ocrData.screenshotUrl}
                alt="Order Screenshot"
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 opacity-0 transition-opacity hover:opacity-100">
                <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900">
                  View Full Image
                </span>
              </div>
            </button>
          )}

          {/* Extracted Data Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {ocrData.extractedOrderId && (
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Order ID
                </p>
                <p className="mt-0.5 font-mono text-sm font-medium text-zinc-900 dark:text-white">
                  {ocrData.extractedOrderId}
                </p>
              </div>
            )}
            {ocrData.extractedOrderValue !== undefined && (
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Order Value
                </p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">
                  {formatCurrency(ocrData.extractedOrderValue / 100)}
                </p>
              </div>
            )}
            {ocrData.extractedPlatform && (
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Platform
                </p>
                <p className="mt-0.5 text-sm font-medium capitalize text-zinc-900 dark:text-white">
                  {ocrData.extractedPlatform}
                </p>
              </div>
            )}
            {ocrData.extractedPurchaseDate && (
              <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Purchase Date
                </p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">
                  {formatDate(ocrData.extractedPurchaseDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      <Dialog open={showFullImage} onClose={() => setShowFullImage(false)} size="4xl">
        <DialogBody className="p-0">
          <img
            src={ocrData.screenshotUrl}
            alt="Order Screenshot"
            className="w-full rounded-lg"
          />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowFullImage(false)}>
            Close
          </Button>
          <Button
            color="dark/zinc"
            onClick={() => window.open(ocrData.screenshotUrl, "_blank")}
          >
            <ArrowTopRightOnSquareIcon className="size-4" />
            Open Original
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnrollmentShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: enrollment,
    loading,
    error,
    refetch,
  } = useEnrollmentDetail(id || "");
  const { data: pricing } = useEnrollmentPricing(id || "");

  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<
    Map<string, DeliverableSubmission>
  >(new Map());

  const statusConfig = useMemo(() => {
    if (!enrollment) return null;
    return getStatusConfig(enrollment.status);
  }, [enrollment?.status]);

  const estimatedPayout = useMemo(() => {
    if (!enrollment) return 0;
    if (pricing?.formatted?.shopperPayout) {
      return pricing.formatted.shopperPayout;
    }
    const baseAmount =
      (parseFloat(enrollment.orderValueDecimal) *
        enrollment.lockedRebatePercentage) /
      100;
    const bonus = enrollment.lockedBonusAmountDecimal
      ? parseFloat(enrollment.lockedBonusAmountDecimal)
      : 0;
    return baseAmount + bonus;
  }, [enrollment, pricing]);

  const canSubmit =
    enrollment?.status === "awaiting_submission" ||
    enrollment?.status === "changes_requested";

  const handleDeliverableSubmit = (submission: DeliverableSubmission) => {
    setPendingSubmissions((prev) => {
      const newMap = new Map(prev);
      newMap.set(submission.campaignDeliverableId, submission);
      return newMap;
    });
  };

  const handleSubmitAll = async () => {
    if (!enrollment || pendingSubmissions.size === 0) return;

    setSubmitting(true);
    try {
      const client = getAuthenticatedClient();
      await client.enrollments.submitDeliverables(enrollment.id, {
        submissions: Array.from(pendingSubmissions.values()),
      });
      setPendingSubmissions(new Map());
      await refetch();
    } catch (err) {
      console.error("Failed to submit deliverables:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!enrollment) return;

    setWithdrawing(true);
    try {
      const client = getAuthenticatedClient();
      await client.enrollments.withdrawEnrollment(enrollment.id);
      setShowWithdrawDialog(false);
      await refetch();
    } catch (err) {
      console.error("Failed to withdraw enrollment:", err);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleResubmit = async () => {
    if (!enrollment) return;

    setResubmitting(true);
    try {
      const client = getAuthenticatedClient();
      await client.enrollments.resubmitEnrollment(enrollment.id);
      setShowResubmitDialog(false);
      await refetch();
    } catch (err) {
      console.error("Failed to resubmit enrollment:", err);
    } finally {
      setResubmitting(false);
    }
  };

  const handleUpdateDeliverable = async (
    enrollmentId: string,
    deliverableId: string,
    data: { proofLink?: string; proofScreenshot?: string }
  ) => {
    const client = getAuthenticatedClient();
    await client.enrollments.updateDeliverable(enrollmentId, deliverableId, data);
    await refetch();
  };

  const handleDeleteDeliverable = async (
    enrollmentId: string,
    deliverableId: string
  ) => {
    const client = getAuthenticatedClient();
    await client.enrollments.deleteDeliverable(enrollmentId, deliverableId);
    await refetch();
  };

  // Loading State
  if (loading) {
    return <EnrollmentShowSkeleton />;
  }

  // Error State
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
        <Button
          className="mt-6"
          onClick={() => navigate("/enrollments")}
          color="dark/zinc"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const deliverablesComplete =
    enrollment.submissions?.filter((s) => s.proofLink || s.proofScreenshot)
      .length || 0;
  const deliverablesTotal = enrollment.submissions?.length || 0;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HERO SECTION - Campaign + Earnings */}
      {/* ================================================================== */}
      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        {/* Campaign Image */}
        <div className="lg:col-span-2">
          <div className="h-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {enrollment.campaign.productName ? (
              <div className="flex aspect-4/3 items-center justify-center bg-zinc-100 lg:aspect-square dark:bg-zinc-800">
                <CubeIcon className="size-16 text-zinc-300 dark:text-zinc-600" />
              </div>
            ) : (
              <div className="flex aspect-4/3 items-center justify-center bg-zinc-100 lg:aspect-square dark:bg-zinc-800">
                <ShoppingBagIcon className="size-16 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}
            {/* Campaign Quick Info */}
            <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
              <Link
                href={`/campaigns/${enrollment.campaignId}`}
                className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white"
              >
                {enrollment.campaign.title}
                <ChevronRightIcon className="size-4 text-zinc-400" />
              </Link>
              {enrollment.platform && (
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {enrollment.platform.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Info */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={statusConfig?.color || "zinc"}>
              {statusConfig?.icon && (
                <statusConfig.icon className="mr-1 size-3" />
              )}
              {statusConfig?.label}
            </Badge>
            <Badge color="zinc">Order #{enrollment.orderId}</Badge>
          </div>

          {/* Title */}
          <div>
            <Heading>Enrollment Details</Heading>
            {statusConfig?.message && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {statusConfig.message}
              </p>
            )}
          </div>

          {/* Alert Banner for Action Required */}
          {enrollment.status === "changes_requested" && enrollment.rejection && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
              <ExclamationTriangleIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Changes Requested
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  {enrollment.rejection.reason}
                </p>
              </div>
            </div>
          )}

          {enrollment.status === "permanently_rejected" && enrollment.rejection && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
              <XCircleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Enrollment Rejected
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {enrollment.rejection.reason}
                </p>
              </div>
            </div>
          )}

          {/* Premium Dark Earnings Card */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  {enrollment.status === "approved"
                    ? "Cashback Earned"
                    : "Estimated Cashback"}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(estimatedPayout)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-400">
                  {enrollment.lockedRebatePercentage}% of{" "}
                  {formatCurrency(enrollment.orderValueDecimal)}
                </p>
                {enrollment.lockedBonusAmountDecimal &&
                  Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                    <p className="mt-0.5 text-xs text-emerald-400">
                      +{formatCurrency(enrollment.lockedBonusAmountDecimal)} bonus
                    </p>
                  )}
              </div>
            </div>
            {/* Deliverables Progress */}
            {enrollment.submissions && enrollment.submissions.length > 0 && (
              <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3 dark:border-zinc-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Deliverables completed</span>
                  <span className="font-medium text-zinc-400">
                    {deliverablesComplete}/{deliverablesTotal}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      deliverablesComplete === deliverablesTotal
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{
                      width: `${deliverablesTotal > 0 ? (deliverablesComplete / deliverablesTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-1.5">
                <CalendarDaysIcon className="size-4 text-sky-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Purchase Date
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {formatDate(enrollment.purchaseDate)}
              </p>
            </div>
            <DeadlineGauge
              expiresAt={enrollment.expiresAt}
              status={enrollment.status}
            />
          </div>

          {/* Progress Stepper */}
          <EnrollmentProgressStepper status={enrollment.status} className="flex-1" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left Column - 2 cols */}
        <div className="space-y-5 lg:col-span-2">
          {/* Deliverables Card */}
          {enrollment.submissions && enrollment.submissions.length > 0 && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="size-4 text-rose-500" />
                  <Subheading className="text-sm">Deliverables</Subheading>
                </div>
                <span className="text-xs text-zinc-400">
                  {deliverablesComplete}/{deliverablesTotal} completed
                </span>
              </div>
              <div className="space-y-3 p-4">
                {enrollment.submissions.map((submission, index) => (
                  <DeliverableCard
                    key={submission.id}
                    deliverable={submission}
                    enrollmentId={enrollment.id}
                    enrollmentStatus={enrollment.status}
                    onSubmit={handleDeliverableSubmit}
                    onUpdate={handleUpdateDeliverable}
                    onDelete={handleDeleteDeliverable}
                    index={index}
                  />
                ))}

                {/* Submit All Button */}
                {canSubmit && pendingSubmissions.size > 0 && (
                  <Button
                    color="emerald"
                    className="w-full"
                    onClick={handleSubmitAll}
                    disabled={submitting}
                  >
                    <CheckCircleIcon className="size-4" />
                    {submitting
                      ? "Submitting..."
                      : `Submit ${pendingSubmissions.size} Deliverable${pendingSubmissions.size > 1 ? "s" : ""}`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* OCR Verification */}
          {enrollment.ocrData && <OCRDataCard ocrData={enrollment.ocrData} />}

          {/* Activity Timeline */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <ClockIcon className="size-4 text-violet-500" />
                <Subheading className="text-sm">Activity</Subheading>
              </div>
              <div className="p-4">
                <ActivityTimeline history={enrollment.history} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-5">
          {/* Order Details */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <ShoppingBagIcon className="size-4 text-sky-500" />
              <Subheading className="text-sm">Order Details</Subheading>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Order ID
                </span>
                <span className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
                  #{enrollment.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Order Value
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {formatCurrency(enrollment.orderValueDecimal)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Cashback Rate
                </span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {enrollment.lockedRebatePercentage}%
                </span>
              </div>
              {enrollment.lockedBonusAmountDecimal &&
                Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Bonus
                    </span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(enrollment.lockedBonusAmountDecimal)}
                    </span>
                  </div>
                )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enrolled On
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {formatDate(enrollment.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <InformationCircleIcon className="size-4 text-amber-500" />
              <Subheading className="text-sm">Status</Subheading>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Current Status
                </span>
                <Badge color={statusConfig?.color || "zinc"}>
                  {statusConfig?.label}
                </Badge>
              </div>
              {enrollment.expiresAt && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Deadline
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(enrollment.expiresAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Rejections
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {enrollment.rejectionCount}
                </span>
              </div>
              {enrollment.canResubmit && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Can Resubmit
                  </span>
                  <Badge color="amber">Yes</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              href={`/campaigns/${enrollment.campaignId}`}
              outline
              className="w-full"
            >
              <ShoppingBagIcon className="size-4" />
              View Campaign
            </Button>

            {enrollment.status === "changes_requested" &&
              enrollment.canResubmit && (
                <Button
                  color="emerald"
                  className="w-full"
                  onClick={() => setShowResubmitDialog(true)}
                >
                  <ArrowPathIcon className="size-4" />
                  Resubmit for Review
                </Button>
              )}

            {enrollment.status === "awaiting_submission" && (
              <Button
                outline
                className="w-full text-red-600 dark:text-red-400"
                onClick={() => setShowWithdrawDialog(true)}
              >
                <XMarkIcon className="size-4" />
                Withdraw Enrollment
              </Button>
            )}
          </div>

          {/* Help Card */}
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
                <ChatBubbleLeftRightIcon className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Need help?
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Contact support if you have questions about your enrollment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DIALOGS */}
      {/* ================================================================== */}

      {/* Withdraw Dialog */}
      <Dialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-7 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4">Withdraw Enrollment?</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to withdraw? This action cannot be undone and
            you will lose any potential earnings from this campaign.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowWithdrawDialog(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resubmit Dialog */}
      <Dialog
        open={showResubmitDialog}
        onClose={() => setShowResubmitDialog(false)}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <ArrowPathIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="mt-4">Resubmit for Review?</DialogTitle>
          <DialogDescription className="mt-2">
            Make sure you've addressed all the requested changes. Your
            enrollment will be reviewed again by our team.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowResubmitDialog(false)}>
            Cancel
          </Button>
          <Button color="emerald" onClick={handleResubmit} disabled={resubmitting}>
            <CheckCircleIcon className="size-4" />
            {resubmitting ? "Submitting..." : "Resubmit"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}