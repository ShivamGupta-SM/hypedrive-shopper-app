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
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CubeIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  PhotoIcon,
  ShieldCheckIcon,
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
      <div className="space-y-4">
        {/* Hero Card Skeleton */}
        <BoxSkeleton height={320} borderRadius={12} />

        {/* Progress Skeleton */}
        <BoxSkeleton height={100} borderRadius={12} />

        {/* Deliverables Skeleton */}
        <BoxSkeleton height={200} borderRadius={12} />

        {/* Activity Skeleton */}
        <BoxSkeleton height={150} borderRadius={12} />
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
// COMPACT PROGRESS STEPPER (Horizontal)
// ============================================================================

function ProgressStepper({
  status,
}: {
  status: EnrollmentStatusType;
}) {
  const steps = [
    { key: "enrolled", label: "Enrolled", icon: ShoppingCartIcon },
    { key: "submitted", label: "Submit", icon: CameraIcon },
    { key: "review", label: "Review", icon: DocumentCheckIcon },
    { key: "paid", label: "Paid", icon: BanknotesIcon },
  ];

  // Determine current step
  let currentStepIndex = 0;
  if (status === "awaiting_submission" || status === "changes_requested") {
    currentStepIndex = 1;
  } else if (status === "awaiting_review") {
    currentStepIndex = 2;
  } else if (status === "approved") {
    currentStepIndex = 4; // All complete
  }

  const isRejected =
    status === "permanently_rejected" ||
    status === "withdrawn" ||
    status === "expired";

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isComplete = currentStepIndex > index;
        const isCurrent = currentStepIndex === index + 1;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-zinc-900 text-white ring-2 ring-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:ring-white/20"
                      : isRejected && index >= 1
                        ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {isComplete ? (
                  <CheckCircleIcon className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-medium ${
                  isComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isCurrent
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  isComplete
                    ? "bg-emerald-500"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// DEADLINE COUNTDOWN
// ============================================================================

function DeadlineCountdown({
  expiresAt,
  status,
}: {
  expiresAt?: string;
  status: EnrollmentStatusType;
}) {
  const { daysRemaining, isUrgent, isExpired } = useMemo(() => {
    if (!expiresAt)
      return { daysRemaining: null, isUrgent: false, isExpired: false };

    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
      return { daysRemaining: 0, isUrgent: true, isExpired: true };
    }

    return {
      daysRemaining: diff,
      isUrgent: diff <= 3,
      isExpired: false,
    };
  }, [expiresAt]);

  if (!expiresAt || status === "approved" || status === "permanently_rejected") {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${
        isExpired
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          : isUrgent
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      <ClockIcon className="size-3.5" />
      {isExpired
        ? "Expired"
        : daysRemaining === 0
          ? "Due Today"
          : daysRemaining === 1
            ? "1 day left"
            : `${daysRemaining} days left`}
    </div>
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

  // Deliverable icon based on name/type
  const DeliverableIcon = useMemo(() => {
    const name = deliverable.deliverableName.toLowerCase();
    if (name.includes("youtube") || name.includes("video")) {
      return CameraIcon;
    }
    if (name.includes("instagram") || name.includes("story") || name.includes("reel")) {
      return CameraIcon;
    }
    if (name.includes("review") || name.includes("rating")) {
      return ChatBubbleLeftRightIcon;
    }
    if (name.includes("unbox")) {
      return CubeIcon;
    }
    return ClipboardDocumentListIcon;
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
        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
          isSubmitted
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {/* Number */}
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {index + 1}
        </div>

        {/* Icon */}
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
            isSubmitted
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {isSubmitted ? (
            <CheckCircleIcon className="size-4" />
          ) : (
            <DeliverableIcon className="size-4" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {deliverable.deliverableName}
            </p>
            {deliverable.isRequired && (
              <span className="rounded bg-red-100 px-1 py-0.5 text-[9px] font-bold uppercase text-red-600 dark:bg-red-900/50 dark:text-red-400">
                Required
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            {deliverable.requireLink && (
              <span className="flex items-center gap-1">
                <LinkIcon className="size-3" /> Link
              </span>
            )}
            {deliverable.requireScreenshot && (
              <span className="flex items-center gap-1">
                <PhotoIcon className="size-3" /> Screenshot
              </span>
            )}
            {isSubmitted && deliverable.submittedAt && (
              <span className="text-emerald-600 dark:text-emerald-400">
                Submitted {formatRelativeTime(deliverable.submittedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {canSubmit && (
          <div className="flex items-center gap-1.5">
            {isSubmitted ? (
              <Button
                outline
                className="h-8 px-2.5 text-xs"
                onClick={() => setShowDialog(true)}
              >
                <ArrowPathIcon className="size-3.5" />
              </Button>
            ) : (
              <Button
                color="dark/zinc"
                className="h-8 px-2.5 text-xs"
                onClick={() => setShowDialog(true)}
              >
                <ArrowUpTrayIcon className="size-3.5" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="flex size-8 items-center justify-center rounded-lg text-red-500 dark:text-red-400"
              >
                <XCircleIcon className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* View proof links if submitted and not editable */}
        {isSubmitted && !canSubmit && (
          <div className="flex items-center gap-1.5">
            {deliverable.proofLink && (
              <a
                href={deliverable.proofLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <ArrowTopRightOnSquareIcon className="size-4" />
              </a>
            )}
          </div>
        )}
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
// OCR DATA CARD (Compact)
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
  return (
    <div className="p-4">
      <div className="grid gap-2 sm:grid-cols-2">
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
        {ocrData.confidence !== undefined && (
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Match Confidence
            </p>
            <p
              className={`mt-0.5 text-sm font-medium ${
                ocrData.confidence > 0.8
                  ? "text-emerald-600 dark:text-emerald-400"
                  : ocrData.confidence > 0.5
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {Math.round(ocrData.confidence * 100)}%
            </p>
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
  // Type assertion for productImage until api-client.ts is regenerated
  const productImage = (enrollment.campaign as { productImage?: string })?.productImage;
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
            {/* Top Section: Product + Status */}
            <div className="flex items-start gap-3 p-4 sm:gap-4 lg:p-5">
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
                {/* Status + Deadline Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={statusConfig?.color || "zinc"}>
                    {statusConfig?.icon && (
                      <statusConfig.icon className="mr-1 size-3" />
                    )}
                    {statusConfig?.label}
                  </Badge>
                  <DeadlineCountdown
                    expiresAt={enrollment.expiresAt}
                    status={enrollment.status}
                  />
                </div>

                {/* Campaign Title */}
                <Link
                  href={`/campaigns/${enrollment.campaignId}`}
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-zinc-900 lg:mt-2 lg:text-base dark:text-white"
                >
                  {enrollment.campaign.title}
                  <ChevronRightIcon className="size-3.5 text-zinc-400 lg:size-4" />
                </Link>

                {/* Order Info */}
                <p className="mt-0.5 text-xs text-zinc-500 lg:mt-1 lg:text-sm dark:text-zinc-400">
                  Order #{enrollment.orderId}
                  {enrollment.purchaseDate && ` · ${formatDate(enrollment.purchaseDate)}`}
                </p>

                {/* Status Message (Desktop only) */}
                {statusConfig?.message && (
                  <p className="mt-2 hidden text-sm text-zinc-600 lg:block dark:text-zinc-400">
                    {statusConfig.message}
                  </p>
                )}
              </div>
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

            {/* Progress Stepper */}
            <div className="border-t border-zinc-100 px-4 py-4 lg:px-5 lg:py-5 dark:border-zinc-800">
              <ProgressStepper status={enrollment.status} />
            </div>
          </div>

          {/* DELIVERABLES - Only on left column on desktop */}
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

          {/* OCR VERIFICATION - Desktop only (moved inside left column) */}
          {enrollment.ocrData && (
            <div className="hidden lg:block">
              <CollapsibleSection
                title="Order Verification"
                icon={ShieldCheckIcon}
                iconColor="text-emerald-500"
                defaultOpen={false}
                badge={
                  enrollment.ocrData.confidence !== undefined && (
                    <Badge
                      color={
                        enrollment.ocrData.confidence > 0.8
                          ? "emerald"
                          : enrollment.ocrData.confidence > 0.5
                            ? "amber"
                            : "red"
                      }
                    >
                      {Math.round(enrollment.ocrData.confidence * 100)}%
                    </Badge>
                  )
                }
              >
                <OCRDataCard ocrData={enrollment.ocrData} />
              </CollapsibleSection>
            </div>
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

          {/* OCR VERIFICATION - Mobile only (desktop shows in left column) */}
          {enrollment.ocrData && (
            <div className="lg:hidden">
              <CollapsibleSection
                title="Order Verification"
                icon={ShieldCheckIcon}
                iconColor="text-emerald-500"
                defaultOpen={false}
                badge={
                  enrollment.ocrData.confidence !== undefined && (
                    <Badge
                      color={
                        enrollment.ocrData.confidence > 0.8
                          ? "emerald"
                          : enrollment.ocrData.confidence > 0.5
                            ? "amber"
                            : "red"
                      }
                    >
                      {Math.round(enrollment.ocrData.confidence * 100)}%
                    </Badge>
                  )
                }
              >
                <OCRDataCard ocrData={enrollment.ocrData} />
              </CollapsibleSection>
            </div>
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
            <Button
              href={`/campaigns/${enrollment.campaignId}`}
              outline
              className="w-full"
            >
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
