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
import {
  InstagramIcon,
  YouTubeIcon,
  TwitterIcon,
  FacebookIcon,
  TikTokIcon,
  AmazonIcon,
  FlipkartIcon,
  MyntraIcon,
  GoogleIcon,
  LinkedInIcon,
  PinterestIcon,
  SnapchatIcon,
  WhatsAppIcon,
  TelegramIcon,
  ThreadsIcon,
  ShopifyIcon,
  SwiggyIcon,
  ZomatoIcon,
  BigBasketIcon,
  PaytmIcon,
  PhonePeIcon,
  EbayIcon,
  AliExpressIcon,
  WalmartIcon,
  TargetIcon,
  EtsyIcon,
  MeeshoIcon,
  NykaaIcon,
  AjioIcon,
  BlinkitIcon,
  ZeptoIcon,
  DunzoIcon,
  JioMartIcon,
} from "@/components/icons/platform-icons";
import { Input, InputGroup } from "@/components/input";
import { CampaignShowSkeleton } from "@/lib/skeleton";
import {
  useCampaign,
  useCampaignPricing,
  useValidateCoupon,
  useScanOrder,
  useFileUpload,
  useCalculatePayoutEstimate,
  useCreateEnrollment,
  getAssetUrl,
  type enrollments,
} from "@/hooks/use-api";
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
  ShieldCheckIcon,
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

// Page title hook
function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => { document.title = prevTitle; };
  }, [title]);
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

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

