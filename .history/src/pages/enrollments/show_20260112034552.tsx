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
import {
  formatDate,
  formatRelativeTime,
  formatSmartDate,
  daysUntil,
  formatDeadline,
} from "@/lib/date";
import {
  SkeletonWrapper,
  BoxSkeleton,
  TextSkeleton,
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
  ChevronDownIcon,
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
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";

type EnrollmentStatusType = shared.EnrollmentStatus;

// ============================================================================
// LOADING SKELETON
// ============================================================================

function EnrollmentShowSkeleton() {
  return (
    <SkeletonWrapper>
      <div className="space-y-4">
        {/* Hero */}
        <BoxSkeleton height={200} borderRadius={16} />
        {/* Progress */}
        <BoxSkeleton height={80} borderRadius={12} />
        {/* Cards */}
        <BoxSkeleton height={250} borderRadius={12} />
        <BoxSkeleton height={180} borderRadius={12} />
      </div>
    </SkeletonWrapper>
  );
}

// ============================================================================
// UTILITY
// ============================================================================

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

const STATUS_CONFIG: Record<
  EnrollmentStatusType,
  {
    color: "emerald" | "amber" | "red" | "zinc" | "sky";
    label: string;
    icon: typeof CheckCircleIcon;
    bg: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  awaiting_submission: {
    color: "amber",
    label: "Action Required",
    icon: DocumentTextIcon,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  awaiting_review: {
    color: "sky",
    label: "Under Review",
    icon: ClockIcon,
    bg: "bg-sky-50 dark:bg-sky-950/30",
    iconBg: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  changes_requested: {
    color: "amber",
    label: "Changes Needed",
    icon: ExclamationTriangleIcon,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  approved: {
    color: "emerald",
    label: "Approved",
    icon: CheckCircleIcon,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  permanently_rejected: {
    color: "red",
    label: "Rejected",
    icon: XCircleIcon,
    bg: "bg-red-50 dark:bg-red-950/30",
    iconBg: "bg-red-100 dark:bg-red-900/60",
    iconColor: "text-red-600 dark:text-red-400",
  },
  withdrawn: {
    color: "zinc",
    label: "Withdrawn",
    icon: XMarkIcon,
    bg: "bg-zinc-100 dark:bg-zinc-800/50",
    iconBg: "bg-zinc-200 dark:bg-zinc-700",
    iconColor: "text-zinc-500 dark:text-zinc-400",
  },
  expired: {
    color: "zinc",
    label: "Expired",
    icon: ClockIcon,
    bg: "bg-zinc-100 dark:bg-zinc-800/50",
    iconBg: "bg-zinc-200 dark:bg-zinc-700",
    iconColor: "text-zinc-500 dark:text-zinc-400",
  },
};

// ============================================================================
// IMAGE DROPZONE
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

        if (!uploadResponse.ok) throw new Error("Upload failed");
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

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <img src={value} alt="Preview" className="max-h-40 w-full object-contain" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute right-2 top-2 rounded-full bg-zinc-900/80 p-1.5 text-white"
        >
          <XMarkIcon className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6",
          isDragging
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
            : "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-600" />
        ) : (
          <>
            <ArrowUpTrayIcon className="size-6 text-zinc-400" />
            <p className="mt-2 text-xs text-zinc-500">Drop or click to upload</p>
          </>
        )}
      </label>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// CIRCULAR PROGRESS RING
// ============================================================================

function ProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-700"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={clsx(
            "transition-all duration-500",
            progress === 100
              ? "text-emerald-500"
              : progress > 50
                ? "text-amber-500"
                : "text-sky-500"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MINI PROGRESS STEPS (Horizontal)
// ============================================================================

function MiniProgressSteps({ status }: { status: EnrollmentStatusType }) {
  const steps = [
    { key: "enroll", label: "Enrolled" },
    { key: "submit", label: "Submit" },
    { key: "review", label: "Review" },
    { key: "paid", label: "Paid" },
  ];

  let current = 0;
  if (status === "awaiting_submission" || status === "changes_requested") current = 1;
  else if (status === "awaiting_review") current = 2;
  else if (status === "approved") current = 4;

  const isFailed = ["permanently_rejected", "withdrawn", "expired"].includes(status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isComplete = current > i;
        const isCurrent = current === i + 1;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={clsx(
                "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold",
                isComplete
                  ? "bg-emerald-500 text-white"
                  : isCurrent && !isFailed
                    ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700"
              )}
            >
              {isComplete ? (
                <CheckCircleIcon className="size-3.5" />
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  "mx-0.5 h-0.5 w-4",
                  isComplete ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

function CollapsibleCard({
  title,
  icon: Icon,
  iconColor,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: typeof CheckCircleIcon;
  iconColor: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <div className={clsx("flex size-7 items-center justify-center rounded-lg", iconColor)}>
            <Icon className="size-3.5 text-current" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</span>
          {badge}
        </div>
        <ChevronDownIcon
          className={clsx(
            "size-4 text-zinc-400 transition-transform",
            isOpen && "rotate-180"
          )}
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
// DELIVERABLE ROW (Compact)
// ============================================================================

interface DeliverableSubmission {
  campaignDeliverableId: string;
  proofLink?: string;
  proofScreenshot?: string;
}

function DeliverableRow({
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
    deliverable.proofScreenshot
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
        className={clsx(
          "flex items-center gap-3 px-4 py-3",
          index > 0 && "border-t border-zinc-100 dark:border-zinc-800"
        )}
      >
        {/* Status Indicator */}
        <div
          className={clsx(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            isSubmitted
              ? "bg-emerald-100 dark:bg-emerald-900/50"
              : "bg-zinc-100 dark:bg-zinc-800"
          )}
        >
          {isSubmitted ? (
            <CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <span className="text-xs font-semibold text-zinc-400">{index + 1}</span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {deliverable.deliverableName}
            </p>
            {deliverable.isRequired && (
              <span className="shrink-0 rounded bg-red-100 px-1 py-0.5 text-[9px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                REQ
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
            {deliverable.requireLink && (
              <span className="flex items-center gap-0.5">
                <LinkIcon className="size-2.5" /> Link
              </span>
            )}
            {deliverable.requireScreenshot && (
              <span className="flex items-center gap-0.5">
                <PhotoIcon className="size-2.5" /> Screenshot
              </span>
            )}
            {isSubmitted && deliverable.submittedAt && (
              <span className="text-emerald-500">
                {formatRelativeTime(deliverable.submittedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {canSubmit && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowDialog(true)}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium",
                isSubmitted
                  ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              )}
            >
              {isSubmitted ? "Edit" : "Submit"}
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-lg p-1.5 text-red-500"
              >
                <XCircleIcon className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* View only if submitted and can't edit */}
        {isSubmitted && !canSubmit && (
          <button
            type="button"
            onClick={() => setShowDialog(true)}
            className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            View
          </button>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} size="md">
        <DialogTitle>{deliverable.deliverableName}</DialogTitle>
        <DialogDescription>
          {deliverable.instructions || "Provide proof of completion."}
        </DialogDescription>
        <DialogBody>
          <div className="space-y-4">
            {deliverable.requireLink && (
              <Field>
                <Label>Proof Link</Label>
                <div className="mt-1.5">
                  <Input
                    type="url"
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    placeholder="https://..."
                    disabled={!canSubmit}
                  />
                </div>
              </Field>
            )}
            {deliverable.requireScreenshot && (
              <Field>
                <Label>Screenshot</Label>
                <div className="mt-1.5">
                  {canSubmit ? (
                    <ImageDropzone
                      value={proofScreenshot}
                      onChange={setProofScreenshot}
                      onUploading={setUploadingScreenshot}
                    />
                  ) : proofScreenshot ? (
                    <img
                      src={proofScreenshot}
                      alt="Screenshot"
                      className="max-h-48 rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-zinc-500">No screenshot uploaded</p>
                  )}
                </div>
              </Field>
            )}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowDialog(false)}>
            {canSubmit ? "Cancel" : "Close"}
          </Button>
          {canSubmit && (
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
              {updating ? "Saving..." : isSubmitted ? "Update" : "Submit"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} size="sm">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-3">Delete submission?</DialogTitle>
          <DialogDescription className="mt-1">
            You can submit again later.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// MINI TIMELINE
// ============================================================================

function MiniTimeline({
  history,
}: {
  history: {
    id: string;
    toStatus: string;
    reason?: string;
    changedAt: string;
  }[];
}) {
  const [showAll, setShowAll] = useState(false);
  const displayHistory = showAll ? history : history.slice(0, 3);

  return (
    <div className="px-4 py-3">
      <div className="space-y-2.5">
        {displayHistory.map((entry, index) => {
          const config = STATUS_CONFIG[entry.toStatus as EnrollmentStatusType];
          return (
            <div key={entry.id} className="flex items-start gap-2.5">
              <div
                className={clsx(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  config?.iconBg || "bg-zinc-100 dark:bg-zinc-800"
                )}
              >
                {config?.icon && (
                  <config.icon className={clsx("size-2.5", config?.iconColor)} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {entry.toStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <span className="text-[10px] text-zinc-400">
                    {formatRelativeTime(entry.changedAt)}
                  </span>
                </div>
                {entry.reason && (
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                    {entry.reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {history.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-2.5 text-xs font-medium text-zinc-500"
        >
          {showAll ? "Show less" : `Show ${history.length - 3} more`}
        </button>
      )}
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

  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<
    Map<string, DeliverableSubmission>
  >(new Map());

  const statusConfig = enrollment ? STATUS_CONFIG[enrollment.status] : null;

  const estimatedPayout = useMemo(() => {
    if (!enrollment) return 0;
    if (pricing?.formatted?.shopperPayout) return pricing.formatted.shopperPayout;
    const base = (parseFloat(enrollment.orderValueDecimal) * enrollment.lockedRebatePercentage) / 100;
    const bonus = enrollment.lockedBonusAmountDecimal
      ? parseFloat(enrollment.lockedBonusAmountDecimal)
      : 0;
    return base + bonus;
  }, [enrollment, pricing]);

  const deliverablesProgress = useMemo(() => {
    if (!enrollment?.submissions) return { done: 0, total: 0, percent: 0 };
    const total = enrollment.submissions.length;
    const done = enrollment.submissions.filter(
      (s) => s.proofLink || s.proofScreenshot
    ).length;
    return { done, total, percent: total > 0 ? (done / total) * 100 : 0 };
  }, [enrollment?.submissions]);

  const deadline = useMemo(() => {
    if (!enrollment?.expiresAt) return null;
    return formatDeadline(enrollment.expiresAt);
  }, [enrollment?.expiresAt]);

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
      console.error("Failed to submit:", err);
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
      console.error("Failed to withdraw:", err);
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
      console.error("Failed to resubmit:", err);
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

  const handleDeleteDeliverable = async (enrollmentId: string, deliverableId: string) => {
    const client = getAuthenticatedClient();
    await client.enrollments.deleteDeliverable(enrollmentId, deliverableId);
    await refetch();
  };

  // Loading
  if (loading) return <EnrollmentShowSkeleton />;

  // Error
  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <ShoppingBagIcon className="size-8 text-red-400" />
        </div>
        <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Enrollment not found
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          The enrollment doesn't exist or was deleted.
        </p>
        <Button className="mt-6" onClick={() => navigate("/enrollments")} color="dark/zinc">
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-6">
      {/* ================================================================== */}
      {/* HERO CARD - Combined Status + Earnings */}
      {/* ================================================================== */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        {/* Top Section - Campaign + Status */}
        <div className="flex items-start gap-4 p-4">
          {/* Campaign Thumbnail */}
          <Link
            href={`/campaigns/${enrollment.campaignId}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
          >
            {enrollment.campaign.productName ? (
              <div className="flex size-full items-center justify-center">
                <CubeIcon className="size-8 text-zinc-300 dark:text-zinc-600" />
              </div>
            ) : (
              <div className="flex size-full items-center justify-center">
                <ShoppingBagIcon className="size-8 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}
            {/* Platform badge could go here */}
          </Link>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge color={statusConfig?.color || "zinc"} className="text-[10px]">
                {statusConfig?.label}
              </Badge>
              {deadline && deadline.isUrgent && canSubmit && (
                <Badge color="red" className="text-[10px]">
                  {deadline.text}
                </Badge>
              )}
            </div>
            <h1 className="mt-1 truncate text-base font-semibold text-zinc-900 dark:text-white">
              {enrollment.campaign.title}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Order #{enrollment.orderId} · {formatDate(enrollment.purchaseDate)}
            </p>
          </div>
        </div>

        {/* Alert Banner (if needed) */}
        {enrollment.status === "changes_requested" && enrollment.rejection && (
          <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <ExclamationTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Changes requested
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                {enrollment.rejection.reason}
              </p>
            </div>
          </div>
        )}

        {enrollment.status === "permanently_rejected" && enrollment.rejection && (
          <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
            <XCircleIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-red-800 dark:text-red-200">
                Rejected
              </p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                {enrollment.rejection.reason}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Section - Earnings + Progress */}
        <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
          <div className="flex items-center justify-between gap-4">
            {/* Earnings */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {enrollment.status === "approved" ? "Earned" : "Potential Earnings"}
              </p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(estimatedPayout)}
                </span>
                <span className="text-xs text-zinc-400">
                  ({enrollment.lockedRebatePercentage}% of {formatCurrency(enrollment.orderValueDecimal)})
                </span>
              </div>
              {enrollment.lockedBonusAmountDecimal &&
                Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-500">
                    <GiftIcon className="size-3" />
                    +{formatCurrency(enrollment.lockedBonusAmountDecimal)} bonus
                  </p>
                )}
            </div>

            {/* Progress Ring */}
            {deliverablesProgress.total > 0 && (
              <div className="flex flex-col items-center">
                <ProgressRing progress={deliverablesProgress.percent} />
                <p className="mt-1 text-[10px] text-zinc-400">
                  {deliverablesProgress.done}/{deliverablesProgress.total} tasks
                </p>
              </div>
            )}
          </div>

          {/* Mini Progress Steps */}
          <div className="mt-4 flex items-center justify-between">
            <MiniProgressSteps status={enrollment.status} />
            {deadline && !deadline.isUrgent && canSubmit && (
              <p className="text-[11px] text-zinc-400">{deadline.text}</p>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DELIVERABLES */}
      {/* ================================================================== */}
      {enrollment.submissions && enrollment.submissions.length > 0 && (
        <CollapsibleCard
          title="Deliverables"
          icon={ClipboardDocumentListIcon}
          iconColor="bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
          badge={
            <span className="ml-1.5 text-xs text-zinc-400">
              {deliverablesProgress.done}/{deliverablesProgress.total}
            </span>
          }
          defaultOpen
        >
          {enrollment.submissions.map((submission, index) => (
            <DeliverableRow
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

          {/* Batch Submit */}
          {canSubmit && pendingSubmissions.size > 0 && (
            <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
              <Button
                color="emerald"
                className="w-full"
                onClick={handleSubmitAll}
                disabled={submitting}
              >
                <CheckCircleIcon className="size-4" />
                {submitting
                  ? "Submitting..."
                  : `Submit ${pendingSubmissions.size} deliverable${pendingSubmissions.size > 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </CollapsibleCard>
      )}

      {/* ================================================================== */}
      {/* OCR VERIFICATION */}
      {/* ================================================================== */}
      {enrollment.ocrData && (
        <CollapsibleCard
          title="Order Verification"
          icon={ShieldCheckIcon}
          iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
          badge={
            enrollment.ocrData.confidence !== undefined && (
              <Badge
                color={enrollment.ocrData.confidence > 0.8 ? "emerald" : "amber"}
                className="ml-1.5 text-[10px]"
              >
                {Math.round(enrollment.ocrData.confidence * 100)}% match
              </Badge>
            )
          }
          defaultOpen={false}
        >
          <div className="p-4">
            {enrollment.ocrData.screenshotUrl && (
              <a
                href={enrollment.ocrData.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
              >
                <img
                  src={enrollment.ocrData.screenshotUrl}
                  alt="Order screenshot"
                  className="w-full object-cover"
                />
              </a>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {enrollment.ocrData.extractedOrderId && (
                <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <p className="text-[10px] text-zinc-400">Order ID</p>
                  <p className="font-mono text-xs font-medium text-zinc-900 dark:text-white">
                    {enrollment.ocrData.extractedOrderId}
                  </p>
                </div>
              )}
              {enrollment.ocrData.extractedPlatform && (
                <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                  <p className="text-[10px] text-zinc-400">Platform</p>
                  <p className="text-xs font-medium capitalize text-zinc-900 dark:text-white">
                    {enrollment.ocrData.extractedPlatform}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleCard>
      )}

      {/* ================================================================== */}
      {/* ORDER DETAILS */}
      {/* ================================================================== */}
      <CollapsibleCard
        title="Order Details"
        icon={ShoppingBagIcon}
        iconColor="bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400"
        defaultOpen={false}
      >
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {[
            { label: "Order ID", value: `#${enrollment.orderId}`, mono: true },
            { label: "Order Value", value: formatCurrency(enrollment.orderValueDecimal) },
            {
              label: "Cashback Rate",
              value: `${enrollment.lockedRebatePercentage}%`,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            enrollment.lockedBonusAmountDecimal &&
              Number(enrollment.lockedBonusAmountDecimal) > 0 && {
                label: "Bonus",
                value: `+${formatCurrency(enrollment.lockedBonusAmountDecimal)}`,
                color: "text-emerald-600 dark:text-emerald-400",
              },
            { label: "Purchase Date", value: formatDate(enrollment.purchaseDate) },
            { label: "Enrolled On", value: formatDate(enrollment.createdAt) },
            enrollment.expiresAt && { label: "Deadline", value: formatDate(enrollment.expiresAt) },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-zinc-500">{(item as any).label}</span>
                <span
                  className={clsx(
                    "text-xs font-medium",
                    (item as any).mono && "font-mono",
                    (item as any).color || "text-zinc-900 dark:text-white"
                  )}
                >
                  {(item as any).value}
                </span>
              </div>
            ))}
        </div>
      </CollapsibleCard>

      {/* ================================================================== */}
      {/* ACTIVITY */}
      {/* ================================================================== */}
      {enrollment.history && enrollment.history.length > 0 && (
        <CollapsibleCard
          title="Activity"
          icon={ClockIcon}
          iconColor="bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400"
          defaultOpen={false}
        >
          <MiniTimeline history={enrollment.history} />
        </CollapsibleCard>
      )}

      {/* ================================================================== */}
      {/* HELP */}
      {/* ================================================================== */}
      <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50">
          <ChatBubbleLeftRightIcon className="size-5 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            Need help?
          </p>
          <p className="text-xs text-zinc-500">
            Contact support for any questions about this enrollment.
          </p>
        </div>
        <ChevronRightIcon className="size-4 text-zinc-400" />
      </div>

      {/* ================================================================== */}
      {/* STICKY ACTION BAR (Mobile) */}
      {/* ================================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur-sm lg:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="flex gap-2">
          <Button href={`/campaigns/${enrollment.campaignId}`} outline className="flex-1">
            <ShoppingBagIcon className="size-4" />
            Campaign
          </Button>

          {enrollment.status === "changes_requested" && enrollment.canResubmit && (
            <Button
              color="emerald"
              className="flex-1"
              onClick={() => setShowResubmitDialog(true)}
            >
              <ArrowPathIcon className="size-4" />
              Resubmit
            </Button>
          )}

          {enrollment.status === "awaiting_submission" && (
            <Button
              outline
              className="flex-1 text-red-600 dark:text-red-400"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <XMarkIcon className="size-4" />
              Withdraw
            </Button>
          )}

          {(enrollment.status === "approved" ||
            enrollment.status === "permanently_rejected" ||
            enrollment.status === "withdrawn" ||
            enrollment.status === "expired" ||
            enrollment.status === "awaiting_review") && (
            <Button plain className="flex-1" onClick={() => refetch()}>
              <ArrowPathIcon className="size-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* DESKTOP ACTIONS */}
      {/* ================================================================== */}
      <div className="hidden space-y-2 lg:block">
        <Button href={`/campaigns/${enrollment.campaignId}`} outline className="w-full">
          <ShoppingBagIcon className="size-4" />
          View Campaign
        </Button>

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

      {/* ================================================================== */}
      {/* DIALOGS */}
      {/* ================================================================== */}

      {/* Withdraw */}
      <Dialog open={showWithdrawDialog} onClose={() => setShowWithdrawDialog(false)} size="sm">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4">Withdraw?</DialogTitle>
          <DialogDescription className="mt-1">
            You'll lose potential earnings from this campaign. This cannot be undone.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
          <Button color="red" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resubmit */}
      <Dialog open={showResubmitDialog} onClose={() => setShowResubmitDialog(false)} size="sm">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <ArrowPathIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="mt-4">Resubmit?</DialogTitle>
          <DialogDescription className="mt-1">
            Make sure you've addressed all feedback before resubmitting.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowResubmitDialog(false)}>Cancel</Button>
          <Button color="emerald" onClick={handleResubmit} disabled={resubmitting}>
            {resubmitting ? "Submitting..." : "Resubmit"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}