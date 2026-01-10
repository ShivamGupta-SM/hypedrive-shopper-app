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
  ArrowPathIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  ShoppingBagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";

type EnrollmentStatus = shared.EnrollmentStatus;

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

function getStatusConfig(status: EnrollmentStatus): {
  color: "emerald" | "amber" | "red" | "zinc" | "sky";
  label: string;
  icon: typeof CheckCircleIcon;
  bgColor: string;
} {
  const configs: Record<
    EnrollmentStatus,
    {
      color: "emerald" | "amber" | "red" | "zinc" | "sky";
      label: string;
      icon: typeof CheckCircleIcon;
      bgColor: string;
    }
  > = {
    awaiting_submission: {
      color: "amber",
      label: "Awaiting Submission",
      icon: DocumentTextIcon,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    awaiting_review: {
      color: "sky",
      label: "Under Review",
      icon: ClockIcon,
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
    },
    changes_requested: {
      color: "amber",
      label: "Changes Requested",
      icon: ExclamationTriangleIcon,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    approved: {
      color: "emerald",
      label: "Approved",
      icon: CheckCircleIcon,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    permanently_rejected: {
      color: "red",
      label: "Rejected",
      icon: XCircleIcon,
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    withdrawn: {
      color: "zinc",
      label: "Withdrawn",
      icon: XMarkIcon,
      bgColor: "bg-zinc-100 dark:bg-zinc-800/50",
    },
    expired: {
      color: "zinc",
      label: "Expired",
      icon: ClockIcon,
      bgColor: "bg-zinc-100 dark:bg-zinc-800/50",
    },
  };
  return (
    configs[status] || {
      color: "zinc",
      label: status,
      icon: ClockIcon,
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
    }
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 dark:border-emerald-800 dark:border-t-emerald-400" />
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Loading enrollment...
      </p>
    </div>
  );
}

function DataCell({
  icon: Icon,
  label,
  value,
  valueColor,
  iconColor = "sky",
}: {
  icon: typeof CheckCircleIcon;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  iconColor?: "orange" | "emerald" | "amber" | "sky";
}) {
  const iconStyles = {
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/50",
      text: "text-orange-600 dark:text-orange-400",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-600 dark:text-amber-400",
    },
    sky: {
      bg: "bg-sky-50 dark:bg-sky-950/50",
      text: "text-sky-600 dark:text-sky-400",
    },
  }[iconColor];

  return (
    <div className="flex items-start gap-3">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconStyles.bg}`}>
        <Icon className={`size-4 ${iconStyles.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-medium ${valueColor || "text-zinc-900 dark:text-white"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface DeliverableSubmission {
  campaignDeliverableId: string;
  proofLink?: string;
  proofScreenshot?: string;
}

function DeliverableCard({
  deliverable,
  enrollmentStatus,
  onSubmit,
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
  enrollmentStatus: EnrollmentStatus;
  onSubmit: (submission: DeliverableSubmission) => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [proofLink, setProofLink] = useState(deliverable.proofLink || "");
  const [proofScreenshot, setProofScreenshot] = useState(
    deliverable.proofScreenshot || ""
  );

  const isSubmitted = !!(deliverable.proofLink || deliverable.proofScreenshot);
  const canSubmit =
    enrollmentStatus === "awaiting_submission" ||
    enrollmentStatus === "changes_requested";

  const handleSubmit = () => {
    onSubmit({
      campaignDeliverableId: deliverable.campaignDeliverableId,
      proofLink: proofLink || undefined,
      proofScreenshot: proofScreenshot || undefined,
    });
    setShowDialog(false);
  };

  return (
    <>
      <div
        className={`rounded-xl border p-3 sm:p-4 ${
          isSubmitted
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:items-center sm:gap-3">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 ${
                isSubmitted
                  ? "bg-emerald-100 dark:bg-emerald-900"
                  : "bg-amber-50 dark:bg-amber-950/50"
              }`}
            >
              {isSubmitted ? (
                <CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <DocumentTextIcon className="size-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-900 sm:text-sm dark:text-white">
                {deliverable.deliverableName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {deliverable.isRequired && (
                  <Badge color="red" className="text-[9px] sm:text-[10px]">
                    Required
                  </Badge>
                )}
                {deliverable.requireLink && (
                  <span className="flex items-center gap-1 text-[9px] text-zinc-500 sm:text-[10px] dark:text-zinc-400">
                    <LinkIcon className="size-2.5 sm:size-3" /> Link
                  </span>
                )}
                {deliverable.requireScreenshot && (
                  <span className="flex items-center gap-1 text-[9px] text-zinc-500 sm:text-[10px] dark:text-zinc-400">
                    <CameraIcon className="size-2.5 sm:size-3" /> Screenshot
                  </span>
                )}
              </div>
            </div>
          </div>
          {isSubmitted && (
            <Badge color="emerald" className="shrink-0 text-[9px] sm:text-[10px]">
              Done
            </Badge>
          )}
        </div>

        {deliverable.instructions && (
          <div className="mt-2.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[10px] text-zinc-600 sm:mt-3 sm:px-3 sm:py-2 sm:text-xs dark:bg-zinc-800 dark:text-zinc-400">
            {deliverable.instructions}
          </div>
        )}

        {isSubmitted && (
          <div className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
            {deliverable.proofLink && (
              <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 dark:bg-zinc-900">
                <LinkIcon className="size-3 shrink-0 text-zinc-400" />
                <a
                  href={deliverable.proofLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-[10px] text-zinc-600 hover:underline sm:text-xs dark:text-zinc-400"
                >
                  {deliverable.proofLink}
                </a>
              </div>
            )}
            {deliverable.proofScreenshot && (
              <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 dark:bg-zinc-900">
                <PhotoIcon className="size-3 shrink-0 text-zinc-400" />
                <a
                  href={deliverable.proofScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-zinc-600 hover:underline sm:text-xs dark:text-zinc-400"
                >
                  View Screenshot
                </a>
              </div>
            )}
            {deliverable.submittedAt && (
              <p className="text-[9px] text-zinc-400 sm:text-[10px]">
                Submitted {formatDateTime(deliverable.submittedAt)}
              </p>
            )}
          </div>
        )}

        {canSubmit && (
          <Button
            outline
            className="mt-2.5 w-full text-xs sm:mt-3 sm:text-sm"
            onClick={() => setShowDialog(true)}
          >
            {isSubmitted ? "Update" : "Submit Proof"}
          </Button>
        )}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} size="md">
        <DialogTitle className="text-base sm:text-lg">{deliverable.deliverableName}</DialogTitle>
        <DialogDescription className="text-xs sm:text-sm">
          {deliverable.instructions ||
            "Provide proof of completion for this deliverable."}
        </DialogDescription>
        <DialogBody>
          <div className="space-y-4">
            {deliverable.requireLink && (
              <Field>
                <Label className="text-xs sm:text-sm">Proof Link</Label>
                <div className="mt-1.5 sm:mt-2">
                  <Input
                    type="url"
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
                  Paste the link to your completed deliverable
                </p>
              </Field>
            )}
            {deliverable.requireScreenshot && (
              <Field>
                <Label className="text-xs sm:text-sm">Screenshot URL</Label>
                <div className="mt-1.5 sm:mt-2">
                  <Input
                    type="url"
                    value={proofScreenshot}
                    onChange={(e) => setProofScreenshot(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
                  Upload to Imgur or any image hosting service
                </p>
              </Field>
            )}

            {/* Preview section */}
            {proofScreenshot && (
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 sm:text-xs">Preview</div>
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={proofScreenshot}
                    alt="Screenshot preview"
                    className="size-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            color="zinc"
            onClick={handleSubmit}
            disabled={
              (deliverable.requireLink && !proofLink) ||
              (deliverable.requireScreenshot && !proofScreenshot)
            }
          >
            <CheckCircleIcon className="size-4" />
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function StatusTimeline({
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
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-3">
          {index < history.length - 1 && (
            <div className="absolute left-[9px] top-5 h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />
          )}
          <div
            className={`relative z-10 mt-0.5 size-5 shrink-0 rounded-full border-2 ${
              entry.toStatus === "approved"
                ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900"
                : entry.toStatus === "permanently_rejected"
                  ? "border-red-500 bg-red-100 dark:bg-red-900"
                  : "border-zinc-400 bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <div
              className={`absolute inset-1 rounded-full ${
                entry.toStatus === "approved"
                  ? "bg-emerald-500"
                  : entry.toStatus === "permanently_rejected"
                    ? "bg-red-500"
                    : "bg-zinc-500"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1 pb-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {entry.toStatus
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDateTime(entry.changedAt)}
              {entry.changedByName && ` · ${entry.changedByName}`}
            </p>
            {entry.reason && (
              <p className="mt-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {entry.reason}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<
    Map<string, DeliverableSubmission>
  >(new Map());

  const statusConfig = useMemo(() => {
    if (!enrollment) return null;
    return getStatusConfig(enrollment.status);
  }, [enrollment?.status]);

  const daysRemaining = useMemo(() => {
    if (!enrollment?.expiresAt) return null;
    const expires = new Date(enrollment.expiresAt);
    const now = new Date();
    const diff = Math.ceil(
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/50">
          <ShoppingBagIcon className="size-7 text-red-400" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
          Enrollment not found
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          The enrollment you're looking for doesn't exist.
        </p>
        <Button className="mt-4" onClick={() => navigate("/enrollments")} color="red">
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const estimatedPayout =
    pricing?.formatted?.shopperPayout ||
    (parseFloat(enrollment.orderValueDecimal) *
      enrollment.lockedRebatePercentage) /
      100 +
      (enrollment.lockedBonusAmountDecimal
        ? parseFloat(enrollment.lockedBonusAmountDecimal)
        : 0);

  return (
    <div className="space-y-5">
      {/* Two Column Layout */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Content - 2 cols */}
        <div className="space-y-5 lg:col-span-2">
          {/* Status Header Card */}
          <div
            className={`overflow-hidden rounded-xl ${statusConfig?.bgColor || "bg-zinc-50"}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {statusConfig && (
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        statusConfig.color === "emerald"
                          ? "bg-emerald-100 dark:bg-emerald-900"
                          : statusConfig.color === "amber"
                            ? "bg-amber-100 dark:bg-amber-900"
                            : statusConfig.color === "red"
                              ? "bg-red-100 dark:bg-red-900"
                              : statusConfig.color === "sky"
                                ? "bg-sky-100 dark:bg-sky-900"
                                : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    >
                      <statusConfig.icon
                        className={`size-5 ${
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
                  )}
                  <div>
                    <Badge color={statusConfig?.color || "zinc"}>
                      {statusConfig?.label}
                    </Badge>
                    <Heading className="mt-1">Order #{enrollment.orderId}</Heading>
                  </div>
                </div>
                <Button plain onClick={() => refetch()}>
                  <ArrowPathIcon className="size-4" />
                </Button>
              </div>

              {/* Action Messages */}
              {enrollment.status === "awaiting_submission" && (
                <div className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  <strong>Action Required:</strong> Submit your deliverables.
                  {daysRemaining !== null &&
                    daysRemaining <= 7 &&
                    ` ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining.`}
                </div>
              )}

              {enrollment.status === "changes_requested" &&
                enrollment.rejection && (
                  <div className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    <strong>Changes Needed:</strong> {enrollment.rejection.reason}
                  </div>
                )}

              {enrollment.status === "approved" && (
                <div className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                  Your enrollment has been approved! Earnings will be credited to
                  your wallet.
                </div>
              )}

              {enrollment.status === "permanently_rejected" &&
                enrollment.rejection && (
                  <div className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-200">
                    <strong>Rejected:</strong> {enrollment.rejection.reason}
                  </div>
                )}
            </div>
          </div>

          {/* Order Details Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <InformationCircleIcon className="size-4 text-zinc-400" />
              <Subheading className="text-sm">Order Details</Subheading>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <DataCell
                icon={ShoppingBagIcon}
                label="Campaign"
                iconColor="orange"
                value={
                  <Link
                    href={`/campaigns/${enrollment.campaignId}`}
                    className="hover:underline"
                  >
                    {enrollment.campaign.title}
                  </Link>
                }
              />
              <DataCell
                icon={CurrencyRupeeIcon}
                label="Order Value"
                iconColor="emerald"
                value={formatCurrency(enrollment.orderValueDecimal)}
              />
              <DataCell
                icon={CalendarDaysIcon}
                label="Purchase Date"
                iconColor="amber"
                value={formatDate(enrollment.purchaseDate)}
              />
              <DataCell
                icon={ClockIcon}
                label="Enrolled"
                iconColor="sky"
                value={formatDate(enrollment.createdAt)}
              />
            </div>
          </div>

          {/* Deliverables Card */}
          {enrollment.submissions && enrollment.submissions.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <DocumentTextIcon className="size-4 text-zinc-400" />
                <Subheading className="text-sm">Deliverables</Subheading>
                <span className="ml-auto text-xs text-zinc-400">
                  {
                    enrollment.submissions.filter(
                      (s) => s.proofLink || s.proofScreenshot
                    ).length
                  }
                  /{enrollment.submissions.length} done
                </span>
              </div>
              <div className="space-y-3 p-4">
                {enrollment.submissions.map((submission) => (
                  <DeliverableCard
                    key={submission.id}
                    deliverable={submission}
                    enrollmentStatus={enrollment.status}
                    onSubmit={handleDeliverableSubmit}
                  />
                ))}

                {canSubmit && pendingSubmissions.size > 0 && (
                  <Button
                    color="sky"
                    className="w-full"
                    onClick={handleSubmitAll}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : `Submit ${pendingSubmissions.size} Deliverable${pendingSubmissions.size > 1 ? "s" : ""}`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* OCR Verification Card */}
          {enrollment.ocrData && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <PhotoIcon className="size-4 text-zinc-400" />
                <Subheading className="text-sm">Order Verification</Subheading>
              </div>
              <div className="p-4">
                {enrollment.ocrData.screenshotUrl && (
                  <a
                    href={enrollment.ocrData.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <img
                      src={enrollment.ocrData.screenshotUrl}
                      alt="Order Screenshot"
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover"
                    />
                  </a>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {enrollment.ocrData.extractedOrderId && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        Extracted Order ID
                      </p>
                      <p className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-white">
                        {enrollment.ocrData.extractedOrderId}
                      </p>
                    </div>
                  )}
                  {enrollment.ocrData.confidence !== undefined && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                        Confidence
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-900 dark:text-white">
                        {Math.round(enrollment.ocrData.confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status History Card */}
          {enrollment.history && enrollment.history.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <ClockIcon className="size-4 text-zinc-400" />
                <Subheading className="text-sm">Activity</Subheading>
              </div>
              <div className="p-4">
                <StatusTimeline history={enrollment.history} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-5">
          {/* Earnings Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <CurrencyRupeeIcon className="size-4 text-zinc-400" />
              <Subheading className="text-sm">Earnings</Subheading>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Order Value
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {formatCurrency(enrollment.orderValueDecimal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Cashback
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {enrollment.lockedRebatePercentage}%
                  </span>
                </div>
                {enrollment.lockedBonusAmountDecimal &&
                  Number(enrollment.lockedBonusAmountDecimal) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Bonus
                      </span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(enrollment.lockedBonusAmountDecimal)}
                      </span>
                    </div>
                  )}
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {enrollment.status === "approved" ? "Earned" : "Estimated"}
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(estimatedPayout)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <InformationCircleIcon className="size-4 text-zinc-400" />
              <Subheading className="text-sm">Status</Subheading>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Status
                  </span>
                  <Badge color={statusConfig?.color || "zinc"}>
                    {statusConfig?.label}
                  </Badge>
                </div>

                {enrollment.expiresAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Expires
                    </span>
                    <span
                      className={`font-medium ${
                        daysRemaining !== null && daysRemaining <= 3
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {formatDate(enrollment.expiresAt)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Rejections
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {enrollment.rejectionCount}
                  </span>
                </div>

                {enrollment.canResubmit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Can Resubmit
                    </span>
                    <Badge color="amber">Yes</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              href={`/campaigns/${enrollment.campaignId}`}
              outline
              className="w-full"
            >
              View Campaign
            </Button>

            {enrollment.status === "awaiting_submission" && (
              <Button
                outline
                className="w-full text-red-600 dark:text-red-400"
                onClick={() => setShowWithdrawDialog(true)}
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4 text-base sm:text-lg">Withdraw Enrollment?</DialogTitle>
          <DialogDescription className="mt-2 text-xs sm:text-sm">
            Are you sure you want to withdraw? This action cannot be undone and you
            will lose any potential earnings from this campaign.
          </DialogDescription>
        </div>
        <DialogActions>
          <Button plain onClick={() => setShowWithdrawDialog(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleWithdraw} disabled={withdrawing}>
            <XMarkIcon className="size-4" />
            {withdrawing ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
