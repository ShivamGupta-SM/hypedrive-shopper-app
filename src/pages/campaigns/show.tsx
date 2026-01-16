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
import { FileUpload, SCREENSHOT_UPLOAD_ACCEPT, type UploadedFile } from "@/components/file-upload";
import { Heading, Subheading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import {
  useCampaign,
  useCampaignPricing,
  useAvailableCoupons,
  useCampaignDeliverables,
} from "@/hooks/use-api";
import { getAuthenticatedClient, type enrollments } from "@/lib/client";
import { formatDate } from "@/lib/date";
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CalendarIcon,
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
  ExclamationTriangleIcon,
  GiftIcon,
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  ShareIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="size-12 animate-spin rounded-full border-[3px] border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading campaign...</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: "emerald" | "amber" | "red" | "zinc" | "sky"; label: string; icon: typeof CheckCircleIcon }> = {
    active: { color: "emerald", label: "Active", icon: CheckCircleIcon },
    paused: { color: "amber", label: "Paused", icon: ClockIcon },
    ended: { color: "zinc", label: "Ended", icon: ClockIcon },
    cancelled: { color: "red", label: "Cancelled", icon: ExclamationTriangleIcon },
    draft: { color: "zinc", label: "Draft", icon: DocumentCheckIcon },
    pending_approval: { color: "amber", label: "Pending", icon: ClockIcon },
    approved: { color: "sky", label: "Approved", icon: CheckCircleIcon },
  };
  const { color, label, icon: Icon } = config[status] || { color: "zinc" as const, label: status, icon: TagIcon };
  return (
    <Badge color={color} className="inline-flex items-center gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
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

function DeliverableIcon({ category, name }: { category: string; name?: string }) {
  // Check name for specific platform colors
  const nameLower = name?.toLowerCase() || "";

  // Platform-specific colors based on deliverable name
  if (nameLower.includes("youtube")) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <VideoCameraIcon className="size-4" />
      </div>
    );
  }
  if (nameLower.includes("instagram")) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400">
        <CameraIcon className="size-4" />
      </div>
    );
  }
  if (nameLower.includes("unboxing")) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
        <CubeIcon className="size-4" />
      </div>
    );
  }

  const config: Record<string, { icon: typeof PhotoIcon; color: string }> = {
    review: { icon: ChatBubbleLeftRightIcon, color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400" },
    social_post: { icon: ShareIcon, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" },
    video: { icon: VideoCameraIcon, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" },
    photo: { icon: PhotoIcon, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" },
    referral: { icon: UserGroupIcon, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
    other: { icon: ClipboardDocumentListIcon, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  };
  const { icon: Icon, color } = config[category] || config.other;
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
      <Icon className="size-4" />
    </div>
  );
}

// ============================================================================
// PRODUCT IMAGE GALLERY (Premium Design)
// ============================================================================

function ProductImageGallery({
  images,
  primaryImage
}: {
  images?: { id: string; imageUrl: string; isPrimary: boolean; altText?: string }[];
  primaryImage?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const displayImages = useMemo(() => {
    if (images && images.length > 0) {
      return [...images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
    }
    if (primaryImage) {
      return [{ id: 'primary', imageUrl: primaryImage, isPrimary: true, altText: 'Product' }];
    }
    return [];
  }, [images, primaryImage]);

  const validImages = displayImages.filter(img => !imageError[img.id]);

  useEffect(() => {
    if (selectedIndex >= validImages.length && validImages.length > 0) {
      setSelectedIndex(0);
    }
  }, [selectedIndex, validImages.length]);

  // Empty state
  if (validImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <CubeIcon className="size-16 text-zinc-300 dark:text-zinc-600" />
      </div>
    );
  }

  const currentImage = validImages[selectedIndex];
  const hasMultiple = validImages.length > 1;

  return (
    <div className="w-full">
      {/* Main Image - Edge to edge */}
      <div className="relative">
        <img
          src={currentImage?.imageUrl}
          alt={currentImage?.altText || "Product image"}
          className="aspect-square w-full object-cover"
          onError={() => {
            if (currentImage) setImageError(prev => ({ ...prev, [currentImage.id]: true }));
          }}
        />
        {/* Image Counter Badge */}
        {hasMultiple && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-zinc-900/70 px-2.5 py-1 text-xs font-medium text-white">
            <PhotoIcon className="size-3" />
            {selectedIndex + 1}/{validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      {hasMultiple && (
        <div className="border-t border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {validImages.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className="relative shrink-0 overflow-hidden rounded-lg"
              >
                <img
                  src={img.imageUrl}
                  alt=""
                  className={`size-11 object-cover lg:size-12 ${
                    selectedIndex !== idx ? "opacity-50" : ""
                  }`}
                  onError={() => setImageError(prev => ({ ...prev, [img.id]: true }))}
                />
                {selectedIndex === idx && (
                  <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-zinc-900 dark:border-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PAYOUT CALCULATOR
// ============================================================================

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
  const [estimatedPayout, setEstimatedPayout] = useState<{ shopperPayout: number; shopperPayoutDecimal: string } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculatePayout = async () => {
    const value = parseFloat(orderValue);
    if (!value || value <= 0) return;
    setCalculating(true);
    try {
      const client = getAuthenticatedClient();
      const result = await client.campaigns.calculatePayoutEstimate(campaignId, { orderValue: Math.round(value * 100) });
      setEstimatedPayout(result);
    } catch {
      const rebate = (value * (rebatePercentage || 0)) / 100;
      const bonus = bonusAmount ? parseFloat(bonusAmount) : 0;
      setEstimatedPayout({ shopperPayout: Math.round((rebate + bonus) * 100), shopperPayoutDecimal: (rebate + bonus).toFixed(2) });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Result Display - fixed height, always visible */}
      <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-4 dark:bg-zinc-800">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Your Cashback</p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums text-white">
            ₹{estimatedPayout?.shopperPayoutDecimal || "0.00"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-400">{rebatePercentage || 0}%</p>
          {bonusAmount && Number(bonusAmount) > 0 && (
            <p className="text-xs text-zinc-400">+₹{bonusAmount} bonus</p>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div>
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Enter your order value</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputGroup>
              <CurrencyRupeeIcon />
              <Input
                name="orderValue"
                type="number"
                placeholder="e.g. 1500"
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
      </div>
    </div>
  );
}

// ============================================================================
// CAMPAIGN PROCESS TIMELINE (Horizontal Layout)
// ============================================================================

function CampaignTimeline({ className }: { className?: string }) {
  const steps = [
    {
      icon: ShoppingCartIcon,
      title: "Purchase",
      description: "Buy the product",
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    },
    {
      icon: CameraIcon,
      title: "Upload",
      description: "Submit receipt",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    },
    {
      icon: DocumentCheckIcon,
      title: "Complete",
      description: "Finish tasks",
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    },
    {
      icon: BanknotesIcon,
      title: "Get Paid",
      description: "Receive cashback",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
  ];

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 ${className || ""}`}>
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <SparklesIcon className="size-4 text-violet-500 dark:text-violet-400" />
        <Subheading className="text-sm">How It Works</Subheading>
      </div>
      <div className="flex flex-1 items-center p-3 sm:p-4">
        <div className="relative grid w-full grid-cols-4">
          {/* Connector line between icons */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-3 h-0.5 bg-zinc-200 sm:top-4 dark:bg-zinc-700" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`relative z-10 flex size-6 items-center justify-center rounded-full sm:size-8 ${step.color}`}>
                <step.icon className="size-3 sm:size-4" />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-zinc-900 sm:mt-2 sm:text-xs dark:text-white">{step.title}</p>
              <p className="mt-0.5 hidden text-[10px] leading-tight text-zinc-500 sm:block">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TRUST BADGE
// ============================================================================

function TrustBadge() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
      <ShieldCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
        2,000+ shoppers paid successfully
      </p>
    </div>
  );
}

// ============================================================================
// IMPORTANT INFO
// ============================================================================

function ImportantInfo({
  startDate,
  endDate,
  submitDays,
}: {
  startDate: string;
  endDate: string;
  submitDays: number;
}) {
  const items = [
    { icon: CalendarIcon, text: `Campaign: ${formatDate(startDate)} – ${formatDate(endDate)}` },
    { icon: ClockIcon, text: `Submit within ${submitDays} days of purchase` },
    { icon: DocumentCheckIcon, text: "Complete all tasks for payout" },
    { icon: BanknotesIcon, text: "Cashback within 7 working days" },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <InformationCircleIcon className="size-4 text-sky-500 dark:text-sky-400" />
        <Subheading className="text-sm">Important</Subheading>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 px-4 py-2.5">
            <item.icon className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <p className="text-[13px] text-zinc-600 sm:text-sm dark:text-zinc-400">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FAQS ACCORDION
// ============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-[13px] font-medium text-zinc-900 sm:text-sm dark:text-white">{question}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          <p className="text-[13px] text-zinc-600 sm:text-sm dark:text-zinc-400">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQsAccordion() {
  const faqs = [
    {
      question: "How long does it take to receive cashback?",
      answer: "After all deliverables are verified, cashback is credited within 7 working days directly to your wallet.",
    },
    {
      question: "Can I cancel my enrollment?",
      answer: "Yes, you can cancel before submitting your first deliverable. After that, cancellation is not possible.",
    },
    {
      question: "What if my order gets cancelled?",
      answer: "If your order is cancelled or returned, please contact support with proof. Your enrollment will be adjusted accordingly.",
    },
    {
      question: "Can I participate multiple times?",
      answer: "Each user can enroll only once per campaign. Multiple enrollments from the same user will be rejected.",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <ChatBubbleLeftRightIcon className="size-4 text-amber-500 dark:text-amber-400" />
        <Subheading className="text-sm">FAQs</Subheading>
      </div>
      <div>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENROLLMENT DIALOG
// ============================================================================

type EnrollmentStep = 1 | 2 | 3;
type ProcessingState = "idle" | "scanning" | "enrolling" | "success" | "error";
type ScanStage = "uploading" | "processing" | "extracting" | "validating";

// Scanning Progress UI Component - Phone scanner style
function ScanningProgress({ stage }: { stage: ScanStage }) {
  const stages = [
    { id: "uploading", text: "Uploading receipt..." },
    { id: "processing", text: "Processing image..." },
    { id: "extracting", text: "Reading purchase details..." },
    { id: "validating", text: "Validating information..." },
  ] as const;

  const currentIndex = stages.findIndex(s => s.id === stage);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  return (
    <div className="flex flex-col items-center px-6 py-10">
      {/* Phone/Document Scanner Frame */}
      <div className="relative mb-8">
        {/* Document frame */}
        <div className="relative h-44 w-32 overflow-hidden rounded-lg border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800">
          {/* Document lines (receipt look) */}
          <div className="absolute inset-x-3 top-4 space-y-2">
            <div className="h-2 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-4 h-2 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-4 h-2 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>

          {/* Scanning line */}
          <div
            className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]"
            style={{
              animation: "scanLine 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Corner brackets */}
        <div className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-emerald-500" />
        <div className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-emerald-500" />
        <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-emerald-500" />
        <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-emerald-500" />
      </div>

      {/* Status text */}
      <p className="mb-4 text-base font-medium text-zinc-900 dark:text-white">
        {stages[currentIndex]?.text}
      </p>

      {/* Simple progress bar */}
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time estimate */}
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        This takes about 10-20 seconds
      </p>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: EnrollmentStep }) {
  const steps = [
    { num: 1, label: "Purchase" },
    { num: 2, label: "Upload" },
    { num: 3, label: "Verify" },
  ] as const;

  return (
    <div className="px-4 py-4 sm:px-8">
      {/* Container with fixed positions for circles */}
      <div className="relative flex justify-between">
        {/* Background connector line - spans between first and last circle centers */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 sm:top-4.5 sm:left-4.5 sm:right-4.5 dark:bg-zinc-700" />

        {/* Progress line - fills based on completed steps */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-emerald-500 transition-all duration-300 sm:top-4.5 sm:left-4.5"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? 'calc(50% - 16px)' : 'calc(100% - 32px)'
          }}
        />

        {steps.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <div className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold sm:size-9 ${
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              }`}>
                {isCompleted ? <CheckCircleIcon className="size-5" /> : step.num}
              </div>
              <span className={`mt-1.5 text-[11px] font-medium sm:text-xs ${
                isActive
                  ? "text-zinc-900 dark:text-white"
                  : isCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
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
  productLink,
  platformName,
}: {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onSuccess: (enrollmentId: string) => void;
  rebatePercentage?: number;
  bonusAmount?: string;
  productLink?: string;
  platformName?: string;
}) {
  const [step, setStep] = useState<EnrollmentStep>(1);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [scanStage, setScanStage] = useState<ScanStage>("uploading");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [scanResult, setScanResult] = useState<enrollments.ScanOrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetDialog = () => {
    setStep(1);
    setProcessingState("idle");
    setScanStage("uploading");
    setHasPurchased(false);
    setUploadedFiles([]);
    setCouponCode("");
    setScanResult(null);
    setError(null);
  };

  const handleClose = () => {
    if (processingState === "scanning" || processingState === "enrolling") return;
    resetDialog();
    onClose();
  };

  // Fire confetti on success
  useEffect(() => {
    if (processingState === "success") {
      import("canvas-confetti").then(({ default: confetti }) => {
        // Burst from center
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        // Side bursts
        setTimeout(() => {
          confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
        }, 150);
      });
    }
  }, [processingState]);

  const pollScanStatus = async (
    scanId: string,
    onStageChange: (stage: ScanStage) => void,
    maxAttempts = 30
  ): Promise<enrollments.ScanOrderResult | null> => {
    const client = getAuthenticatedClient();
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        // Update stage based on attempts (show progress)
        if (attempts >= 2 && attempts < 5) {
          onStageChange("extracting");
        } else if (attempts >= 5) {
          onStageChange("validating");
        }

        const status = await client.enrollments.getScanStatus(scanId);
        if (status.status === "completed" || status.status === "failed") {
          if (status.status === "completed") {
            onStageChange("validating");
            await new Promise(r => setTimeout(r, 300)); // Brief pause to show validation
          }
          return { scanId, status: status.status, extractedData: status.extractedData, confidence: status.confidence, errorMessage: status.errorMessage } as enrollments.ScanOrderResult;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleScan = async () => {
    if (uploadedFiles.length === 0) { setError("Please upload a screenshot"); return; }
    setProcessingState("scanning");
    setScanStage("uploading");
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const file = uploadedFiles[0].file;

      // Stage 1: Upload file to storage
      const { uploadUrl, fileUrl } = await client.storage.requestUploadUrl({
        filename: `order-screenshot-${Date.now()}-${file.name}`,
        contentType: file.type,
        folder: "uploads",
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload screenshot");
      }

      // Stage 2: Processing - Send to scan API
      setScanStage("processing");
      const result = await client.enrollments.scanOrder({ campaignId, screenshotUrl: fileUrl });

      if (result.status === "completed") {
        setScanStage("validating");
        await new Promise(r => setTimeout(r, 500)); // Brief pause to show validation
        setScanResult(result);
        setProcessingState("idle");
        setStep(3);
        return;
      }
      if (result.status === "failed") {
        setError(result.errorMessage || result.validation?.errors?.join(", ") || "Failed to scan receipt.");
        setProcessingState("error");
        return;
      }

      // Stage 3 & 4: Extracting & Validating while polling
      if (result.scanId && (result.status === "pending" || result.status === "processing")) {
        setScanStage("extracting");
        const finalResult = await pollScanStatus(result.scanId, setScanStage);
        if (finalResult) {
          setScanResult(finalResult);
          if (finalResult.status === "completed") { setProcessingState("idle"); setStep(3); }
          else if (finalResult.status === "failed") { setError(finalResult.errorMessage || "Failed to scan receipt."); setProcessingState("error"); }
        } else { setScanResult(result); setProcessingState("idle"); setStep(3); }
        return;
      }
      setScanResult(result); setProcessingState("idle"); setStep(3);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to scan receipt"); setProcessingState("error"); }
  };

  const handleEnroll = async () => {
    if (!scanResult?.scanId) { setError("No scan result available"); return; }
    setProcessingState("enrolling");
    setError(null);
    try {
      const client = getAuthenticatedClient();
      const enrollment = await client.enrollments.createEnrollment({ scanId: scanResult.scanId, couponCode: couponCode.trim() || undefined });
      setProcessingState("success");
      setTimeout(() => onSuccess(enrollment.id), 2500);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create enrollment"); setProcessingState("error"); }
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
          {step === 1 && "Purchase the Product"}
          {step === 2 && processingState !== "scanning" && "Upload Order Screenshot"}
          {step === 2 && processingState === "scanning" && "Scanning Receipt..."}
          {step === 3 && processingState !== "enrolling" && "Review & Confirm"}
          {step === 3 && processingState === "enrolling" && "Creating Enrollment..."}
          {processingState === "success" && "🎉 You're Enrolled!"}
        </DialogTitle>
        <DialogDescription>
          {step === 1 && "Buy the product first, then upload your order confirmation"}
          {step === 2 && processingState !== "scanning" && "Drop your order screenshot below"}
          {step === 2 && processingState === "scanning" && "Our AI is extracting order details..."}
          {step === 3 && processingState !== "enrolling" && "Verify details and apply coupon if you have one"}
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
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <BanknotesIcon className="size-7" />
                </div>
                <div className="min-w-0 flex-1">
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

            {/* Buy Now CTA */}
            {productLink && (
              <a
                href={productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 dark:border-emerald-600 dark:bg-emerald-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <ShoppingCartIcon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Buy on {platformName || "Store"}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Opens in new tab
                    </p>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
              </a>
            )}

            {/* Confirmation Checkbox */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">After purchasing:</p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-700"
                  checked={hasPurchased}
                  onChange={(e) => setHasPurchased(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    I have completed my purchase
                  </span>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    I have a screenshot of my order confirmation
                  </p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30">
              <InformationCircleIcon className="size-5 shrink-0 text-sky-600 dark:text-sky-400" />
              <p className="text-sm text-sky-700 dark:text-sky-300">
                Take a screenshot of your order confirmation page showing the <strong>Order ID</strong> and <strong>total amount</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Upload Receipt with Dropzone */}
        {step === 2 && processingState !== "scanning" && (
          <div className="space-y-5">
            {/* Dropzone */}
            <FileUpload
              accept={SCREENSHOT_UPLOAD_ACCEPT}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              multiple={false}
              onFilesChange={setUploadedFiles}
              placeholder="Drag & drop your order screenshot, or click to select"
              showPreview={true}
            />

            {/* Tips */}
            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Tips for best results:</p>
              <ul className="mt-3 space-y-2">
                {[
                  "Clear, high-resolution screenshot",
                  "Order ID clearly visible",
                  "Total amount visible",
                ].map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CheckCircleIcon className="size-4 text-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Error State */}
            {error && processingState === "error" && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
                <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Scan failed</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanning State */}
        {processingState === "scanning" && (
          <ScanningProgress stage={scanStage} />
        )}

        {/* Step 3: Verify + Apply Coupon */}
        {step === 3 && processingState !== "enrolling" && processingState !== "success" && (
          <div className="space-y-5">
            {/* Extracted Details - Only show if we have some valid data and not in error state */}
            {scanResult?.extractedData && processingState !== "error" && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Order Details</p>
                  {scanResult.confidence !== undefined && (
                    <Badge color={scanResult.confidence > 0.8 ? "emerald" : scanResult.confidence > 0.5 ? "amber" : "red"}>
                      {Math.round(scanResult.confidence * 100)}% confidence
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
                  {scanResult.extractedData.orderValue !== undefined && scanResult.extractedData.orderValue > 0 && (
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

            {/* Coupon Code Input - Only show when not in error state */}
            {processingState !== "error" && (
              <Field>
                <Label>Have a Coupon Code?</Label>
                <div className="mt-2">
                  <InputGroup>
                    <GiftIcon />
                    <Input
                      type="text"
                      placeholder="Enter coupon for extra bonus"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Optional - apply a coupon for additional cashback
                </p>
              </Field>
            )}

            {/* Estimated Cashback - Only show if we have valid order value (> 0) and no error */}
            {scanResult?.extractedData?.orderValue !== undefined &&
             scanResult.extractedData.orderValue > 0 &&
             processingState !== "error" && (
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

            {/* Applied Coupon Display - Only show when not in error state */}
            {couponCode && processingState !== "error" && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                <GiftIcon className="size-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Coupon applied: </span>
                <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-200">{couponCode}</span>
              </div>
            )}

            {/* Error State */}
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

        {/* Success State with Confetti */}
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
              I've Purchased
              <ChevronRightIcon className="size-4" />
            </Button>
          </>
        )}
        {step === 2 && !isProcessing && (
          <>
            <Button plain onClick={() => { setStep(1); setError(null); setProcessingState("idle"); }}>
              Back
            </Button>
            <Button onClick={handleScan} disabled={uploadedFiles.length === 0} color="dark/zinc">
              Scan Receipt
              <ChevronRightIcon className="size-4" />
            </Button>
          </>
        )}
        {processingState === "scanning" && <Button plain disabled>Scanning...</Button>}
        {step === 3 && !isProcessing && processingState !== "success" && (
          <>
            <Button plain onClick={() => { setStep(2); setError(null); setProcessingState("idle"); }}>
              Back
            </Button>
            <Button onClick={handleEnroll} color="emerald">
              <CheckCircleIcon className="size-4" />
              Confirm & Enroll
            </Button>
          </>
        )}
        {processingState === "enrolling" && <Button plain disabled>Creating...</Button>}
        {processingState === "success" && <Button plain disabled>Redirecting...</Button>}
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CampaignShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, loading, error } = useCampaign(id || "");
  const { data: pricing } = useCampaignPricing(id || "");
  const { data: couponsData } = useAvailableCoupons(id || "");
  const { data: deliverablesData } = useCampaignDeliverables({ take: 10 });

  const product = campaign?.product;
  const platform = campaign?.platform;

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const daysRemaining = useMemo(() => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [campaign?.endDate]);

  const isActive = campaign?.status === "active";
  const spotsLeft = campaign ? campaign.maxEnrollments - campaign.currentEnrollments : 0;
  const spotsPercentage = campaign ? Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100) : 0;

  if (loading) return <LoadingSpinner />;

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800"><SparklesIcon className="size-7 text-zinc-400" /></div>
        <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">Campaign not found</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">The campaign you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate("/campaigns")} color="dark/zinc"><ArrowLeftIcon className="size-4" />Back to Campaigns</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* SECTION 1: PRODUCT + EARNINGS (Side by Side) */}
      {/* ================================================================== */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Product Gallery - Left Side */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <ProductImageGallery
            images={product?.productImages}
            primaryImage={product?.primaryImage}
          />
        </div>

        {/* Product Info + Earnings - Right Side */}
        <div className="flex flex-col gap-4">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={campaign.status} />
            <CampaignTypeBadge type={campaign.campaignType} />
          </div>

          {/* Title & Description */}
          <div>
            <Heading>{campaign.title}</Heading>
            {campaign.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{campaign.description}</p>
            )}
          </div>

          {/* Product Price & Link */}
          {product && (
            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                ₹{product.priceDecimal || (product.price / 100).toLocaleString()}
              </p>
              {product.productLink && (
                <a
                  href={product.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {platform && (platform.logo || platform.icon) ? (
                    <img src={platform.logo || platform.icon} alt="" className="size-4 rounded object-contain" />
                  ) : (
                    <ArrowTopRightOnSquareIcon className="size-3.5" />
                  )}
                  View on {platform?.name || "Store"}
                </a>
              )}
            </div>
          )}

          {/* Premium Dark Earnings Card */}
          <div className="overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Your Earnings</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl font-bold text-white sm:text-3xl">{campaign.rebatePercentage || 0}%</span>
                  <span className="text-sm text-zinc-400">cashback</span>
                  {pricing?.bonusAmountDecimal && Number(pricing.bonusAmountDecimal) > 0 && (
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 sm:ml-1 sm:text-sm">
                      +₹{pricing.bonusAmountDecimal}
                    </span>
                  )}
                </div>
              </div>
              {isActive ? (
                <Button onClick={() => setEnrollDialogOpen(true)} color="white" className="w-full shrink-0 sm:w-auto">
                  Enroll Now
                  <ChevronRightIcon className="size-4" />
                </Button>
              ) : (
                <Badge color="zinc">{campaign.status.replace("_", " ")}</Badge>
              )}
            </div>
            {/* Progress Bar */}
            {isActive && (
              <div className="border-t border-zinc-800 bg-zinc-950/50 px-4 py-3 dark:border-zinc-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{spotsLeft} spots remaining</span>
                  <span className="font-medium text-zinc-400">{campaign.currentEnrollments}/{campaign.maxEnrollments}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${spotsPercentage >= 90 ? "bg-red-500" : spotsPercentage >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(spotsPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex min-w-0 flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-3.5 shrink-0 text-sky-500 sm:size-4 dark:text-sky-400" />
                <span className="truncate text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">Ends On</span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-white">
                {formatDate(campaign.endDate)}
              </p>
            </div>
            {daysRemaining !== null && (
              <div className="flex min-w-0 flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
                <div className="flex items-center gap-1">
                  <ClockIcon className={`size-3.5 shrink-0 sm:size-4 ${daysRemaining <= 7 ? "text-amber-500 dark:text-amber-400" : "text-amber-500 dark:text-amber-400"}`} />
                  <span className="truncate text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">Time Left</span>
                </div>
                <p className={`mt-1 truncate text-sm font-semibold sm:text-base ${daysRemaining <= 7 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-white"}`}>
                  {daysRemaining === 0 ? "Today!" : `${daysRemaining}d`}
                </p>
              </div>
            )}
            <div className="flex min-w-0 flex-col rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200 sm:p-3 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center gap-1">
                <DocumentCheckIcon className="size-3.5 shrink-0 text-emerald-500 sm:size-4 dark:text-emerald-400" />
                <span className="truncate text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">Submit In</span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-white">
                {campaign.enrollmentExpiryDays}d
              </p>
            </div>
          </div>

          {/* How It Works Timeline - flex-1 to fill remaining space */}
          <CampaignTimeline className="flex-1" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: CAMPAIGN DETAILS (Full Width Grid) */}
      {/* ================================================================== */}
      <div className="grid items-start gap-5 md:grid-cols-2">
        {/* Left: Calculator */}
        {isActive && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <CurrencyRupeeIcon className="size-4 text-emerald-500 dark:text-emerald-400" />
              <Subheading className="text-sm">Earnings Calculator</Subheading>
            </div>
            <div className="p-4">
              <PayoutCalculator
                campaignId={campaign.id}
                rebatePercentage={campaign.rebatePercentage}
                bonusAmount={pricing?.bonusAmountDecimal}
              />
            </div>
          </div>
        )}

        {/* Right: Deliverables */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="size-4 text-rose-500 dark:text-rose-400" />
              <Subheading className="text-sm">Deliverables</Subheading>
            </div>
            {deliverablesData?.data && (
              <span className="text-xs text-zinc-400">{deliverablesData.data.length} tasks</span>
            )}
          </div>
          <div className="max-h-48 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {deliverablesData?.data && deliverablesData.data.length > 0 ? (
              deliverablesData.data.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                  <DeliverableIcon category={d.category} name={d.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{d.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      {d.requireLink && <span className="flex items-center gap-0.5"><LinkIcon className="size-2.5" />Link</span>}
                      {d.requireScreenshot && <span className="flex items-center gap-0.5"><PhotoIcon className="size-2.5" />Screenshot</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ClipboardDocumentListIcon className="size-6 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-1 text-xs text-zinc-500">No tasks required</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coupon hint - subtle, below section 2 */}
      {couponsData?.coupons && couponsData.coupons.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <GiftIcon className="size-3.5" />
          <span>Have a coupon? Enter it during enrollment for bonus cashback</span>
        </div>
      )}

      {/* ================================================================== */}
      {/* SECTION 3: ADDITIONAL INFO */}
      {/* ================================================================== */}
      <ImportantInfo
        startDate={campaign.startDate}
        endDate={campaign.endDate}
        submitDays={campaign.enrollmentExpiryDays}
      />

      {/* Trust Badge */}
      <TrustBadge />

      {/* FAQs */}
      <FAQsAccordion />

      <EnrollmentDialog
        open={enrollDialogOpen}
        onClose={() => setEnrollDialogOpen(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        onSuccess={(enrollmentId) => { setEnrollDialogOpen(false); navigate(`/enrollments/${enrollmentId}`); }}
        rebatePercentage={campaign.rebatePercentage}
        bonusAmount={pricing?.bonusAmountDecimal}
        productLink={product?.productLink}
        platformName={platform?.name}
      />
    </div>
  );
}