function TaskIcon({ name, platformName }: { name?: string; platformName?: string }) {
  const nameLower = name?.toLowerCase() || "";
  const platformLower = platformName?.toLowerCase() || "";

  // Branded platform icons with official colors
  if (nameLower.includes("youtube") || platformLower.includes("youtube")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
        <YouTubeIcon className="size-4 text-red-600 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("instagram") || platformLower.includes("instagram")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-orange-900/40">
        <InstagramIcon className="size-4 text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("twitter") || nameLower.includes(" x ") || platformLower.includes("twitter")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <TwitterIcon className="size-4 text-zinc-900 dark:text-white" />
      </div>
    );
  }
  if (nameLower.includes("facebook") || platformLower.includes("facebook")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <FacebookIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("tiktok") || platformLower.includes("tiktok")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <TikTokIcon className="size-4 text-zinc-900 dark:text-white" />
      </div>
    );
  }
  if (nameLower.includes("amazon") || platformLower.includes("amazon")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
        <AmazonIcon className="size-4 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("flipkart") || platformLower.includes("flipkart")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <FlipkartIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("myntra") || platformLower.includes("myntra")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1 dark:bg-pink-900/40">
        <MyntraIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("meesho") || platformLower.includes("meesho")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1 dark:bg-pink-900/40">
        <MeeshoIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("nykaa") || platformLower.includes("nykaa")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pink-100 px-1 dark:bg-pink-900/40">
        <NykaaIcon className="h-auto w-full text-pink-600 dark:text-pink-400" />
      </div>
    );
  }
  if (nameLower.includes("ajio") || platformLower.includes("ajio")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 px-1 dark:bg-amber-900/40">
        <AjioIcon className="h-auto w-full text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("bigbasket") || platformLower.includes("bigbasket") || nameLower.includes("big basket")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
        <BigBasketIcon className="size-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("blinkit") || platformLower.includes("blinkit")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-yellow-100 px-1 dark:bg-yellow-900/40">
        <BlinkitIcon className="h-auto w-full text-yellow-600 dark:text-yellow-500" />
      </div>
    );
  }
  if (nameLower.includes("zepto") || platformLower.includes("zepto")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 px-1 dark:bg-violet-900/40">
        <ZeptoIcon className="h-auto w-full text-violet-600 dark:text-violet-400" />
      </div>
    );
  }
  if (nameLower.includes("dunzo") || platformLower.includes("dunzo")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
        <DunzoIcon className="size-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("jiomart") || platformLower.includes("jiomart") || nameLower.includes("jio mart")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <JioMartIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("swiggy") || platformLower.includes("swiggy")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
        <SwiggyIcon className="size-4 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  if (nameLower.includes("zomato") || platformLower.includes("zomato")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
        <ZomatoIcon className="size-4 text-red-600 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("paytm") || platformLower.includes("paytm")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
        <PaytmIcon className="size-4 text-sky-600 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("phonepe") || platformLower.includes("phonepe") || nameLower.includes("phone pe")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
        <PhonePeIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }
  if (nameLower.includes("shopify") || platformLower.includes("shopify")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
        <ShopifyIcon className="size-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("ebay") || platformLower.includes("ebay")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <EbayIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("aliexpress") || platformLower.includes("aliexpress") || nameLower.includes("ali express")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
        <AliExpressIcon className="size-4 text-red-600 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("walmart") || platformLower.includes("walmart")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <WalmartIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("target") || platformLower.includes("target")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
        <TargetIcon className="size-4 text-red-600 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("etsy") || platformLower.includes("etsy")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
        <EtsyIcon className="size-4 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  if (nameLower.includes("linkedin") || platformLower.includes("linkedin")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
        <LinkedInIcon className="size-4 text-sky-600 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("pinterest") || platformLower.includes("pinterest")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
        <PinterestIcon className="size-4 text-red-600 dark:text-red-400" />
      </div>
    );
  }
  if (nameLower.includes("snapchat") || platformLower.includes("snapchat")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
        <SnapchatIcon className="size-4 text-yellow-600 dark:text-yellow-500" />
      </div>
    );
  }
  if (nameLower.includes("whatsapp") || platformLower.includes("whatsapp")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
        <WhatsAppIcon className="size-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (nameLower.includes("telegram") || platformLower.includes("telegram")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
        <TelegramIcon className="size-4 text-sky-600 dark:text-sky-400" />
      </div>
    );
  }
  if (nameLower.includes("threads") || platformLower.includes("threads")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <ThreadsIcon className="size-4 text-zinc-900 dark:text-white" />
      </div>
    );
  }
  if (nameLower.includes("google")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
        <GoogleIcon className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (nameLower.includes("review") || nameLower.includes("rating")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
        <StarIcon className="size-4 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  if (nameLower.includes("unboxing")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
        <CubeIcon className="size-4 text-violet-600 dark:text-violet-400" />
      </div>
    );
  }
  if (nameLower.includes("video")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
        <VideoCameraIcon className="size-4 text-rose-600 dark:text-rose-400" />
      </div>
    );
  }
  if (nameLower.includes("photo") || nameLower.includes("image")) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
        <PhotoIcon className="size-4 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }

  // Default - generic task icon
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
      <ClipboardDocumentListIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
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
          src={getAssetUrl(currentImage?.imageUrl)}
          alt={currentImage?.altText || "Product image"}
          className="aspect-square w-full object-contain"
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
                  src={getAssetUrl(img.imageUrl)}
                  alt=""
                  className={`size-11 object-contain lg:size-12 ${
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
  const { calculatePayout: calculatePayoutMutation, isPending: calculating } = useCalculatePayoutEstimate();

  const calculatePayout = async () => {
    const value = parseFloat(orderValue);
    if (!value || value <= 0) return;
    try {
      const result = await calculatePayoutMutation({ campaignId, orderValue: Math.round(value * 100) });
      setEstimatedPayout(result);
    } catch {
      const rebate = (value * (rebatePercentage || 0)) / 100;
      const bonus = bonusAmount ? parseFloat(bonusAmount) : 0;
      setEstimatedPayout({ shopperPayout: Math.round((rebate + bonus) * 100), shopperPayoutDecimal: (rebate + bonus).toFixed(2) });
    }
  };

  return (
    <div className="space-y-3">
      {/* Result Display - lighter bg for contrast */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-700/80 px-4 py-3 dark:bg-zinc-600/80">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Estimated Cashback</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-white">
            ₹{estimatedPayout?.shopperPayoutDecimal || "0.00"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-400">{rebatePercentage || 0}%</p>
          {bonusAmount && Number(bonusAmount) > 0 && (
            <p className="text-xs text-emerald-400/70">+₹{bonusAmount}</p>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="flex gap-2">
        <div className="flex-1">
          <InputGroup>
            <CurrencyRupeeIcon className="text-zinc-500" />
            <Input
              name="orderValue"
              type="number"
              placeholder="Enter order value"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculatePayout()}
              className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:border-zinc-600 dark:bg-zinc-700/50"
            />
          </InputGroup>
        </div>
        <Button onClick={calculatePayout} disabled={calculating || !orderValue} color="white">
          {calculating ? "..." : "Go"}
        </Button>
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
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <SparklesIcon className="size-4 text-violet-500 dark:text-violet-400" />
        <Subheading className="text-sm">How It Works</Subheading>
      </div>
      <div className="flex flex-1 items-center p-4 sm:p-6">
        <div className="relative grid w-full grid-cols-4">
          {/* Connector line between icons */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-4 h-0.5 bg-zinc-200 sm:top-5 dark:bg-zinc-700" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`relative z-10 flex size-8 items-center justify-center rounded-full sm:size-10 ${step.color}`}>
                <step.icon className="size-4 sm:size-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-zinc-900 sm:mt-3 sm:text-sm dark:text-white">{step.title}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-zinc-500 sm:text-xs">{step.description}</p>
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
    <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <ShieldCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <InformationCircleIcon className="size-4 text-sky-500 dark:text-sky-400" />
        <Subheading className="text-sm">Important</Subheading>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
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
    <div className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-700">
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
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
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

          {/* Scanning line - animated up and down */}
          <div
            className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]"
            style={{
              top: "10%",
              animation: "scan-line 2s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes scan-line {
              0%, 100% { top: 10%; }
              50% { top: 85%; }
            }
          `}</style>
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

