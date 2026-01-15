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
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { useEnrollmentDetail, useEnrollmentPricing } from "@/hooks/use-api";
import type { shared } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { SkeletonWrapper, BoxSkeleton } from "@/lib/skeleton";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  PhotoIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";

type EnrollmentStatusType = shared.EnrollmentStatus;

// ============================================================================
// LOADING SKELETON
// ============================================================================

function EnrollmentShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-4 lg:space-y-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            {/* Hero Card */}
            <BoxSkeleton height={200} borderRadius={12} />
            {/* Progress */}
            <BoxSkeleton height={120} borderRadius={12} />
            {/* Deliverables */}
            <BoxSkeleton height={200} borderRadius={12} />
          </div>
          {/* Right Column */}
          <div className="mt-4 space-y-4 lg:mt-0">
            <BoxSkeleton height={200} borderRadius={12} />
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

  const [imageError, setImageError] = useState(false);

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        {imageError ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 p-4 text-center">
            <PhotoIcon className="size-8 text-zinc-400" />
            <p className="text-xs text-zinc-500">Image could not be loaded</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
            >
              Open link
            </a>
          </div>
        ) : (
          <img
            src={value}
            alt="Screenshot preview"
            className="max-h-48 w-full object-contain"
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
// PROGRESS STEPPER - Icon-based horizontal stepper
// ============================================================================

function ProgressStepper({
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
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    },
    {
      key: "submitted",
      icon: CameraIcon,
      title: "Submitted",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    },
    {
      key: "review",
      icon: DocumentCheckIcon,
      title: "Review",
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    },
    {
      key: "paid",
      icon: BanknotesIcon,
      title: "Paid",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
  ];

  // Determine which steps are complete based on status
  // completedSteps = number of steps that are done (green checkmark)
  // currentStep = the step user is currently on (highlighted)
  let completedSteps = 1; // Enrolled is always complete
  let currentStep = 1; // Index of current step

  if (status === "awaiting_submission" || status === "changes_requested") {
    completedSteps = 1; // Only enrolled is complete
    currentStep = 1; // Currently on Submit step
  } else if (status === "awaiting_review") {
    completedSteps = 2; // Enrolled + Submitted complete
    currentStep = 2; // Currently on Review step
  } else if (status === "approved") {
    completedSteps = 4; // All complete
    currentStep = 3; // Paid step
  } else if (
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired"
  ) {
    completedSteps = 1;
    currentStep = -1; // Failed state
  }

  const isRejected =
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired";

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 ${className || ""}`}
    >
      <div className="p-4">
        <div className="relative flex items-start justify-between">
          {/* Background connector line */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-4 h-0.5 -translate-y-1/2 bg-zinc-200 dark:bg-zinc-700" />

          {/* Progress line */}
          {completedSteps > 0 && !isRejected && (
            <div
              className="pointer-events-none absolute left-[12.5%] top-4 h-0.5 -translate-y-1/2 bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, ((completedSteps - 1) / 3) * 75)}%`,
              }}
            />
          )}

          {steps.map((step, index) => {
            const isComplete = index < completedSteps;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative flex w-1/4 flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`relative z-10 flex size-8 items-center justify-center rounded-full transition-all ${
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-zinc-900 text-white ring-2 ring-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:ring-white/20"
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

                {/* Step Title */}
                <p
                  className={`mt-2 text-xs font-medium ${
                    isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCurrent
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {step.title}
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
// DAYS LEFT GAUGE - Bigger gauge for detail page
// ============================================================================

function DaysLeftGauge({
  expiresAt,
  status,
  maxDays = 30,
}: {
  expiresAt?: string;
  status: EnrollmentStatusType;
  maxDays?: number;
}) {
  const { daysRemaining, isUrgent, isExpired, percent } = useMemo(() => {
    if (!expiresAt)
      return { daysRemaining: null, isUrgent: false, isExpired: false, percent: 0 };

    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
      return { daysRemaining: 0, isUrgent: true, isExpired: true, percent: 0 };
    }

    return {
      daysRemaining: diff,
      isUrgent: diff <= 3,
      isExpired: false,
      percent: Math.min((diff / maxDays) * 100, 100),
    };
  }, [expiresAt, maxDays]);

  // Don't show gauge for completed or rejected statuses
  if (!expiresAt || status === "approved" || status === "permanently_rejected") {
    return null;
  }

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

  // Responsive gauge - uses CSS classes for size
  // Mobile: 80px, sm: 100px, lg: 120px
  return (
    <div className="flex shrink-0 flex-col items-center">
      {/* Mobile gauge: 80px */}
      <div className="relative sm:hidden" style={{ width: 80, height: 80 / 2 + 8 }}>
        <GaugeSVG size={80} strokeWidth={5} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-xl font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[8px] font-semibold uppercase tracking-wide opacity-70">days left</span>
        </div>
      </div>
      {/* Tablet gauge: 100px */}
      <div className="relative hidden sm:block lg:hidden" style={{ width: 100, height: 100 / 2 + 8 }}>
        <GaugeSVG size={100} strokeWidth={6} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-2xl font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">days left</span>
        </div>
      </div>
      {/* Desktop gauge: 120px */}
      <div className="relative hidden lg:block" style={{ width: 120, height: 120 / 2 + 10 }}>
        <GaugeSVG size={120} strokeWidth={7} percent={percent} strokeColor={strokeColor} daysRemaining={daysRemaining} />
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
          <span className="text-3xl font-bold tabular-nums leading-none">{daysRemaining}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">days left</span>
        </div>
      </div>
    </div>
  );
}

// Extracted SVG component for the gauge arc
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
  daysRemaining: number | null;
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
  );
}

// ============================================================================
// DELIVERABLE ITEM (Compact Row)
// ============================================================================

interface DeliverableSubmission {
  campaignDeliverableId: string;
  proofLink?: string;
  proofScreenshot?: string;
}

function DeliverableItem({
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
            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        }`}
      >
        <div className="p-3">
          {/* Header Row - Stack layout */}
          <div className="flex flex-col gap-3">
            {/* Top: Number + Title + Badge */}
            <div className="flex items-start gap-2.5">
              {/* Status Icon */}
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                  isSubmitted
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {isSubmitted ? (
                  <CheckCircleIcon className="size-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{index + 1}</span>
                )}
              </div>

              {/* Title + Badge */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {deliverable.deliverableName}
                </p>
                {/* Submitted status or requirements */}
                {isSubmitted && deliverable.submittedAt ? (
                  <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                    Submitted {formatRelativeTime(deliverable.submittedAt)}
                  </p>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
                    {deliverable.requireLink && (
                      <span className="flex items-center gap-0.5">
                        <LinkIcon className="size-2.5" /> Link
                      </span>
                    )}
                    {deliverable.requireLink && deliverable.requireScreenshot && (
                      <span>•</span>
                    )}
                    {deliverable.requireScreenshot && (
                      <span className="flex items-center gap-0.5">
                        <PhotoIcon className="size-2.5" /> Screenshot
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Required Badge */}
              {deliverable.isRequired && (
                <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  Required
                </span>
              )}
            </div>

            {/* Bottom: Action Buttons - Full width */}
            <div className="flex items-center gap-2">
              {/* Upload button when not submitted */}
              {canSubmit && !isSubmitted && (
                <Button
                  color="dark/zinc"
                  className="h-8 flex-1 text-xs"
                  onClick={() => setShowDialog(true)}
                >
                  Upload
                </Button>
              )}

              {/* Edit button when can submit */}
              {canSubmit && isSubmitted && (
                <Button
                  outline
                  className="h-8 flex-1 text-xs"
                  onClick={() => setShowDialog(true)}
                >
                  <ArrowPathIcon className="size-3.5" />
                  Edit
                </Button>
              )}

              {/* View link button */}
              {isSubmitted && deliverable.proofLink && (
                <a
                  href={deliverable.proofLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <ArrowTopRightOnSquareIcon className="size-3.5" />
                  View
                </a>
              )}

              {/* Delete button */}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  title="Delete submission"
                >
                  <XCircleIcon className="size-4" />
                </button>
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
// COLLAPSIBLE SECTION
// ============================================================================

function CollapsibleSection({
  title,
  icon: Icon,
  iconColor,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  icon: typeof ClockIcon;
  iconColor: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${iconColor}`} />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            {title}
          </span>
          {badge}
        </div>
        <ChevronDownIcon
          className={`size-4 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVITY TIMELINE (Compact)
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
                {entry.toStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              {entry.reason && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.reason}
                </p>
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
// ORDER SCREENSHOT CARD (Simple)
// ============================================================================

function OrderScreenshotCard({
  screenshotUrl,
}: {
  screenshotUrl: string;
}) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <PhotoIcon className="size-4 text-sky-500" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            Order Screenshot
          </span>
        </div>
        <div className="p-3">
          <button
            type="button"
            onClick={() => setShowFullImage(true)}
            className="group relative w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <img
              src={screenshotUrl}
              alt="Order screenshot"
              className="max-h-48 w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/0 opacity-0 transition-all group-hover:bg-zinc-900/50 group-hover:opacity-100">
              <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm">
                View Full Image
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Full Image Dialog */}
      <Dialog open={showFullImage} onClose={() => setShowFullImage(false)} size="2xl">
        <DialogTitle>Order Screenshot</DialogTitle>
        <DialogBody>
          <img
            src={screenshotUrl}
            alt="Order screenshot"
            className="w-full rounded-lg"
          />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowFullImage(false)}>
            Close
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
  const productImage = enrollment.campaign?.productImage;
  const productName = enrollment.campaign?.productName || enrollment.campaign?.title;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ================================================================== */}
      {/* DESKTOP: Two-column layout / MOBILE: Single column */}
      {/* ================================================================== */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* ================================================================== */}
        {/* LEFT COLUMN (2/3 on desktop) */}
        {/* ================================================================== */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          {/* HERO CARD */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            {/* Top Section: Product + Status + Gauge */}
            <div className="flex items-center gap-3 p-4 sm:gap-4 lg:p-5">
              {/* Product Image */}
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:size-20 lg:size-24 dark:bg-zinc-800">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName || "Product"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <CubeIcon className="size-6 text-zinc-300 sm:size-8 lg:size-10 dark:text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                {/* Status Badge */}
                <Badge color={statusConfig?.color || "zinc"}>
                  {statusConfig?.icon && (
                    <statusConfig.icon className="mr-1 size-3" />
                  )}
                  {statusConfig?.label}
                </Badge>

                {/* Campaign Title - Clickable link to campaign */}
                <Link
                  href={`/campaigns/${enrollment.campaignId}`}
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 lg:mt-2 lg:text-base dark:text-white dark:hover:text-zinc-300"
                >
                  <span className="line-clamp-1">{enrollment.campaign.title}</span>
                  <ArrowTopRightOnSquareIcon className="size-3.5 shrink-0 text-zinc-400" />
                </Link>

                {/* Order Info */}
                <p className="mt-0.5 truncate text-xs text-zinc-500 lg:mt-1 lg:text-sm dark:text-zinc-400">
                  Order #{enrollment.orderId}
                  {enrollment.purchaseDate && ` · ${formatDate(enrollment.purchaseDate)}`}
                </p>
              </div>

              {/* Days Left Gauge - Right side */}
              <DaysLeftGauge
                expiresAt={enrollment.expiresAt}
                status={enrollment.status}
              />
            </div>

            {/* Alert Banner */}
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

          {/* PROGRESS STEPPER - Enhanced version with card wrapper */}
          <ProgressStepper status={enrollment.status} />

          {/* DELIVERABLES */}
          {enrollment.submissions && enrollment.submissions.length > 0 && (
            <CollapsibleSection
              title="Deliverables"
              icon={ClipboardDocumentListIcon}
              iconColor="text-rose-500"
              badge={
                <span className="text-xs text-zinc-400">
                  {deliverablesComplete}/{deliverablesTotal}
                </span>
              }
            >
              <div className="space-y-2 p-4 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:p-5">
                {enrollment.submissions.map((submission, index) => (
                  <DeliverableItem
                    key={submission.id || submission.campaignDeliverableId || index}
                    deliverable={submission}
                    enrollmentId={enrollment.id}
                    enrollmentStatus={enrollment.status}
                    onSubmit={handleDeliverableSubmit}
                    onUpdate={handleUpdateDeliverable}
                    onDelete={handleDeleteDeliverable}
                    index={index}
                  />
                ))}
              </div>

              {/* Submit All Button */}
              {canSubmit && pendingSubmissions.size > 0 && (
                <div className="border-t border-zinc-100 px-4 py-3 lg:px-5 dark:border-zinc-800">
                  <Button
                    color="emerald"
                    className="w-full lg:w-auto"
                    onClick={handleSubmitAll}
                    disabled={submitting}
                  >
                    <CheckCircleIcon className="size-4" />
                    {submitting
                      ? "Submitting..."
                      : `Submit ${pendingSubmissions.size} Deliverable${pendingSubmissions.size > 1 ? "s" : ""}`}
                  </Button>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* ACTIVITY TIMELINE - Desktop only in left column */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="hidden lg:block">
              <CollapsibleSection
                title="Activity"
                icon={ClockIcon}
                iconColor="text-violet-500"
                defaultOpen={false}
              >
                <ActivityTimeline history={enrollment.history} />
              </CollapsibleSection>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN (1/3 on desktop) - Sidebar */}
        {/* ================================================================== */}
        <div className="mt-4 space-y-4 lg:mt-0">
          {/* Earnings Card - Sticky on desktop */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-sm lg:sticky lg:top-4 dark:bg-zinc-800">
            <div className="p-4 lg:p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 lg:text-xs">
                {enrollment.status === "approved" ? "Cashback Earned" : "Estimated Cashback"}
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-400 lg:text-4xl">
                {formatCurrency(estimatedPayout)}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Order Value</span>
                <span className="font-medium text-zinc-300">
                  {formatCurrency(enrollment.orderValueDecimal)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-zinc-500">Cashback Rate</span>
                <span className="font-medium text-emerald-400">
                  {enrollment.lockedRebatePercentage}%
                </span>
              </div>
              {enrollment.lockedBonusAmountDecimal &&
                Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                  <div className="mt-1.5 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Bonus</span>
                    <span className="font-medium text-emerald-400">
                      +{formatCurrency(enrollment.lockedBonusAmountDecimal)}
                    </span>
                  </div>
                )}

              {/* Progress Bar */}
              {deliverablesTotal > 0 && (
                <div className="mt-4 border-t border-zinc-800 pt-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Tasks completed</span>
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
          </div>

          {/* ORDER DETAILS - In sidebar on desktop */}
          <CollapsibleSection
            title="Order Details"
            icon={ShoppingBagIcon}
            iconColor="text-sky-500"
            defaultOpen={false}
          >
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Order ID</span>
                <span className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
                  #{enrollment.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Order Value</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {formatCurrency(enrollment.orderValueDecimal)}
                </span>
              </div>
              {enrollment.purchaseDate && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Purchase Date</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(enrollment.purchaseDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Cashback Rate</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {enrollment.lockedRebatePercentage}%
                </span>
              </div>
              {enrollment.lockedBonusAmountDecimal &&
                Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Bonus</span>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(enrollment.lockedBonusAmountDecimal)}
                    </span>
                  </div>
                )}
              {enrollment.expiresAt && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Deadline</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(enrollment.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* ORDER SCREENSHOT */}
          {enrollment.ocrData?.screenshotUrl && (
            <OrderScreenshotCard screenshotUrl={enrollment.ocrData.screenshotUrl} />
          )}

          {/* ACTIVITY TIMELINE - Mobile only (desktop shows in left column) */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="lg:hidden">
              <CollapsibleSection
                title="Activity"
                icon={ClockIcon}
                iconColor="text-violet-500"
                defaultOpen={false}
              >
                <ActivityTimeline history={enrollment.history} />
              </CollapsibleSection>
            </div>
          )}

          {/* ACTIONS */}
          <div className="space-y-2">
            {enrollment.status === "changes_requested" && enrollment.canResubmit && (
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
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
              <ChatBubbleLeftRightIcon className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Need help?
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Contact support if you have questions about your enrollment.
              </p>
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
