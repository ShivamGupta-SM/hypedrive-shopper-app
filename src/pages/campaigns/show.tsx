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
import { Input, InputGroup } from "@/components/input";
import { Text } from "@/components/text";
import {
  useCampaign,
  useCampaignPricing,
  useAvailableCoupons,
  useProductById,
  usePlatform,
  useCampaignDeliverables,
} from "@/hooks/use-api";
import { getAuthenticatedClient, type enrollments } from "@/lib/client";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  InformationCircleIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
  ChevronRightIcon,
  StarIcon,
  ShoppingCartIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  PhotoIcon,
  LinkIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ShareIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  TruckIcon,
} from "@heroicons/react/16/solid";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: "emerald" | "amber" | "red" | "zinc" | "sky"; label: string }> = {
    active: { color: "emerald", label: "Active" },
    paused: { color: "amber", label: "Paused" },
    ended: { color: "zinc", label: "Ended" },
    cancelled: { color: "red", label: "Cancelled" },
    draft: { color: "zinc", label: "Draft" },
    pending_approval: { color: "amber", label: "Pending" },
    approved: { color: "sky", label: "Approved" },
  };

  const { color, label } = config[status] || { color: "zinc" as const, label: status };

  return <Badge color={color}>{label}</Badge>;
}

function CampaignTypeBadge({ type }: { type: string }) {
  const config: Record<string, { color: "emerald" | "amber" | "sky"; label: string; icon: typeof BanknotesIcon }> = {
    cashback: { color: "emerald", label: "Cashback", icon: BanknotesIcon },
    barter: { color: "amber", label: "Barter", icon: GiftIcon },
    hybrid: { color: "sky", label: "Hybrid", icon: SparklesIcon },
  };

  const { color, label, icon: Icon } = config[type] || { color: "zinc" as const, label: type, icon: TagIcon };

  return (
    <Badge color={color} className="inline-flex items-center gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="size-12 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading campaign...</p>
    </div>
  );
}

function DeliverableIcon({ category }: { category: string }) {
  const icons: Record<string, typeof PhotoIcon> = {
    review: ChatBubbleLeftRightIcon,
    social_post: ShareIcon,
    video: VideoCameraIcon,
    photo: PhotoIcon,
    referral: UserGroupIcon,
    other: ClipboardDocumentListIcon,
  };
  const Icon = icons[category] || ClipboardDocumentListIcon;
  return <Icon className="size-5" />;
}

function PlatformIcon({ type }: { type?: string }) {
  const icons: Record<string, typeof BuildingStorefrontIcon> = {
    marketplace: BuildingStorefrontIcon,
    ecommerce: ShoppingCartIcon,
    social: ShareIcon,
    delivery: TruckIcon,
    grocery: ShoppingBagIcon,
    fashion: SparklesIcon,
    electronics: CubeIcon,
    beauty: SparklesIcon,
    food: ShoppingBagIcon,
  };
  const Icon = icons[type || ""] || BuildingStorefrontIcon;
  return <Icon className="size-5" />;
}

