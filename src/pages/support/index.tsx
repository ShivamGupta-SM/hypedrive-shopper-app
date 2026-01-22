import { Heading, Subheading, SectionTitle } from "@/components/heading";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Link } from "@/components/link";
import { MenuSection, MenuRow, MenuSeparator, duotoneColors } from "@/components/menu-list";
import { Text } from "@/components/text";
import {
  BanknotesIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { useState, useCallback } from "react";
import { useDocumentTitle } from "@/hooks";

// =============================================================================
// FAQ DATA
// =============================================================================

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I join a campaign?",
    answer: "Browse available campaigns, click on one you're interested in, and tap 'Enroll Now'. You'll need to purchase the product first, then upload your order screenshot for verification. Once approved, complete the deliverables to earn your cashback.",
  },
  {
    category: "Getting Started",
    question: "What are deliverables?",
    answer: "Deliverables are tasks you need to complete after purchasing a product, such as posting a review, sharing on social media, or creating content. Each campaign specifies its required deliverables.",
  },
  {
    category: "Getting Started",
    question: "How long do I have to complete deliverables?",
    answer: "Each campaign has a deadline for deliverable submission, typically 7-14 days after enrollment. You can see the deadline on your enrollment details page. Missing the deadline may result in enrollment expiration.",
  },
  // Payments
  {
    category: "Payments",
    question: "How do I receive my cashback?",
    answer: "Once your deliverables are approved, cashback is credited to your wallet. You can withdraw to your linked bank account or UPI. Withdrawals are typically processed within 2-3 business days.",
  },
  {
    category: "Payments",
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is ₹100. You can withdraw any amount above this threshold to your linked bank account or UPI ID.",
  },
  {
    category: "Payments",
    question: "Why is my withdrawal pending?",
    answer: "Withdrawals are processed within 2-3 business days. If your withdrawal is pending for longer, ensure your bank details are correct. For amounts over ₹30,000, KYC verification is required.",
  },
  {
    category: "Payments",
    question: "Do I need to complete KYC?",
    answer: "KYC (PAN verification) is required for withdrawals exceeding ₹30,000 as per RBI guidelines. You can complete KYC anytime from Settings > Identity Verification.",
  },
  // Enrollments
  {
    category: "Enrollments",
    question: "My order screenshot wasn't accepted. What should I do?",
    answer: "Ensure your screenshot clearly shows: Order ID, product name, order total, and purchase date. Use a high-quality screenshot without cropping important details. If issues persist, contact support.",
  },
  {
    category: "Enrollments",
    question: "Can I enroll in multiple campaigns?",
    answer: "Yes! You can participate in as many campaigns as you like, as long as each campaign has available spots and you meet the eligibility criteria.",
  },
  {
    category: "Enrollments",
    question: "What happens if my deliverable is rejected?",
    answer: "If rejected, you'll receive feedback explaining what needs to be fixed. You can resubmit updated deliverables. Repeated rejections may result in permanent rejection, so carefully follow the guidelines.",
  },
  {
    category: "Enrollments",
    question: "Can I withdraw from a campaign?",
    answer: "Yes, you can withdraw from a campaign before submitting deliverables. However, if you've already purchased the product, the purchase cannot be refunded through our platform.",
  },
  // Account
  {
    category: "Account",
    question: "How do I change my email address?",
    answer: "Go to Settings > Account Info > Email. Enter your new email and we'll send a verification link. Click the link to confirm the change.",
  },
  {
    category: "Account",
    question: "How do I add a bank account for withdrawals?",
    answer: "Go to Settings > Payout Methods > Add New. You can add a bank account (with account number and IFSC) or UPI ID. Verify your account with a small test deposit.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer: "Contact our support team to request account deletion. Note that any pending withdrawals will be processed before deletion, and your data will be permanently removed.",
  },
];

// Group FAQs by category
const faqByCategory = faqData.reduce((acc, faq) => {
  if (!acc[faq.category]) {
    acc[faq.category] = [];
  }
  acc[faq.category].push(faq);
  return acc;
}, {} as Record<string, FAQItem[]>);

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Getting Started": QuestionMarkCircleIcon,
  "Payments": CurrencyRupeeIcon,
  "Enrollments": CameraIcon,
  "Account": UserCircleIcon,
};

const categoryColors: Record<string, keyof typeof duotoneColors> = {
  "Getting Started": "sky",
  "Payments": "emerald",
  "Enrollments": "amber",
  "Account": "zinc",
};

// =============================================================================
// FAQ ACCORDION COMPONENT
// =============================================================================

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-200 last:border-0 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[15px] font-medium text-zinc-900 dark:text-white">
          {item.question}
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// QUICK HELP CARDS
// =============================================================================