function StepIndicator({ currentStep, hasError }: { currentStep: EnrollmentStep; hasError?: boolean }) {
  const steps = [
    { num: 1, label: "Purchase", icon: ShoppingCartIcon },
    { num: 2, label: "Upload", icon: CameraIcon },
    { num: 3, label: "Confirm", icon: CheckCircleIcon },
  ] as const;

  // Calculate progress percentage for the line
  const progressPercent = currentStep === 1 ? 0 : currentStep === 2 ? 50 : 100;

  return (
    <div className="px-6 py-5 sm:px-10">
      <div className="relative flex justify-between">
        {/* Single line with gradient - no separate background line */}
        <div
          className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        >
          {/* Progress fill inside the line container */}
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center" style={{ width: '33.33%' }}>
              <div className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : isActive
                    ? hasError
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-zinc-900 text-white shadow-lg shadow-zinc-900/30 ring-4 ring-zinc-900/10 dark:bg-white dark:text-zinc-900 dark:shadow-white/20 dark:ring-white/20"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}>
                {isCompleted ? (
                  <CheckCircleIcon className="size-5" />
                ) : hasError && isActive ? (
                  <ExclamationTriangleIcon className="size-5" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors ${
                isActive
                  ? hasError
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-900 dark:text-white"
                  : isCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400 dark:text-zinc-500"
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

// Helper to convert long technical errors to short user-friendly messages
function getShortErrorMessage(errorMessage?: string, validationErrors?: string[]): string {
  const allErrors = [errorMessage, ...(validationErrors || [])].filter(Boolean).join(" ");
  const lower = allErrors.toLowerCase();

  // Check for common error patterns and return short messages
  if (lower.includes("not an order confirmation") || lower.includes("doesn't appear to be")) {
    return "This doesn't look like an order confirmation. Please upload a screenshot of your order confirmation page.";
  }
  if (lower.includes("product") && (lower.includes("mismatch") || lower.includes("doesn't match"))) {
    return "Product doesn't match this campaign. Make sure you purchased the correct product.";
  }
  if (lower.includes("order date") && lower.includes("old")) {
    return "Order is too old. Please upload a recent purchase.";
  }
  if (lower.includes("could not extract") || lower.includes("could not read")) {
    return "Couldn't read the receipt details. Please upload a clearer screenshot.";
  }
  if (lower.includes("low") && lower.includes("confidence")) {
    return "Image quality too low. Please upload a clearer screenshot.";
  }
  if (lower.includes("scan limit") || lower.includes("attempts")) {
    return "Scan limit reached for this campaign.";
  }

  // Default short message
  return "Couldn't verify your receipt. Please try with a clearer screenshot.";
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

  // Coupon validation
  const { validate: validateCoupon, validating: validatingCoupon, result: couponResult, error: couponError, reset: resetCoupon } = useValidateCoupon();

  // File upload with retry logic
  const { uploadFile } = useFileUpload();

  // Scan order with AbortController and exponential backoff polling
  const { scanOrder, cancel: abortScan } = useScanOrder();

  // Create enrollment hook
  const { createEnrollment } = useCreateEnrollment();

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    await validateCoupon({ code: couponCode.trim() });
  };

  const resetDialog = () => {
    setStep(1);
    setProcessingState("idle");
    setScanStage("uploading");
    setHasPurchased(false);
    setUploadedFiles([]);
    setCouponCode("");
    setScanResult(null);
    setError(null);
    resetCoupon();
    abortScan(); // Cancel any ongoing scan
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

  // Cleanup on unmount - abort any ongoing scan
  useEffect(() => {
    return () => {
      abortScan();
    };
  }, [abortScan]);

  const handleScan = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload a screenshot");
      setProcessingState("error");
      return;
    }

    setProcessingState("scanning");
    setScanStage("uploading");
    setError(null);

    try {
      const file = uploadedFiles[0].file;

      // Stage 1: Upload file to storage with retry logic
      // Create a new file with proper naming
      const renamedFile = new File(
        [file],
        `order-screenshot-${Date.now()}-${file.name}`,
        { type: file.type }
      );
      const uploadResult = await uploadFile({
        file: renamedFile,
        folder: "uploads",
      });

      if (!uploadResult.success || !uploadResult.key) {
        throw new Error(uploadResult.error || "Failed to upload screenshot");
      }

      // Stage 2-4: Scan with exponential backoff polling
      setScanStage("processing");
      const result = await scanOrder({
        campaignId,
        screenshotUrl: uploadResult.key,
        onStageChange: setScanStage,
      });

      if (result.success && result.scanResult) {
        // Success - proceed to Step 3
        setScanResult(result.scanResult);
        setProcessingState("idle");
        setStep(3);
        return;
      }

      // Handle failure
      if (result.scanResult) {
        setScanResult(result.scanResult);
      }

      if (result.error?.code === "aborted") {
        // User cancelled - don't show error
        setProcessingState("idle");
        return;
      }

      // Show user-friendly error message
      const errorMsg = result.scanResult
        ? getShortErrorMessage(result.scanResult.errorMessage, result.scanResult.validation?.errors)
        : result.error?.message || "Failed to scan receipt";
      setError(errorMsg);
      setProcessingState("error");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt");
      setProcessingState("error");
    }
  };

  const handleEnroll = async () => {
    if (!scanResult?.scanId) { setError("No scan result available"); setProcessingState("error"); return; }
    setProcessingState("enrolling");
    setError(null);
    const result = await createEnrollment({ scanId: scanResult.scanId, couponCode: couponCode.trim() || undefined });
    if (result.success && result.enrollmentId) {
      setProcessingState("success");
      setTimeout(() => onSuccess(result.enrollmentId!), 2500);
    } else {
      setError(result.error?.message || "Failed to create enrollment");
      setProcessingState("error");
    }
  };

  const isProcessing = processingState === "scanning" || processingState === "enrolling";

  return (
    <Dialog open={open} onClose={handleClose} size="xl">
      {processingState !== "success" && (
        <div className="-mx-4 -mt-4 border-b border-zinc-200 bg-zinc-50 sm:-mx-6 sm:-mt-6 dark:border-zinc-700 dark:bg-zinc-900/50">
          <StepIndicator currentStep={step} hasError={processingState === "error"} />
        </div>
      )}

      <div className={processingState !== "success" ? "pt-5" : ""}>
        <DialogTitle className="text-lg sm:text-xl">
          {step === 1 && "Purchase the Product"}
          {step === 2 && processingState === "idle" && "Upload Order Screenshot"}
          {step === 2 && processingState === "scanning" && "Scanning Receipt..."}
          {step === 2 && processingState === "error" && "Scan Failed"}
          {step === 3 && processingState !== "enrolling" && processingState !== "error" && "Review & Confirm"}
          {step === 3 && processingState === "enrolling" && "Creating Enrollment..."}
          {step === 3 && processingState === "error" && "Enrollment Failed"}
          {processingState === "success" && "🎉 You're Enrolled!"}
        </DialogTitle>
        <DialogDescription>
          {step === 1 && "Buy the product first, then upload your order confirmation"}
          {step === 2 && processingState === "idle" && "Drop your order screenshot below"}
          {step === 2 && processingState === "scanning" && "Our AI is extracting order details..."}
          {step === 2 && processingState === "error" && "Please try again with a clearer screenshot"}
          {step === 3 && processingState !== "enrolling" && processingState !== "error" && "Verify details and apply coupon if you have one"}
          {step === 3 && processingState === "enrolling" && "Setting up your enrollment..."}
          {step === 3 && processingState === "error" && "Something went wrong, please try again"}
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
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
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
            {/* Error State - Show INSTEAD of dropbox when scan fails */}
            {processingState === "error" ? (
              <div className="space-y-5">
                {/* Error Message */}
                <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                      <ExclamationTriangleIcon className="size-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-red-800 dark:text-red-300">Receipt Scan Failed</p>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                </div>

                {/* Retry guidance */}
                <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">What you can do:</p>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <CheckCircleIcon className="size-4 shrink-0 text-amber-500" />
                      Upload a clearer screenshot
                    </li>
                    <li className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <CheckCircleIcon className="size-4 shrink-0 text-amber-500" />
                      Make sure Order ID is visible
                    </li>
                    <li className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <CheckCircleIcon className="size-4 shrink-0 text-amber-500" />
                      Include full order total
                    </li>
                  </ul>
                </div>

                {/* Big retry button in the content area */}
                <button
                  type="button"
                  onClick={() => { setError(null); setProcessingState("idle"); setUploadedFiles([]); }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  <CameraIcon className="size-6 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Click to upload a new screenshot
                  </span>
                </button>
              </div>
            ) : (
              <>
                {/* Dropzone - Only show when idle (not in error state) */}
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
              </>
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
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
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
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <InputGroup>
                      <GiftIcon />
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          if (couponResult || couponError) resetCoupon();
                        }}
                        disabled={validatingCoupon}
                      />
                    </InputGroup>
                  </div>
                  <Button
                    outline
                    onClick={handleValidateCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className="shrink-0"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </Button>
                </div>
                {/* Coupon validation result */}
                {couponResult && (
                  <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    couponResult.isValid
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {couponResult.isValid ? (
                      <>
                        <CheckCircleIcon className="size-4" />
                        <span>
                          Coupon applied!
                          {couponResult.bonusAmountDecimal && Number(couponResult.bonusAmountDecimal) > 0 && (
                            <span className="ml-1 font-semibold">+₹{couponResult.bonusAmountDecimal} bonus</span>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="size-4" />
                        <span>Invalid coupon code</span>
                      </>
                    )}
                  </div>
                )}
                {couponError && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    <ExclamationTriangleIcon className="size-4" />
                    <span>{couponError}</span>
                  </div>
                )}
                {!couponResult && !couponError && (
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional - apply a coupon for additional cashback
                  </p>
                )}
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
                      ₹{(
                        ((scanResult.extractedData.orderValue / 100) * (rebatePercentage || 0)) / 100 +
                        (bonusAmount ? parseFloat(bonusAmount) : 0) +
                        (couponResult?.isValid && couponResult?.bonusAmountDecimal ? parseFloat(couponResult.bonusAmountDecimal) : 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-emerald-700 dark:text-emerald-300">
                    <p>{rebatePercentage || 0}% of ₹{(scanResult.extractedData.orderValue / 100).toFixed(2)}</p>
                    {bonusAmount && Number(bonusAmount) > 0 && <p>+ ₹{bonusAmount} bonus</p>}
                    {couponResult?.isValid && couponResult?.bonusAmountDecimal && Number(couponResult.bonusAmountDecimal) > 0 && (
                      <p className="font-semibold">+ ₹{couponResult.bonusAmountDecimal} coupon</p>
                    )}
                  </div>
                </div>
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
            <Button plain onClick={() => { setStep(1); setError(null); setProcessingState("idle"); setUploadedFiles([]); }}>
              Back
            </Button>
            {/* Only show Scan button when not in error state - error state has retry button in content */}
            {processingState !== "error" && (
              <Button onClick={handleScan} disabled={uploadedFiles.length === 0} color="dark/zinc">
                Scan Receipt
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
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

  const product = campaign?.product;
  const platform = campaign?.platform;

  // Set page title
  const pageTitle = campaign?.title
    ? `${campaign.title} | HypeDrive`
    : "Campaign | HypeDrive";
  useDocumentTitle(pageTitle);

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

  if (loading) return <CampaignShowSkeleton />;

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
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        {/* Product Gallery - Left Side */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <ProductImageGallery
            images={product?.productImages}
            primaryImage={product?.primaryImage}
          />
        </div>

        {/* Product Info + Earnings - Right Side */}
        <div className="flex h-full flex-col gap-4">
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
                    <img src={getAssetUrl(platform.logo || platform.icon)} alt="" className="size-4 rounded object-contain" />
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
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 dark:border-zinc-700">
              <BanknotesIcon className="size-4 text-emerald-400" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Your Earnings</p>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
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

          {/* Earnings Calculator */}
          {isActive && (
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 dark:border-zinc-700">
                <CurrencyRupeeIcon className="size-4 text-emerald-400" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Earnings Calculator</p>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4">
                <PayoutCalculator
                  campaignId={campaign.id}
                  rebatePercentage={campaign.rebatePercentage}
                  bonusAmount={pricing?.bonusAmountDecimal}
                />
              </div>
            </div>
          )}

          {/* Quick Stats Cards */}
          <div className="mt-auto grid grid-cols-3 gap-2">
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
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: CAMPAIGN DETAILS (Full Width Grid) */}
      {/* ================================================================== */}
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        {/* Left: How It Works */}
        <CampaignTimeline />

        {/* Right: Tasks */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="size-4 text-rose-500 dark:text-rose-400" />
              <Subheading className="text-sm">Tasks to Complete</Subheading>
            </div>
            {campaign?.tasks && campaign.tasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-900 dark:text-white">{campaign.tasks.filter(t => t.isRequired).length}</span>
                <span className="text-xs text-zinc-400">required</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">{campaign.tasks.length} total</span>
              </div>
            )}
          </div>
          <div className="max-h-72 divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-700">
            {campaign?.tasks && campaign.tasks.length > 0 ? (
              campaign.tasks.map((task, index) => (
                <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                  {/* Platform Icon with Number Overlay */}
                  <div className="relative shrink-0">
                    <TaskIcon name={task.name} platformName={task.platformName} />
                    <span className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white ring-2 ring-white dark:bg-white dark:text-zinc-900 dark:ring-zinc-900">
                      {index + 1}
                    </span>
                  </div>
                  {/* Task Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{task.name}</p>
                      {task.isRequired ? (
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          Required
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          Optional
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{task.description}</p>
                    )}
                    {/* Requirements Row */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {task.requireLink && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                          <LinkIcon className="size-3" />
                          Submit Link
                        </span>
                      )}
                      {task.requireScreenshot && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                          <PhotoIcon className="size-3" />
                          Upload Screenshot
                        </span>
                      )}
                      {task.platformName && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400">
                          {task.platformName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardDocumentListIcon className="size-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm font-medium text-zinc-500">No tasks configured</p>
                <p className="mt-0.5 text-xs text-zinc-400">Tasks will be assigned when you enroll</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coupon hint - always show since coupons can be validated during enrollment */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
        <GiftIcon className="size-3.5" />
        <span>Have a coupon? Enter it during enrollment for bonus cashback</span>
      </div>

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
