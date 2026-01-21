import {
	ArrowLeftIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	ScaleIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	BanknotesIcon,
	NoSymbolIcon,
	EnvelopeIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router";

// Section card component for visual grouping
function Section({
	icon: Icon,
	iconColor,
	title,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="mb-4 flex items-center gap-3">
				<div className={`flex size-10 items-center justify-center rounded-xl ${iconColor}`}>
					<Icon className="size-5 text-white" />
				</div>
				<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
			</div>
			<div className="space-y-4 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
				{children}
			</div>
		</div>
	);
}

// Highlight box for important information
function HighlightBox({
	type,
	children,
}: {
	type: "info" | "warning";
	children: React.ReactNode;
}) {
	const styles = {
		info: "bg-sky-50 ring-sky-200/50 dark:bg-sky-950/30 dark:ring-sky-800/50",
		warning: "bg-amber-50 ring-amber-200/50 dark:bg-amber-950/30 dark:ring-amber-800/50",
	};
	const textStyles = {
		info: "text-sky-800 dark:text-sky-200",
		warning: "text-amber-800 dark:text-amber-200",
	};
	const Icon = type === "warning" ? ExclamationTriangleIcon : CheckCircleIcon;
	const iconColor = type === "warning" ? "text-amber-500" : "text-sky-500";

	return (
		<div className={`flex gap-3 rounded-xl p-4 ring-1 ${styles[type]}`}>
			<Icon className={`size-5 shrink-0 ${iconColor}`} />
			<p className={`text-sm ${textStyles[type]}`}>{children}</p>
		</div>
	);
}

// List with checkmarks
function CheckList({ items }: { items: string[] }) {
	return (
		<ul className="space-y-2">
			{items.map((item, i) => (
				<li key={i} className="flex items-start gap-2">
					<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

export function TermsOfService() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
				<div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex size-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						<ArrowLeftIcon className="size-5" />
					</button>
					<div>
						<h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Terms of Service
						</h1>
						<p className="text-xs text-zinc-500">Last updated: January 2026</p>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
				{/* Intro */}
				<div className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-white dark:text-zinc-900">
					<DocumentTextIcon className="mb-3 size-8 text-emerald-400 dark:text-emerald-600" />
					<h2 className="text-xl font-bold">Welcome to Hypedrive</h2>
					<p className="mt-2 text-sm text-zinc-300 dark:text-zinc-600">
						By using our service, you agree to these terms. Please read them carefully before using the Hypedrive Shopper app.
					</p>
				</div>

				{/* What is Hypedrive */}
				<Section icon={CheckCircleIcon} iconColor="bg-emerald-500" title="What is Hypedrive?">
					<p>
						Hypedrive Shopper connects you with brands for promotional campaigns. You can:
					</p>
					<CheckList
						items={[
							"Participate in campaigns by purchasing products",
							"Complete deliverables like reviews or social posts",
							"Earn cashback rewards for successful completions",
						]}
					/>
				</Section>

				{/* Eligibility */}
				<Section icon={UserCircleIcon} iconColor="bg-sky-500" title="Who Can Use Hypedrive?">
					<p>To use our service, you must:</p>
					<CheckList
						items={[
							"Be at least 18 years of age",
							"Have legal capacity to enter agreements",
							"Provide accurate registration information",
							"Not be prohibited by applicable laws",
						]}
					/>
					<HighlightBox type="info">
						You're responsible for keeping your account credentials secure and for all activities under your account.
					</HighlightBox>
				</Section>

				{/* Campaign Participation */}
				<Section icon={ShieldCheckIcon} iconColor="bg-violet-500" title="Campaign Participation">
					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Enrollment</h3>
							<p>
								When you enroll, you agree to purchase the specified product and complete all required deliverables within the timeframe.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Deliverables</h3>
							<p>
								All submissions must be original, authentic, and comply with campaign requirements. Fraudulent submissions are prohibited.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Verification</h3>
							<p>
								We verify purchases and submissions. Invalid proof may result in rejection and forfeiture of rewards.
							</p>
						</div>
					</div>
				</Section>

				{/* Payments */}
				<Section icon={BanknotesIcon} iconColor="bg-emerald-500" title="Payments & Rewards">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="text-sm font-medium text-zinc-900 dark:text-white">Cashback</p>
							<p className="mt-1 text-sm">
								Credited to wallet after deliverables approval
							</p>
						</div>
						<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
							<p className="text-sm font-medium text-zinc-900 dark:text-white">Withdrawals</p>
							<p className="mt-1 text-sm">
								Min ₹100 • 2-3 business days processing
							</p>
						</div>
					</div>
					<HighlightBox type="warning">
						KYC (PAN verification) is required for withdrawals exceeding ₹30,000 as per RBI guidelines.
					</HighlightBox>
				</Section>

				{/* Prohibited */}
				<Section icon={NoSymbolIcon} iconColor="bg-red-500" title="Prohibited Activities">
					<p>You agree NOT to:</p>
					<ul className="space-y-2">
						{[
							"Create multiple accounts or use false identities",
							"Submit fake or fraudulent purchase proofs",
							"Post fake reviews or misleading content",
							"Manipulate the platform or exploit vulnerabilities",
							"Violate laws or third-party rights",
						].map((item, i) => (
							<li key={i} className="flex items-start gap-2">
								<NoSymbolIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
								<span>{item}</span>
							</li>
						))}
					</ul>
					<HighlightBox type="warning">
						Violations may result in account suspension, forfeiture of pending cashback, and permanent ban.
					</HighlightBox>
				</Section>

				{/* Legal */}
				<Section icon={ScaleIcon} iconColor="bg-zinc-700" title="Legal">
					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Limitation of Liability</h3>
							<p className="text-sm">
								To the maximum extent permitted by law, Hypedrive is not liable for indirect, incidental, or consequential damages.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Governing Law</h3>
							<p className="text-sm">
								These terms are governed by Indian law. Disputes are subject to courts in Bangalore, Karnataka.
							</p>
						</div>
						<div>
							<h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Changes</h3>
							<p className="text-sm">
								We may update these terms. Significant changes will be notified via app or email.
							</p>
						</div>
					</div>
				</Section>

				{/* Contact */}
				<Section icon={EnvelopeIcon} iconColor="bg-sky-500" title="Contact Us">
					<p>Questions about these terms?</p>
					<div className="flex flex-wrap gap-3">
						<a
							href="mailto:legal@hypedrive.com"
							className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
						>
							<EnvelopeIcon className="size-4" />
							legal@hypedrive.com
						</a>
						<a
							href="mailto:support@hypedrive.com"
							className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
						>
							<EnvelopeIcon className="size-4" />
							support@hypedrive.com
						</a>
					</div>
				</Section>

				{/* Footer spacing */}
				<div className="h-8" />
			</main>
		</div>
	);
}