function QuickHelpCard({
  icon: Icon,
  iconColor,
  title,
  description,
  href,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: keyof typeof duotoneColors;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}) {
  const colors = duotoneColors[iconColor];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const content = (
    <>
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`size-5 ${colors.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-zinc-400" />
    </>
  );

  // If it's an internal anchor link, use button with scroll behavior
  if (onClick) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-700/50"
      >
        {content}
      </button>
    );
  }

  // External link
  return (
    <Link
      href={href || "#"}
      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-700/50"
    >
      {content}
    </Link>
  );
}

// =============================================================================
// CONTACT SECTION
// =============================================================================

function ContactSection() {
  return (
    <div className="space-y-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <EnvelopeIcon className="size-4 text-zinc-400" />
        <SectionTitle>Contact Us</SectionTitle>
      </div>
      <MenuSection>
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
              <ChatBubbleLeftRightIcon className={`size-6 ${duotoneColors.sky.icon}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900 dark:text-white">Need more help?</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Our support team typically responds within 24 hours.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="mailto:support@hypedrive.com"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  <EnvelopeIcon className="size-4" />
                  Email Support
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </MenuSection>
    </div>
  );
}

// =============================================================================
// STATUS INDICATORS
// =============================================================================

function StatusCard() {
  return (
    <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">All Systems Operational</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Payments, enrollments, and all services working normally.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LEGAL LINKS
// =============================================================================

function LegalSection() {
  return (
    <div className="space-y-3">
      <div className="mb-2 flex items-center gap-2 px-1">
        <DocumentTextIcon className="size-4 text-zinc-400" />
        <SectionTitle>Legal</SectionTitle>
      </div>
      <MenuSection>
        <Link href="/terms" target="_blank">
          <MenuRow
            icon={DocumentTextIcon}
            iconColor="zinc"
            label="Terms of Service"
            isFirst
          />
        </Link>
        <MenuSeparator />
        <Link href="/privacy" target="_blank">
          <MenuRow
            icon={ShieldCheckIcon}
            iconColor="emerald"
            label="Privacy Policy"
          />
        </Link>
        <MenuSeparator />
        <Link href="/refund" target="_blank">
          <MenuRow
            icon={BanknotesIcon}
            iconColor="amber"
            label="Refund Policy"
            isLast
          />
        </Link>
      </MenuSection>
    </div>
  );
}

// =============================================================================
// MAIN SUPPORT PAGE
// =============================================================================

export function Support() {
  useDocumentTitle("Help & Support | HypeDrive");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Scroll to section and select category
  const scrollToCategory = useCallback((categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryName);
    // Small delay to allow category filter to apply
    setTimeout(() => {
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <Heading>Help & Support</Heading>
        <Text className="mt-1 text-sm">Find answers or get in touch with our team</Text>
      </div>

      {/* System Status */}
      <StatusCard />

      {/* Quick Help Links */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <QuestionMarkCircleIcon className="size-4 text-zinc-400" />
          <SectionTitle>Quick Help</SectionTitle>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <QuickHelpCard
            icon={CameraIcon}
            iconColor="amber"
            title="Upload Issues"
            description="Screenshot not accepted?"
            onClick={() => scrollToCategory("enrollments", "Enrollments")}
          />
          <QuickHelpCard
            icon={CurrencyRupeeIcon}
            iconColor="emerald"
            title="Withdrawal Help"
            description="Pending payments & KYC"
            onClick={() => scrollToCategory("payments", "Payments")}
          />
          <QuickHelpCard
            icon={ClockIcon}
            iconColor="sky"
            title="Deadlines"
            description="Submission timelines"
            onClick={() => scrollToCategory("getting-started", "Getting Started")}
          />
          <QuickHelpCard
            icon={UserCircleIcon}
            iconColor="zinc"
            title="Account Settings"
            description="Profile & payout methods"
            href="/settings"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ChatBubbleLeftRightIcon className="size-4 text-zinc-400" />
          <SectionTitle>Frequently Asked Questions</SectionTitle>
        </div>

        {/* Category Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-2 pb-2 sm:flex-wrap sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            {Object.keys(faqByCategory).map((category) => {
              const Icon = categoryIcons[category] || QuestionMarkCircleIcon;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Icon className="size-4" />
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        {Object.entries(faqByCategory)
          .filter(([category]) => selectedCategory === null || selectedCategory === category)
          .map(([category, items]) => (
            <div key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-20">
              <div className="mb-3 flex items-center gap-2 px-1">
                {(() => {
                  const Icon = categoryIcons[category] || QuestionMarkCircleIcon;
                  const color = categoryColors[category] || "zinc";
                  const colors = duotoneColors[color];
                  return (
                    <>
                      <div className={`flex size-6 items-center justify-center rounded-lg ${colors.bg}`}>
                        <Icon className={`size-3.5 ${colors.icon}`} />
                      </div>
                      <Subheading className="!text-base">{category}</Subheading>
                    </>
                  );
                })()}
              </div>
              <MenuSection>
                <div className="px-4">
                  {items.map((item) => (
                    <FAQAccordion key={item.question} item={item} />
                  ))}
                </div>
              </MenuSection>
            </div>
          ))}
      </div>

      {/* Contact Section */}
      <ContactSection />

      {/* Legal Links */}
      <LegalSection />

      {/* App Version */}
      <div className="text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Hypedrive Shopper v1.0.0
        </p>
      </div>
    </div>
  );
}