function PayoutCalculator({
  campaignId,
  rebatePercentage,
  bonusAmount,
}: {
  campaignId: string;
  rebatePercentage?: number;
  bonusAmount?: string;
}) {
  const [orderValue, setOrderValue] = useState("");
  const [estimatedPayout, setEstimatedPayout] = useState<{
    shopperPayout: number;
    shopperPayoutDecimal: string;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculatePayout = async () => {
    const value = parseFloat(orderValue);
    if (!value || value <= 0) return;

    setCalculating(true);
    try {
      const client = getAuthenticatedClient();
      const result = await client.campaigns.calculatePayoutEstimate(campaignId, {
        orderValue: Math.round(value * 100),
      });
      setEstimatedPayout(result);
    } catch {
      const rebate = (value * (rebatePercentage || 0)) / 100;
      const bonus = bonusAmount ? parseFloat(bonusAmount) : 0;
      setEstimatedPayout({
        shopperPayout: Math.round((rebate + bonus) * 100),
        shopperPayoutDecimal: (rebate + bonus).toFixed(2),
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
          <CurrencyRupeeIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <Subheading>Payout Calculator</Subheading>
      </div>

      <Text className="text-xs">Enter your order value to estimate cashback</Text>

      <div className="flex gap-2">
        <div className="flex-1">
          <InputGroup>
            <CurrencyRupeeIcon />
            <Input
              name="orderValue"
              type="number"
              placeholder="Order value"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculatePayout()}
            />
          </InputGroup>
        </div>
        <Button onClick={calculatePayout} disabled={calculating || !orderValue} color="dark/zinc">
          {calculating ? "..." : "Calculate"}
        </Button>
      </div>

      {estimatedPayout && (
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Estimated Cashback
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{estimatedPayout.shopperPayoutDecimal}
          </p>
        </div>
      )}
    </div>
  );
}

function CouponCard({
  coupon,
}: {
  coupon: {
    code: string;
    bonusAmountDecimal: string;
    currency: string;
    validUntil: string;
  };
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
          <GiftIcon className="size-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-mono text-sm font-bold text-amber-800 dark:text-amber-200">
            {coupon.code}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            +₹{coupon.bonusAmountDecimal} bonus
          </p>
        </div>
      </div>
      <Button plain onClick={copyCode} className="text-amber-700 dark:text-amber-300">
        {copied ? <CheckCircleIcon className="size-4" /> : "Copy"}
      </Button>
    </div>
  );
}

type EnrollmentStep = 1 | 2 | 3;
type ProcessingState = "idle" | "scanning" | "enrolling" | "success" | "error";

function StepIndicator({ currentStep }: { currentStep: EnrollmentStep }) {
  const steps = [
    { num: 1, label: "Purchase", icon: ShoppingCartIcon },
    { num: 2, label: "Upload", icon: CameraIcon },
    { num: 3, label: "Verify", icon: DocumentCheckIcon },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-2 py-4 sm:gap-4">
      {steps.map((step, idx) => {
        const isActive = step.num === currentStep;
        const isCompleted = step.num < currentStep;
        const isLast = idx === steps.length - 1;
        const StepIcon = step.icon;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full sm:size-12 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="size-5 sm:size-6" />
                ) : (
                  <StepIcon className="size-4 sm:size-5" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium sm:text-sm ${
                isActive ? "text-zinc-900 dark:text-white" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
              }`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-2 h-0.5 w-8 sm:mx-4 sm:w-16 ${
                step.num < currentStep ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EnrollmentDialog({
  open,
  onClose,
  campaignId,
  campaignTitle,
  onSuccess,
  rebatePercentage,
  bonusAmount,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onSuccess: (enrollmentId: string) => void;
  rebatePercentage?: number;
  bonusAmount?: string;
}) {
  const [step, setStep] = useState<EnrollmentStep>(1);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [scanResult, setScanResult] = useState<enrollments.ScanOrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetDialog = () => {
    setStep(1);
    setProcessingState("idle");
    setHasPurchased(false);
    setScreenshotUrl("");
    setCouponCode("");
    setScanResult(null);
    setError(null);
  };

  const handleClose = () => {
    if (processingState === "scanning" || processingState === "enrolling") return;
    resetDialog();
    onClose();
  };

  const handleScan = async () => {
    if (!screenshotUrl.trim()) {
      setError("Please enter a screenshot URL");
      return;
    }

    setProcessingState("scanning");
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.enrollments.scanOrder({
        campaignId,
        screenshotUrl: screenshotUrl.trim(),
      });

      setScanResult(result);

      if (result.status === "completed") {
        setProcessingState("idle");
        setStep(3);
      } else if (result.status === "failed") {
        const errorMsg = result.errorMessage || result.validation?.errors?.join(", ") || "Failed to scan receipt.";
        setError(errorMsg);
        setProcessingState("error");
      } else {
        setProcessingState("idle");
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt");
      setProcessingState("error");
    }
  };

  const handleEnroll = async () => {
    if (!scanResult?.scanId) {
      setError("No scan result available");
      return;
    }

    setProcessingState("enrolling");
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const enrollment = await client.enrollments.createEnrollment({
        scanId: scanResult.scanId,
        couponCode: couponCode.trim() || undefined,
      });

      setProcessingState("success");
      setTimeout(() => {
        onSuccess(enrollment.id);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create enrollment");
      setProcessingState("error");
    }
  };

  const isProcessing = processingState === "scanning" || processingState === "enrolling";

  return (
    <Dialog open={open} onClose={handleClose} size="xl">
      {processingState !== "success" && (
        <div className="-mx-4 -mt-4 border-b border-zinc-100 bg-zinc-50 sm:-mx-6 sm:-mt-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <StepIndicator currentStep={step} />
        </div>
      )}

      <div className={processingState !== "success" ? "pt-5" : ""}>
        <DialogTitle className="text-lg sm:text-xl">
          {step === 1 && "Make Your Purchase"}
          {step === 2 && processingState !== "scanning" && "Upload Receipt"}
          {step === 2 && processingState === "scanning" && "Scanning..."}
          {step === 3 && processingState !== "enrolling" && "Confirm Details"}
          {step === 3 && processingState === "enrolling" && "Creating Enrollment..."}
          {processingState === "success" && "You're Enrolled!"}
        </DialogTitle>
        <DialogDescription>
          {step === 1 && "Complete your purchase first, then continue to upload proof"}
          {step === 2 && processingState !== "scanning" && "Provide your order confirmation screenshot"}
          {step === 2 && processingState === "scanning" && "Analyzing your receipt..."}
          {step === 3 && processingState !== "enrolling" && "Review and confirm to complete enrollment"}
          {step === 3 && processingState === "enrolling" && "Setting up your enrollment..."}
          {processingState === "success" && "Complete your deliverables to earn cashback"}
        </DialogDescription>
      </div>

      <DialogBody>
        {/* Step 1: Purchase */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Earnings Preview */}
            <div className="rounded-2xl bg-zinc-900 p-5 text-white dark:bg-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10">
                  <BanknotesIcon className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Your potential earnings</p>
                  <p className="text-2xl font-bold">
                    {rebatePercentage || 0}% cashback
                    {bonusAmount && Number(bonusAmount) > 0 && (
                      <span className="ml-2 text-lg font-semibold text-emerald-400">+ ₹{bonusAmount}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm Purchase */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Before continuing, confirm:
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700"
                  checked={hasPurchased}
                  onChange={(e) => setHasPurchased(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    I have completed my purchase
                  </span>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    I have a screenshot showing Order ID and total amount
                  </p>
                </div>
              </label>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30">
              <InformationCircleIcon className="size-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <p className="text-sm text-sky-700 dark:text-sky-300">
                Take a screenshot of your order confirmation page showing the order ID and total amount.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Upload Receipt */}
        {step === 2 && processingState !== "scanning" && (
          <div className="space-y-5">
            <Field>
              <Label>Order Screenshot URL</Label>
              <div className="mt-2">
                <Input
                  type="url"
                  placeholder="https://imgur.com/your-receipt.jpg"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Upload to Imgur, Google Drive (public), or any image hosting service
              </p>
            </Field>

            {screenshotUrl && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                  Preview
                </div>
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={screenshotUrl}
                    alt="Receipt preview"
                    className="size-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </div>
            )}

            <Field>
              <Label>Coupon Code (Optional)</Label>
              <div className="mt-2">
                <InputGroup>
                  <GiftIcon />
                  <Input
                    type="text"
                    placeholder="Enter coupon for bonus"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </InputGroup>
              </div>
            </Field>

            {/* Tips */}
            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Tips for best results:</p>
              <ul className="mt-3 space-y-2">
                {["Clear, high-resolution screenshot", "Order ID clearly visible", "Total amount visible"].map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircleIcon className="size-4 text-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {error && processingState === "error" && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Upload failed</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanning State */}
        {processingState === "scanning" && (
          <div className="flex flex-col items-center py-16">
            <div className="size-14 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
            <p className="mt-5 text-lg font-medium text-zinc-900 dark:text-white">Analyzing your receipt...</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">This usually takes a few seconds</p>
          </div>
        )}

        {/* Step 3: Verify */}
        {step === 3 && processingState !== "enrolling" && processingState !== "success" && (
          <div className="space-y-5">
            {scanResult?.extractedData && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Extracted Details</p>
                  {scanResult.confidence !== undefined && (
                    <Badge color={scanResult.confidence > 0.8 ? "emerald" : scanResult.confidence > 0.5 ? "amber" : "red"}>
                      {Math.round(scanResult.confidence * 100)}% match
                    </Badge>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {scanResult.extractedData.orderId && (
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Order ID</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                        {scanResult.extractedData.orderId}
                      </p>
                    </div>
                  )}
                  {scanResult.extractedData.orderValue !== undefined && (
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Order Value</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                        ₹{(scanResult.extractedData.orderValue / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {scanResult.extractedData.purchaseDate && (
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Purchase Date</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                        {formatDate(scanResult.extractedData.purchaseDate)}
                      </p>
                    </div>
                  )}
                  {scanResult.extractedData.platform && (
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                      <p className="text-xs text-zinc-500">Platform</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-zinc-900 dark:text-white">
                        {scanResult.extractedData.platform}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {scanResult?.extractedData?.orderValue !== undefined && (
              <div className="rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Estimated Cashback</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(((scanResult.extractedData.orderValue / 100) * (rebatePercentage || 0)) / 100 + (bonusAmount ? parseFloat(bonusAmount) : 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-emerald-700 dark:text-emerald-300">
                    <p>{rebatePercentage || 0}% of ₹{(scanResult.extractedData.orderValue / 100).toFixed(2)}</p>
                    {bonusAmount && Number(bonusAmount) > 0 && <p>+ ₹{bonusAmount} bonus</p>}
                  </div>
                </div>
              </div>
            )}

            {couponCode && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                <GiftIcon className="size-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Coupon: </span>
                <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-200">{couponCode}</span>
              </div>
            )}

            {error && processingState === "error" && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Enrollment failed</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enrolling State */}
        {processingState === "enrolling" && (
          <div className="flex flex-col items-center py-16">
            <div className="size-14 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-500" />
            <p className="mt-5 text-lg font-medium text-zinc-900 dark:text-white">Creating your enrollment...</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Almost there!</p>
          </div>
        )}

        {/* Success State */}
        {processingState === "success" && (
          <div className="flex flex-col items-center py-12">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircleIcon className="size-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">You're enrolled!</p>
            <p className="mt-2 text-center text-zinc-500 dark:text-zinc-400">
              Complete your deliverables to earn cashback
            </p>

            {scanResult?.extractedData?.orderValue && (
              <div className="mt-6 w-full max-w-xs rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Campaign</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{campaignTitle}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Est. Cashback</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(((scanResult.extractedData.orderValue / 100) * (rebatePercentage || 0)) / 100 + (bonusAmount ? parseFloat(bonusAmount) : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <p className="mt-5 text-xs text-zinc-400">Redirecting to your enrollment...</p>
          </div>
        )}
      </DialogBody>

      <DialogActions>
        {step === 1 && (
          <>
            <Button plain onClick={handleClose}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!hasPurchased} color="dark/zinc">
              Continue
              <ChevronRightIcon className="size-4" />
            </Button>
          </>
        )}

        {step === 2 && !isProcessing && (
          <>
            <Button plain onClick={() => { setStep(1); setError(null); setProcessingState("idle"); }}>Back</Button>
            <Button onClick={handleScan} disabled={!screenshotUrl.trim()} color="dark/zinc">
              Scan Receipt
              <ChevronRightIcon className="size-4" />
            </Button>
          </>
        )}

        {processingState === "scanning" && (
          <Button plain disabled>Scanning...</Button>
        )}

        {step === 3 && !isProcessing && processingState !== "success" && (
          <>
            <Button plain onClick={() => { setStep(2); setError(null); setProcessingState("idle"); }}>Back</Button>
            <Button onClick={handleEnroll} color="emerald">
              <CheckCircleIcon className="size-4" />
              Confirm & Enroll
            </Button>
          </>
        )}

        {processingState === "enrolling" && (
          <Button plain disabled>Creating...</Button>
        )}

        {processingState === "success" && (
          <Button plain disabled>Redirecting...</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function ProductImageGallery({ images }: { images: { id: string; imageUrl: string; isPrimary: boolean; altText?: string }[] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <CubeIcon className="size-16 text-zinc-300 dark:text-zinc-600" />
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <img
          src={sortedImages[selectedImage]?.imageUrl}
          alt={sortedImages[selectedImage]?.altText || "Product image"}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover"
        />
      </div>
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImage(idx)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === idx
                  ? "border-zinc-900 dark:border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img.imageUrl} alt="" loading="lazy" decoding="async" className="size-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CampaignShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, loading, error } = useCampaign(id || "");
  const { data: pricing } = useCampaignPricing(id || "");
  const { data: couponsData } = useAvailableCoupons(id || "");
  const { data: product } = useProductById(campaign?.productId);
  const { data: platform } = usePlatform(product?.platformId);
  const { data: deliverablesData } = useCampaignDeliverables({ take: 10 });

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const daysRemaining = useMemo(() => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [campaign?.endDate]);

  const isActive = campaign?.status === "active";

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-800">
          <SparklesIcon className="size-12 text-zinc-400" />
        </div>
        <Heading className="mt-6">Campaign not found</Heading>
        <Text className="mt-2 text-center">
          The campaign you're looking for doesn't exist or has been removed.
        </Text>
        <Button className="mt-6" onClick={() => navigate("/campaigns")} color="dark/zinc">
          <ArrowLeftIcon className="size-4" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Hero Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Product Image Gallery */}
        <ProductImageGallery images={product?.productImages || []} />

        {/* Right: Campaign & Product Info */}
        <div className="space-y-6">
          {/* Status & Type Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={campaign.status} />
            <CampaignTypeBadge type={campaign.campaignType} />
            {platform && (
              <Badge color="zinc" className="inline-flex items-center gap-1">
                <PlatformIcon type={platform.type} />
                {platform.name}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="font-serif text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-white">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Product Info */}
          {product && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Product</p>
                  <p className="mt-1 truncate font-semibold text-zinc-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                    {product.priceDecimal ? `₹${product.priceDecimal}` : formatCurrency(product.price / 100)}
                  </p>
                </div>
                {product.productLink && (
                  <a
                    href={product.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-white p-2 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                  >
                    <ArrowTopRightOnSquareIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Earnings Display */}
          <div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-800">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-sm text-zinc-300">Earn up to</p>
                <p className="mt-1 text-4xl font-bold">{campaign.rebatePercentage || 0}%</p>
                <p className="text-sm text-zinc-300">cashback</p>
              </div>
              {pricing?.bonusAmountDecimal && Number(pricing.bonusAmountDecimal) > 0 && (
                <div className="rounded-xl bg-emerald-500/20 px-4 py-2">
                  <p className="text-xs text-emerald-400">Bonus</p>
                  <p className="text-xl font-bold text-emerald-400">+₹{pricing.bonusAmountDecimal}</p>
                </div>
              )}
            </div>

            {isActive && (
              <Button
                className="mt-6 w-full"
                onClick={() => setEnrollDialogOpen(true)}
                color="white"
              >
                Enroll Now
                <ChevronRightIcon className="size-4" />
              </Button>
            )}

            {!isActive && (
              <div className="mt-6 flex items-center gap-2 text-amber-400">
                <ClockIcon className="size-5" />
                <span className="text-sm font-medium">
                  Campaign is {campaign.status.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {/* Urgency Banner */}
          {isActive && daysRemaining !== null && daysRemaining <= 7 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <ClockIcon className="size-6 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  {daysRemaining > 0 ? `Only ${daysRemaining} days left!` : "Last day!"}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Don't miss this opportunity
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarIcon className="size-4" />
            <span className="text-xs font-medium">Start Date</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {formatDate(campaign.startDate)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarIcon className="size-4" />
            <span className="text-xs font-medium">End Date</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {formatDate(campaign.endDate)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <UsersIcon className="size-4" />
            <span className="text-xs font-medium">Max Spots</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {campaign.maxEnrollments.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-zinc-500">
            <ClockIcon className="size-4" />
            <span className="text-xs font-medium">Submission Window</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {campaign.enrollmentExpiryDays} days
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* How It Works */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <StarIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <Subheading>How It Works</Subheading>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { step: 1, icon: ShoppingCartIcon, title: "Purchase", desc: "Buy the product from the official store", color: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400" },
                { step: 2, icon: CameraIcon, title: "Upload Receipt", desc: "Submit your order confirmation screenshot", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" },
                { step: 3, icon: DocumentCheckIcon, title: "Complete Tasks", desc: "Submit reviews, posts, or other deliverables", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" },
                { step: 4, icon: BanknotesIcon, title: "Get Cashback", desc: "Receive your earnings in your wallet", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {item.step}. {item.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables Preview */}
          {deliverablesData?.data && deliverablesData.data.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <ClipboardDocumentListIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <Subheading>Required Deliverables</Subheading>
              </div>

              <Text className="mt-2">
                Complete these tasks after your purchase to earn your cashback.
              </Text>

              <div className="mt-5 space-y-3">
                {deliverablesData.data.slice(0, 5).map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                      <DeliverableIcon category={deliverable.category} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">{deliverable.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {deliverable.requireLink && (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                            <LinkIcon className="size-3" />
                            Link required
                          </span>
                        )}
                        {deliverable.requireScreenshot && (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                            <PhotoIcon className="size-3" />
                            Screenshot required
                          </span>
                        )}
                        <Badge color="zinc" className="text-xs capitalize">
                          {deliverable.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <InformationCircleIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <Subheading>Campaign Details</Subheading>
            </div>

            <div className="mt-5 divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <TagIcon className="size-4" />
                  <span className="text-sm">Campaign Type</span>
                </div>
                <span className="text-sm font-medium capitalize text-zinc-900 dark:text-white">
                  {campaign.campaignType}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ReceiptPercentIcon className="size-4" />
                  <span className="text-sm">Cashback Rate</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {campaign.rebatePercentage || 0}%
                </span>
              </div>
              {pricing?.bonusAmountDecimal && Number(pricing.bonusAmountDecimal) > 0 && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <GiftIcon className="size-4" />
                    <span className="text-sm">Bonus Amount</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +₹{pricing.bonusAmountDecimal}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <UsersIcon className="size-4" />
                  <span className="text-sm">Max Enrollments</span>
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {campaign.maxEnrollments.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ClockIcon className="size-4" />
                  <span className="text-sm">Submission Window</span>
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {campaign.enrollmentExpiryDays} days
                </span>
              </div>
              {platform && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <BuildingStorefrontIcon className="size-4" />
                    <span className="text-sm">Platform</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {platform.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Enroll CTA Card */}
          {isActive && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Earn up to</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
                    {campaign.rebatePercentage || 0}%
                  </p>
                </div>
                {pricing?.bonusAmountDecimal && Number(pricing.bonusAmountDecimal) > 0 && (
                  <div className="text-right">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Plus bonus</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{pricing.bonusAmountDecimal}
                    </p>
                  </div>
                )}
              </div>

              <Button className="mt-5 w-full" onClick={() => setEnrollDialogOpen(true)} color="dark/zinc">
                Enroll Now
                <ChevronRightIcon className="size-4" />
              </Button>

              <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Purchase first, then submit your order
              </p>
            </div>
          )}

          {/* Not Active State */}
          {!isActive && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <ClockIcon className="size-7 text-zinc-400" />
              </div>
              <p className="mt-4 font-semibold text-zinc-900 dark:text-white">
                Campaign Not Active
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Status: {campaign.status.replace("_", " ")}
              </p>
            </div>
          )}

          {/* Payout Calculator */}
          {isActive && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <PayoutCalculator
                campaignId={campaign.id}
                rebatePercentage={campaign.rebatePercentage}
                bonusAmount={pricing?.bonusAmountDecimal}
              />
            </div>
          )}

          {/* Coupons */}
          {couponsData?.coupons && couponsData.coupons.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
                  <GiftIcon className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <Subheading>Available Coupons</Subheading>
              </div>
              <div className="mt-4 space-y-3">
                {couponsData.coupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            </div>
          )}

          {/* Platform Info */}
          {platform && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                {platform.logo ? (
                  <img src={platform.logo} alt={platform.name} loading="lazy" decoding="async" className="size-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <PlatformIcon type={platform.type} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{platform.name}</p>
                  <p className="text-xs capitalize text-zinc-500">{platform.type}</p>
                </div>
              </div>
              {platform.description && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {platform.description}
                </p>
              )}
              {platform.websiteUrl && (
                <a
                  href={platform.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Visit Website
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        open={enrollDialogOpen}
        onClose={() => setEnrollDialogOpen(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        onSuccess={(enrollmentId) => {
          setEnrollDialogOpen(false);
          navigate(`/enrollments/${enrollmentId}`);
        }}
        rebatePercentage={campaign.rebatePercentage}
        bonusAmount={pricing?.bonusAmountDecimal}
      />
    </div>
  );
}
