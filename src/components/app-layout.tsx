import { Avatar } from "@/components/avatar";
import {
	Dropdown,
	DropdownButton,
	DropdownDivider,
	DropdownItem,
	DropdownLabel,
	DropdownMenu,
} from "@/components/dropdown";
import { Logo } from "@/components/logo";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import {
	Sidebar,
	SidebarBody,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
	SidebarSpacer,
} from "@/components/sidebar";
import { SidebarLayout } from "@/components/sidebar-layout";
import {
	ArrowRightStartOnRectangleIcon,
	ChevronUpIcon,
	LightBulbIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from "@heroicons/react/16/solid";
import {
	ArrowLeftIcon,
	MagnifyingGlassIcon,
	BellIcon,
} from "@heroicons/react/20/solid";
import {
	Squares2X2Icon,
	FireIcon,
	ClockIcon,
	WalletIcon,
	UserCircleIcon as UserCircleSolidIcon,
	QuestionMarkCircleIcon,
	SparklesIcon,
} from "@heroicons/react/20/solid";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import clsx from "clsx";

interface UserIdentity {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	shopperStatus?: string;
}

function AccountDropdownMenu({
	anchor,
	onLogout,
}: {
	anchor: "top start" | "bottom end";
	onLogout: () => void;
}) {
	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem href="/settings">
				<UserCircleIcon />
				<DropdownLabel>My account</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="#">
				<ShieldCheckIcon />
				<DropdownLabel>Privacy policy</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="#">
				<LightBulbIcon />
				<DropdownLabel>Share feedback</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem onClick={onLogout}>
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}

// Tab bar navigation items with solid icons (Profile moved to header)
const tabItems = [
	{ href: "/", label: "Home", icon: Squares2X2Icon },
	{ href: "/campaigns", label: "Campaigns", icon: FireIcon },
	{ href: "/enrollments", label: "Enrollments", icon: ClockIcon },
	{ href: "/wallet", label: "Wallet", icon: WalletIcon },
];

function TabBar({ pathname }: { pathname: string }) {
	return (
		<nav className="fixed inset-x-0 bottom-0 z-50 px-2 pb-safe lg:hidden">
			<div className="flex items-stretch justify-around">
				{tabItems.map((item) => {
					const isActive = item.href === "/"
						? pathname === "/"
						: pathname.startsWith(item.href);
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							to={item.href}
							className="flex flex-1 flex-col items-center justify-center gap-1 py-3"
						>
							<Icon
								className={clsx(
									"size-6",
									isActive
										? "text-zinc-900 dark:text-white"
										: "text-zinc-400 dark:text-zinc-500"
								)}
							/>
							<span
								className={clsx(
									"text-[10px] font-medium",
									isActive
										? "text-zinc-900 dark:text-white"
										: "text-zinc-400 dark:text-zinc-500"
								)}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

// Helper function for user initials
function getInitials(name?: string) {
	if (!name) return "U";
	const parts = name.split(" ");
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

// Tactile button container for header icons
function IconButton({
	onClick,
	"aria-label": ariaLabel,
	children,
}: {
	onClick?: () => void;
	"aria-label": string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-950/5 active:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-white/10 dark:active:bg-zinc-700 [&>svg]:h-4.5 [&>svg]:w-4.5"
		>
			{children}
		</button>
	);
}

// Mobile header component with search/back, logo, notification, profile
function MobileHeader({
	pathname,
	identity,
	onLogout,
}: {
	pathname: string;
	identity?: UserIdentity | null;
	onLogout: () => void;
}) {
	const navigate = useNavigate();

	// Determine if we're on a detail page (has ID in path)
	const isDetailPage = /\/(campaigns|enrollments|wallet|settings)\/[^/]+/.test(pathname);

	return (
		<div className="flex w-full items-center justify-between">
			{/* Left: Search or Back */}
			<div className="flex w-20 shrink-0 justify-start">
				{isDetailPage ? (
					<IconButton onClick={() => navigate(-1)} aria-label="Go back">
						<ArrowLeftIcon />
					</IconButton>
				) : (
					<IconButton onClick={() => console.log("Search clicked")} aria-label="Search">
						<MagnifyingGlassIcon />
					</IconButton>
				)}
			</div>

			{/* Center: Logo */}
			<Logo className="h-6" />

			{/* Right: Notification + Profile */}
			<div className="flex w-20 shrink-0 items-center justify-end gap-2">
				<IconButton onClick={() => console.log("Notifications clicked")} aria-label="Notifications">
					<BellIcon />
				</IconButton>
				<Dropdown>
					<DropdownButton as="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-950/5 active:bg-zinc-50 dark:bg-zinc-800 dark:ring-white/10 dark:active:bg-zinc-700">
						{identity?.avatar ? (
							<img
								src={identity.avatar}
								alt={identity.name || "Profile"}
								className="size-6 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white dark:bg-zinc-600">
								{getInitials(identity?.name)}
							</div>
						)}
					</DropdownButton>
					<AccountDropdownMenu anchor="bottom end" onLogout={onLogout} />
				</Dropdown>
			</div>
		</div>
	);
}

export function AppLayout() {
	const location = useLocation();
	const pathname = location.pathname;
	const { data: identity } = useGetIdentity<UserIdentity>();
	const { mutate: logout } = useLogout();

	const handleLogout = () => {
		logout();
	};

	return (
		<SidebarLayout
			hideNavbarOnMobile
			navbar={
				<Navbar>
					<NavbarSpacer />
					<NavbarSection>
						<Dropdown>
							<DropdownButton as={NavbarItem}>
								{identity?.avatar ? (
									<Avatar src={identity.avatar} square />
								) : (
									<Avatar initials={getInitials(identity?.name)} className="bg-zinc-800 text-white" square />
								)}
							</DropdownButton>
							<AccountDropdownMenu anchor="bottom end" onLogout={handleLogout} />
						</Dropdown>
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<SidebarItem href="/">
							<Logo className="h-6" />
						</SidebarItem>
					</SidebarHeader>

					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/" current={pathname === "/"}>
								<Squares2X2Icon />
								<SidebarLabel>Home</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/campaigns" current={pathname.startsWith("/campaigns")}>
								<FireIcon />
								<SidebarLabel>Campaigns</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/enrollments" current={pathname.startsWith("/enrollments")}>
								<ClockIcon />
								<SidebarLabel>Enrollments</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/wallet" current={pathname.startsWith("/wallet")}>
								<WalletIcon />
								<SidebarLabel>Wallet</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/settings" current={pathname.startsWith("/settings")}>
								<UserCircleSolidIcon />
								<SidebarLabel>Settings</SidebarLabel>
							</SidebarItem>
						</SidebarSection>

						<SidebarSpacer />

						<SidebarSection>
							<SidebarItem href="#">
								<QuestionMarkCircleIcon />
								<SidebarLabel>Support</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="#">
								<SparklesIcon />
								<SidebarLabel>Changelog</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					</SidebarBody>

					<SidebarFooter className="max-lg:hidden">
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<span className="flex min-w-0 items-center gap-3">
									{identity?.avatar ? (
										<Avatar src={identity.avatar} className="size-10" square alt="" />
									) : (
										<Avatar initials={getInitials(identity?.name)} className="size-10 bg-zinc-800 text-white" square />
									)}
									<span className="min-w-0">
										<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
											{identity?.name || "User"}
										</span>
										<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
											{identity?.email || ""}
										</span>
									</span>
								</span>
								<ChevronUpIcon />
							</DropdownButton>
							<AccountDropdownMenu anchor="top start" onLogout={handleLogout} />
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
			tabBar={<TabBar pathname={pathname} />}
			mobileHeader={<MobileHeader pathname={pathname} identity={identity} onLogout={handleLogout} />}
		>
			{/* Content */}
			<div className="px-4 py-6 lg:px-10 lg:py-8">
				<Outlet />
			</div>
		</SidebarLayout>
	);
}
