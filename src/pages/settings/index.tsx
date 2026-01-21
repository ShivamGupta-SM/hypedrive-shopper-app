import { Button } from "@/components/button";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/dialog";
import { Heading, SectionTitle } from "@/components/heading";
import { UpiIcon } from "@/components/icons/upi-icon";
import { MenuSection, MenuRow, MenuSeparator, MenuDangerButton } from "@/components/menu-list";
import { Text } from "@/components/text";
import {
  useShopperProfile,
  useShopperStats,
  useWithdrawalMethods,
  useNotificationPreferences,
  useDeviceSessions,
  useRevokeDeviceSession,
  useRevokeOtherSessions,
  useGetIdentity,
  useChangeEmail,
  useChangePassword,
  useUpdateShopperProfile,
  useSubmitPAN,
  useAddWithdrawalMethod,
  useVerifyWithdrawalMethod,
  useSetDefaultWithdrawalMethod,
  useDeleteWithdrawalMethod,
  useUpdateNotificationPreferences,
  useUploadProfilePicture,
  type AuthUser,
} from "@/hooks/use-api";
import { SettingsSkeleton } from "@/lib/skeleton";
import type { wallets } from "@/hooks/use-api";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon as ShieldCheckIconSolid,
  MapPinIcon,
  CameraIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  EnvelopeIcon,
  DeviceTabletIcon,
  PencilIcon,
  BanknotesIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon as MonitorIcon,
  UserGroupIcon,
} from "@heroicons/react/16/solid";
import { duotoneColors, type DuotoneColor } from "@/components/menu-list";
import { useLogout } from "@/store/auth-store";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { showError, showSuccess } from "@/lib/toast";

// =============================================================================
// LOADING & UTILITY COMPONENTS
// =============================================================================

function LoadingState() {
  return <SettingsSkeleton />;
}

// =============================================================================
// EDIT PROFILE VIEW - Full page editor for all profile fields
// =============================================================================

interface EditProfileViewProps {
  profile: {
    displayName: string;
    phoneNumber: string;
    bio: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  onSave: () => void;
  onBack: () => void;
}

function FormField({
  icon: Icon,
  iconColor,
  label,
  children,
  optional,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: DuotoneColor;
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  const colors = duotoneColors[iconColor];
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`size-4 ${colors.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <label className="text-[13px] text-zinc-500 dark:text-zinc-400">
          {label}
          {optional && <span className="ml-1 text-zinc-400">(Optional)</span>}
        </label>
        {children}
      </div>
    </div>
  );
}

function EditProfileView({ profile, onSave, onBack }: EditProfileViewProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    phoneNumber: profile.phoneNumber,
    bio: profile.bio,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    postalCode: profile.postalCode,
  });
  const [error, setError] = useState<string | null>(null);
  const { updateProfile, isPending: loading } = useUpdateShopperProfile();

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  ];

  const hasChanges = () => {
    return (
      formData.displayName !== profile.displayName ||
      formData.phoneNumber !== profile.phoneNumber ||
      formData.bio !== profile.bio ||
      formData.address !== profile.address ||
      formData.city !== profile.city ||
      formData.state !== profile.state ||
      formData.postalCode !== profile.postalCode
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.phoneNumber && !/^[+]?[\d\s-]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      return;
    }
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      setError("Please enter a valid 6-digit PIN code");
      return;
    }

    setError(null);

    try {
      await updateProfile({
        displayName: formData.displayName.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode.trim() || undefined,
      });

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <Heading>Edit Profile</Heading>
        <Text className="mt-1 text-sm">Update your personal information</Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info Section */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <UserIcon className="size-4 text-zinc-400" />
            <SectionTitle>Personal Info</SectionTitle>
          </div>
          <MenuSection>
            <FormField icon={UserIcon} iconColor="sky" label="Display Name">
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How you want to be called"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
            </FormField>

            <MenuSeparator />

            <FormField icon={DevicePhoneMobileIcon} iconColor="emerald" label="Phone Number">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
            </FormField>

            <MenuSeparator />

            <FormField icon={ChatBubbleLeftRightIcon} iconColor="orange" label="Bio" optional>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={2}
                maxLength={200}
                className="mt-1 w-full resize-none bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
              <p className="mt-1 text-right text-[11px] text-zinc-400">{formData.bio.length}/200</p>
            </FormField>
          </MenuSection>
        </div>

        {/* Address Section */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <MapPinIcon className="size-4 text-zinc-400" />
            <SectionTitle>Address</SectionTitle>
          </div>
          <MenuSection>
            <FormField icon={MapPinIcon} iconColor="red" label="Street Address">
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House no., Building, Street, Area"
                rows={2}
                className="mt-1 w-full resize-none bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
            </FormField>

            <MenuSeparator />

            <FormField icon={BuildingLibraryIcon} iconColor="sky" label="City">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
            </FormField>

            <MenuSeparator />

            <FormField icon={IdentificationIcon} iconColor="amber" label="State">
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full appearance-none bg-transparent text-base text-zinc-900 focus:outline-none dark:text-white [&>option]:bg-white [&>option]:text-zinc-900 dark:[&>option]:bg-zinc-800 dark:[&>option]:text-white"
              >
                <option value="">Select state</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </FormField>

            <MenuSeparator />

            <FormField icon={DocumentTextIcon} iconColor="zinc" label="PIN Code">
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="6-digit PIN code"
                maxLength={6}
                inputMode="numeric"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
              />
            </FormField>
          </MenuSection>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            <XCircleIcon className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Fixed Save Button at bottom */}
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:bottom-0 lg:left-64 dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="mx-auto flex max-w-7xl gap-3 lg:px-6">
            <Button type="button" outline onClick={onBack} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasChanges()}
              color="dark/zinc"
              className="flex-1"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// CHANGE EMAIL DIALOG
// =============================================================================

function ChangeEmailDialog({
  open,
  currentEmail,
  onSave,
  onCancel,
}: {
  open: boolean;
  currentEmail: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { changeEmail, isPending: loading, reset: resetMutation } = useChangeEmail();

  useEffect(() => {
    if (open) {
      setNewEmail("");
      setError(null);
      setSuccess(false);
      resetMutation();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, resetMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      setError("Please enter a new email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("New email must be different from current email");
      return;
    }

    setError(null);

    try {
      await changeEmail({ newEmail: newEmail.trim() });
      setSuccess(true);
      setTimeout(() => onSave(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change email");
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.orange.bg}`}>
          <AtSymbolIcon className={`size-4 ${duotoneColors.orange.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Change Email</DialogTitle>
          <DialogDescription className="mt-1">
            A verification link will be sent to your new email.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        <form id="change-email-form" onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <div className="px-4 py-3">
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Current Email</p>
              <p className="mt-1 text-base text-zinc-600 dark:text-zinc-300">{currentEmail}</p>
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label className="text-[13px] text-zinc-500 dark:text-zinc-400">New Email</label>
              <input
                ref={inputRef}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              Verification email sent! Check your inbox.
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={onCancel}>Cancel</Button>
        <Button type="submit" form="change-email-form" disabled={loading || success} color="dark/zinc">
          {loading ? "Sending..." : success ? "Sent!" : "Send Verification"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// CHANGE PASSWORD DIALOG
// =============================================================================

function ChangePasswordDialog({
  open,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const { changePassword, isPending: loading, reset: resetMutation } = useChangePassword();

  useEffect(() => {
    if (open) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setError(null);
      setSuccess(false);
      setRevokeOtherSessions(false);
      resetMutation();
    }
  }, [open, resetMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword.trim()) {
      setError("Please enter your current password");
      return;
    }
    if (!formData.newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        revokeOtherSessions,
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
          <LockClosedIcon className={`size-4 ${duotoneColors.amber.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Change Password</DialogTitle>
          <DialogDescription className="mt-1">
            Update your account password for security.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <div className="px-4 py-3">
              <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label className="text-[13px] text-zinc-500 dark:text-zinc-400">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password (min. 8 characters)"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Revoke other sessions option */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <input
              type="checkbox"
              checked={revokeOtherSessions}
              onChange={(e) => setRevokeOtherSessions(e.target.checked)}
              className="size-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Sign out other devices</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Log out from all other active sessions</p>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              Password changed successfully!
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={onCancel}>Cancel</Button>
        <Button type="submit" form="change-password-form" disabled={loading || success} color="dark/zinc">
          {loading ? "Changing..." : success ? "Changed!" : "Change Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// ACTIVE SESSIONS DIALOG
// =============================================================================

function SessionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: sessions, loading, refetch } = useDeviceSessions();
  const { revoke, revoking: isRevoking } = useRevokeDeviceSession();
  const { revokeAll, revoking: isRevokingAll } = useRevokeOtherSessions();
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token);
    const success = await revoke(token);
    if (success) {
      refetch();
    }
    setRevokingToken(null);
  };

  const handleRevokeOtherSessions = async () => {
    const success = await revokeAll();
    if (success) {
      refetch();
    }
  };

  const formatSessionDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const getDeviceIcon = (session: { device?: string; userAgent?: string | null }) => {
    // Use device field if available (from DeviceSession)
    if (session.device) {
      const device = session.device.toLowerCase();
      if (device.includes("mobile") || device.includes("phone")) return DevicePhoneMobileIcon;
      if (device.includes("tablet")) return DeviceTabletIcon;
    }
    // Fallback to userAgent parsing
    if (!session.userAgent) return ComputerDesktopIcon;
    const ua = session.userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return DevicePhoneMobileIcon;
    }
    return ComputerDesktopIcon;
  };

  const getDeviceName = (session: { device?: string; userAgent?: string | null }) => {
    // Use device field if available
    if (session.device) return session.device;
    // Fallback to userAgent parsing
    if (!session.userAgent) return "Unknown Device";
    const ua = session.userAgent.toLowerCase();
    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android")) return "Android";
    if (ua.includes("mac")) return "Mac";
    if (ua.includes("windows")) return "Windows";
    if (ua.includes("linux")) return "Linux";
    return "Unknown Device";
  };

  const getBrowserName = (session: { browser?: string; userAgent?: string | null }) => {
    // Use browser field if available
    if (session.browser) return session.browser;
    // Fallback to userAgent parsing
    if (!session.userAgent) return "";
    const ua = session.userAgent.toLowerCase();
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("edge")) return "Edge";
    return "";
  };

  // Count other sessions (non-current)
  const otherSessionsCount = sessions.filter(s => !s.current).length;

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
          <ComputerDesktopIcon className={`size-4 ${duotoneColors.sky.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Active Sessions</DialogTitle>
          <DialogDescription className="mt-1">
            Manage devices where you're signed in.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">No active sessions found</div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session);
              const isCurrentSession = session.current;

              return (
                <div
                  key={session.id || session.token}
                  className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    isCurrentSession ? duotoneColors.emerald.bg : duotoneColors.zinc.bg
                  }`}>
                    <DeviceIcon className={`size-5 ${
                      isCurrentSession ? duotoneColors.emerald.icon : duotoneColors.zinc.icon
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {getDeviceName(session)}
                        {getBrowserName(session) && ` · ${getBrowserName(session)}`}
                      </p>
                      {isCurrentSession && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {session.ipAddress && (
                        <>
                          <GlobeAltIcon className="size-3" />
                          <span>{session.ipAddress}</span>
                          <span>·</span>
                        </>
                      )}
                      <ClockIcon className="size-3" />
                      <span>{formatSessionDate(session.createdAt)}</span>
                    </div>
                  </div>
                  {!isCurrentSession && session.token && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.token)}
                      disabled={revokingToken === session.token || isRevoking}
                      className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400"
                    >
                      {revokingToken === session.token ? "..." : "Sign out"}
                    </button>
                  )}
                </div>
              );
            })}

            {otherSessionsCount > 0 && (
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                disabled={isRevokingAll}
                className="mt-2 w-full rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                {isRevokingAll ? "Signing out..." : `Sign out all other devices (${otherSessionsCount})`}
              </button>
            )}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button type="button" onClick={onClose} color="dark/zinc">Done</Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// ADD BANK ACCOUNT DIALOG
// =============================================================================

function AddBankAccountDialog({
  open,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [accountType, setAccountType] = useState<"bank_account" | "upi">("bank_account");
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { addMethod, isPending: loading, reset: resetMutation } = useAddWithdrawalMethod();

  useEffect(() => {
    if (open) {
      setAccountType("bank_account");
      setFormData({
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        bankName: "",
        ifscCode: "",
        upiId: "",
      });
      setError(null);
      resetMutation();
    }
  }, [open, resetMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (accountType === "bank_account") {
      if (!formData.accountHolderName.trim()) {
        setError("Account holder name is required");
        return;
      }
      if (!formData.accountNumber.trim()) {
        setError("Account number is required");
        return;
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        setError("Account numbers do not match");
        return;
      }
      if (!formData.ifscCode.trim()) {
        setError("IFSC code is required");
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
        setError("Invalid IFSC code format");
        return;
      }
    } else {
      if (!formData.upiId.trim()) {
        setError("UPI ID is required");
        return;
      }
      if (!/^[\w.-]+@[\w]+$/.test(formData.upiId)) {
        setError("Invalid UPI ID format (e.g., user@upi)");
        return;
      }
    }

    try {
      await addMethod({
        accountType,
        ...(accountType === "bank_account"
          ? {
              accountHolderName: formData.accountHolderName.trim(),
              accountNumber: formData.accountNumber.trim(),
              bankName: formData.bankName.trim() || undefined,
              ifscCode: formData.ifscCode.toUpperCase().trim(),
            }
          : {
              upiId: formData.upiId.trim(),
            }),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment method");
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
          <BanknotesIcon className={`size-4 ${duotoneColors.sky.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Add Payout Method</DialogTitle>
          <DialogDescription className="mt-1">Add a bank account or UPI for withdrawals.</DialogDescription>
        </div>
      </div>

      <DialogBody>
        <form id="add-bank-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Account Type Selection */}
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
            <button
              type="button"
              onClick={() => setAccountType("bank_account")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
                <BuildingLibraryIcon className={`size-4 ${duotoneColors.sky.icon}`} />
              </div>
              <span className="flex-1 text-base text-zinc-900 dark:text-white">Bank Account</span>
              {accountType === "bank_account" && <CheckCircleIcon className="size-5 text-emerald-500" />}
            </button>
            <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />
            <button
              type="button"
              onClick={() => setAccountType("upi")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
                <UpiIcon className={`size-4 ${duotoneColors.emerald.icon}`} />
              </div>
              <span className="flex-1 text-base text-zinc-900 dark:text-white">UPI</span>
              {accountType === "upi" && <CheckCircleIcon className="size-5 text-emerald-500" />}
            </button>
          </div>

          {/* Form Fields */}
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            {accountType === "bank_account" ? (
              <>
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="Name as per bank records"
                    className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Confirm Account Number</label>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                    placeholder="Re-enter account number"
                    className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Bank Name <span className="text-zinc-400">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g., State Bank of India"
                    className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., SBIN0001234"
                    maxLength={11}
                    className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
              </>
            ) : (
              <div className="px-4 py-3">
                <label className="text-[13px] text-zinc-500 dark:text-zinc-400">UPI ID</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="e.g., yourname@upi"
                  className="mt-1 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4" />
              {error}
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={onCancel}>Cancel</Button>
        <Button type="submit" form="add-bank-form" disabled={loading} color="dark/zinc">
          {loading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// KYC VERIFICATION DIALOG
// =============================================================================

/**
 * PAN-only KYC Verification Dialog
 * NOTE: Aadhaar verification removed as per API v2 - KYC is PAN-only now
 */
function KYCVerificationDialog({
  open,
  kycStatus: _kycStatus,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  kycStatus: { status?: string; panVerified?: boolean } | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [panNumber, setPanNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const { submitPAN, isPending: loading, reset: resetMutation } = useSubmitPAN();

  useEffect(() => {
    if (open) {
      setPanNumber("");
      setError(null);
      setVerifiedName(null);
      resetMutation();
    }
  }, [open, resetMutation]);

  const handleSubmitPAN = async () => {
    // Client-side validation
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      setError("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    setError(null);

    try {
      const result = await submitPAN({ panNumber: panNumber.toUpperCase() });

      if (result.verified) {
        setVerifiedName(result.name || null);
        // Close dialog and refresh after success
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(result.error || "PAN verification failed. Please check the number.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify PAN");
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
          <IdentificationIcon className={`size-4 ${duotoneColors.amber.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">Verify PAN</DialogTitle>
          <DialogDescription className="mt-1">
            Enter your PAN card number for identity verification.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        <div className="space-y-4">
          {/* PAN Input */}
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <div className="px-4 py-3">
              <label className="text-[13px] text-zinc-500 dark:text-zinc-400">PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="mt-1 w-full bg-transparent font-mono text-base uppercase tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                autoFocus
              />
            </div>
          </div>

          {/* Success Message */}
          {verifiedName && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              <span>PAN verified! Name: <strong>{verifiedName}</strong></span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <ExclamationCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Info Note */}
          <div className="rounded-xl bg-sky-50 p-3 text-xs text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            Your PAN will be verified instantly using government databases. Make sure the PAN number matches your official documents.
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSubmitPAN}
          disabled={loading || panNumber.length !== 10 || !!verifiedName}
          color="dark/zinc"
        >
          {loading ? "Verifying..." : verifiedName ? "Verified" : "Verify PAN"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// PROFILE CARD - Premium design with cover, overlapping avatar, and stats
// =============================================================================

/*
 * BACKUP OF ORIGINAL ProfileCard (for reference):
 * - Simple card with avatar, name, email, member since
 * - No cover image, no stats row
 * - Restored by reverting this edit if needed
 */

function ProfileCard({
  profile,
  stats,
  isVerified,
  isMediator,
  onEdit,
  onAvatarChange,
  avatarUploading,
}: {
  profile: {
    userName: string;
    userEmail: string;
    initials: string;
    avatarUrl?: string;
    memberSince: string;
  };
  stats?: {
    totalEnrollments: number;
    approvedEnrollments: number;
    totalEarnings: string;
  };
  isVerified: boolean;
  isMediator?: boolean;
  onEdit: () => void;
  onAvatarChange: (file: File) => void;
  avatarUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Cover - sky blue gradient (top darker, bottom lighter fading to white) */}
      <div className="relative h-24 bg-gradient-to-b from-sky-200 via-sky-100 to-white dark:from-sky-900/50 dark:via-sky-900/20 dark:to-zinc-900">
        {/* Top right actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isMediator && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-sky-700 shadow-sm ring-1 ring-sky-200 backdrop-blur-sm dark:bg-zinc-800/90 dark:text-sky-400 dark:ring-sky-800">
              <UserGroupIcon className="size-3.5" />
              Mediator
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            <PencilIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Profile content */}
      <div className="px-5 pb-5">
        {/* Avatar - overlapping cover with solid white wrapper for opaque border */}
        <div className="-mt-14 mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="group relative"
          >
            {/* Solid white wrapper creates opaque "border" effect */}
            <div className="rounded-full bg-white p-1 shadow-sm dark:bg-zinc-900">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.userName}
                  className="size-[88px] rounded-full object-cover"
                />
              ) : (
                <div className="flex size-[88px] items-center justify-center rounded-full bg-zinc-100 text-2xl font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {profile.initials}
                </div>
              )}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {avatarUploading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <CameraIcon className="size-5 text-white" />
              )}
            </div>
            {/* Verified badge */}
            {isVerified && !avatarUploading && (
              <div className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-emerald-500 ring-[3px] ring-white dark:ring-zinc-900">
                <CheckCircleIcon className="size-4 text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAvatarChange(file);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>

        {/* Name and email - always left-aligned */}
        <div>
          <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {profile.userName}
          </h2>
          <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
            {profile.userEmail}
          </p>
        </div>

      </div>

      {/* Stats row - edge to edge */}
      {stats && (
        <div className="flex divide-x divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          <div className="flex-1 py-4 text-center">
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {stats.totalEnrollments}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Enrollments</p>
          </div>
          <div className="flex-1 py-4 text-center">
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {stats.approvedEnrollments}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved</p>
          </div>
          <div className="flex-1 py-4 text-center">
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              ₹{stats.totalEarnings}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Earned</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// KYC CARD
// =============================================================================

/**
 * KYC Card - PAN-only verification status
 * NOTE: Aadhaar removed - KYC is PAN-only now
 */
function KYCCard({ kycStatus, onStartKYC }: {
  kycStatus: { status?: string; panVerified?: boolean } | null;
  onStartKYC: () => void;
}) {
  const isVerified = kycStatus?.status === "verified" || kycStatus?.panVerified;

  if (isVerified) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
          <ShieldCheckIcon className={`size-4 ${duotoneColors.emerald.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900 dark:text-white">Identity Verified</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">PAN verified</p>
        </div>
        <CheckCircleIcon className="size-5 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
        <IdentificationIcon className={`size-4 ${duotoneColors.amber.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900 dark:text-white">Complete KYC</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Verify your PAN for withdrawals over ₹30,000
        </p>
      </div>
      <Button onClick={onStartKYC} color="dark/zinc" className="shrink-0">
        Verify
      </Button>
    </div>
  );
}

// =============================================================================
// BANK ACCOUNT ROW - iOS-style menu row for payout methods
// =============================================================================

function BankAccountRow({
  method,
  onVerify,
  onSetDefault,
  onDelete,
  isFirst,
  isLast,
}: {
  method: wallets.WithdrawalMethod;
  onVerify: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const isUPI = method.accountType === "upi";
  const last4 = method.accountNumber?.slice(-4);

  return (
    <div className={`bg-white px-4 py-3.5 dark:bg-zinc-900 ${isFirst ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`}>
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
          isUPI ? duotoneColors.emerald.bg : duotoneColors.sky.bg
        }`}>
          {isUPI ? (
            <UpiIcon className={`size-4 ${duotoneColors.emerald.icon}`} />
          ) : (
            <BuildingLibraryIcon className={`size-4 ${duotoneColors.sky.icon}`} />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-medium text-zinc-900 dark:text-white">
              {isUPI ? "UPI" : method.bankName || "Bank Account"}
            </p>
            {method.isDefault && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Primary
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
            {isUPI ? (
              method.upiId
            ) : (
              <>••••{last4} · {method.accountHolderName}</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-3">
          {!method.isDefault && method.isVerified && (
            <button
              type="button"
              onClick={onSetDefault}
              className="text-xs font-medium text-sky-600 dark:text-sky-400"
            >
              Set Primary
            </button>
          )}
          {!method.isVerified && (
            <button
              type="button"
              onClick={onVerify}
              className="text-xs font-medium text-amber-600 dark:text-amber-400"
            >
              Verify
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-medium text-red-500 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// THEME TOGGLE
// =============================================================================

type ThemeOption = "light" | "dark" | "system";

function useTheme() {
  const [theme, setThemeState] = useState<ThemeOption>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as ThemeOption) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (selectedTheme: ThemeOption) => {
      if (selectedTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", selectedTheme);
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Listen for system preference changes when in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return { theme, setTheme: setThemeState };
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options: { value: ThemeOption; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { value: "light", icon: SunIcon, label: "Light" },
    { value: "dark", icon: MoonIcon, label: "Dark" },
    { value: "system", icon: MonitorIcon, label: "System" },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
        {theme === "dark" ? (
          <MoonIcon className={`size-4 ${duotoneColors.amber.icon}`} />
        ) : (
          <SunIcon className={`size-4 ${duotoneColors.amber.icon}`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base text-zinc-900 dark:text-white">Appearance</p>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Choose your preferred theme</p>
      </div>
      <div className="flex shrink-0 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`flex size-8 items-center justify-center rounded-md transition-colors ${
                isActive
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title={option.label}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// NOTIFICATION TOGGLE
// =============================================================================

function NotificationToggle({
  icon: Icon,
  iconColor,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: DuotoneColor;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const colors = duotoneColors[iconColor];

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`size-4 ${colors.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base text-zinc-900 dark:text-white">{label}</p>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-xl transition-colors ${
          enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-xl bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}

// =============================================================================
// MAIN SETTINGS PAGE
// =============================================================================

export function Settings() {
  const navigate = useNavigate();
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useShopperProfile();
  const { data: identity } = useGetIdentity<AuthUser>();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useShopperStats();
  // KYC status is now in shopper profile (API v2.1) - extract from profile.shopper
  const kycStatus = profile?.shopper ? {
    status: profile.shopper.kycStatus,
    panVerified: profile.shopper.panVerified,
    bankVerified: profile.shopper.bankVerified,
    rejectionReason: profile.shopper.kycRejectionReason,
  } : null;
  const kycLoading = profileLoading;
  const kycError = profileError;
  const refetchKyc = refetchProfile;
  const { data: withdrawalMethodsData, loading: methodsLoading, refetch: refetchMethods } = useWithdrawalMethods();
  const { data: notificationPrefs, loading: notifLoading, refetch: refetchNotifPrefs } = useNotificationPreferences();
  const { mutate: logout } = useLogout();

  // View state - "main" or "editProfile"
  const [view, setView] = useState<"main" | "editProfile">("main");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isViewingSessions, setIsViewingSessions] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isVerifyingKYC, setIsVerifyingKYC] = useState(false);

  // Hooks for mutations
  const { uploadProfilePicture, isPending: avatarUploading } = useUploadProfilePicture();
  const { updatePreferences } = useUpdateNotificationPreferences();
  const { verifyMethod } = useVerifyWithdrawalMethod();
  const { setDefault } = useSetDefaultWithdrawalMethod();
  const { deleteMethod } = useDeleteWithdrawalMethod();

  // Notification preferences (optimistic updates)
  const [localNotifPrefs, setLocalNotifPrefs] = useState({ email: true, inApp: true });

  useEffect(() => {
    if (notificationPrefs?.global) {
      setLocalNotifPrefs({
        email: notificationPrefs.global.email ?? true,
        inApp: notificationPrefs.global.inApp ?? true,
      });
    }
  }, [notificationPrefs]);

  if (profileLoading || statsLoading || kycLoading) {
    return <LoadingState />;
  }

  // Error state
  const hasError = profileError || statsError || kycError;
  if (hasError) {
    const handleRetry = () => {
      refetchProfile();
      refetchStats();
      refetchKyc();
    };
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
          <ExclamationTriangleIcon className="size-8 text-red-400" />
        </div>
        <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Failed to load your settings. Please try again.
        </p>
        <Button className="mt-6" onClick={handleRetry} color="dark/zinc">
          <ArrowPathIcon className="size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const shopper = profile?.shopper;
  // Use shopper avatar if available, fallback to identity avatar (same pattern as app-layout)
  const avatarUrl = shopper?.avatarUrl || identity?.avatar;
  const userName = profile?.user?.name || `${shopper?.firstName || ""} ${shopper?.lastName || ""}`.trim() || "User";
  const userEmail = profile?.user?.email || "";
  const displayName = shopper?.displayName || userName;
  const phoneNumber = shopper?.phoneNumber || "";
  const memberSince = shopper?.createdAt
    ? new Date(shopper.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isVerified = kycStatus?.status === "verified";
  const withdrawalMethods = withdrawalMethodsData?.methods || [];

  // Address display
  const city = shopper?.city || "";
  const state = shopper?.state || "";
  const hasAddress = shopper?.address || city || state || shopper?.postalCode;
  const addressDisplay = hasAddress ? [city, state].filter(Boolean).join(", ") || "Address set" : "Not set";

  // Handlers
  const handleAvatarChange = async (file: File) => {
    const result = await uploadProfilePicture({ file });
    if (result.success) {
      showSuccess("Avatar updated");
    } else {
      showError("Upload failed", "Failed to upload avatar");
    }
  };

  const handleNotificationToggle = async (channel: "email" | "inApp", enabled: boolean) => {
    const previousPrefs = { ...localNotifPrefs };
    setLocalNotifPrefs((prev) => ({ ...prev, [channel]: enabled }));

    try {
      await updatePreferences({
        channels: { ...localNotifPrefs, [channel]: enabled },
      });
      refetchNotifPrefs();
    } catch {
      setLocalNotifPrefs(previousPrefs);
    }
  };

  const handleVerifyMethod = async (id: string) => {
    try {
      await verifyMethod(id);
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id);
    } catch {}
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;
    try {
      await deleteMethod(id);
    } catch {}
  };

  // Edit Profile View
  if (view === "editProfile") {
    return (
      <EditProfileView
        profile={{
          displayName: shopper?.displayName || "",
          phoneNumber: shopper?.phoneNumber || "",
          bio: shopper?.bio || "",
          address: shopper?.address || "",
          city: shopper?.city || "",
          state: shopper?.state || "",
          postalCode: shopper?.postalCode || "",
        }}
        onSave={() => {
          refetchProfile();
          setView("main");
        }}
        onBack={() => setView("main")}
      />
    );
  }

  // Main Settings View
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Settings</Heading>
        <Text className="mt-1 text-sm">Manage your profile and preferences</Text>
      </div>

      {/* Profile Card */}
      <ProfileCard
        profile={{ userName, userEmail, initials, avatarUrl, memberSince }}
        stats={stats ? {
          totalEnrollments: stats.totalEnrollments,
          approvedEnrollments: stats.approved,
          totalEarnings: stats.totalEarningsDecimal,
        } : undefined}
        isVerified={isVerified}
        isMediator={shopper?.isMediator}
        onEdit={() => setView("editProfile")}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
      />

      {/* KYC Status */}
      <KYCCard kycStatus={kycStatus} onStartKYC={() => setIsVerifyingKYC(true)} />

      {/* Two Column Layout */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Account Info */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-1">
            <UserIcon className="size-4 text-zinc-400" />
            <SectionTitle>Account Info</SectionTitle>
          </div>
          <MenuSection>
            <MenuRow
              icon={UserIcon}
              iconColor="sky"
              label="Display Name"
              value={displayName || "Not set"}
              onClick={() => setView("editProfile")}
              isFirst
            />
          <MenuSeparator />
          <MenuRow
            icon={AtSymbolIcon}
            iconColor="orange"
            label="Email"
            value={userEmail}
            onClick={() => setIsChangingEmail(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={DevicePhoneMobileIcon}
            iconColor="emerald"
            label="Phone"
            value={phoneNumber || "Not set"}
            onClick={() => setView("editProfile")}
          />
          <MenuSeparator />
          <MenuRow
            icon={MapPinIcon}
            iconColor="red"
            label="Address"
            value={addressDisplay}
            onClick={() => setView("editProfile")}
          />
          <MenuSeparator />
          <MenuRow
            icon={CalendarDaysIcon}
            iconColor="zinc"
            label="Member Since"
            value={memberSince}
          />
          <MenuSeparator />
          <MenuRow
            icon={LockClosedIcon}
            iconColor="amber"
            label="Change Password"
            value=""
            onClick={() => setIsChangingPassword(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={ComputerDesktopIcon}
            iconColor="sky"
            label="Active Sessions"
            value=""
            onClick={() => setIsViewingSessions(true)}
            isLast
          />
          </MenuSection>
        </div>

        {/* Payout Methods */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="size-4 text-zinc-400" />
              <SectionTitle>Payout Methods</SectionTitle>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingBank(true)}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400"
            >
              <PlusIcon className="size-3.5" />
              Add New
            </button>
          </div>
          {methodsLoading ? (
            <div className="flex justify-center rounded-xl bg-white py-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="size-5 animate-spin rounded-xl border-2 border-zinc-200 border-t-zinc-600" />
            </div>
          ) : withdrawalMethods.length > 0 ? (
            <MenuSection>
              {withdrawalMethods.map((method, index) => (
                <div key={method.id}>
                  <BankAccountRow
                    method={method}
                    onVerify={() => handleVerifyMethod(method.id)}
                    onSetDefault={() => handleSetDefault(method.id)}
                    onDelete={() => handleDeleteMethod(method.id)}
                    isFirst={index === 0}
                    isLast={index === withdrawalMethods.length - 1}
                  />
                  {index < withdrawalMethods.length - 1 && <MenuSeparator />}
                </div>
              ))}
            </MenuSection>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl bg-white py-10 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className={`flex size-9 items-center justify-center rounded-xl ${duotoneColors.zinc.bg}`}>
                <BuildingLibraryIcon className={`size-4 ${duotoneColors.zinc.icon}`} />
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">No payout methods</p>
              <p className="mt-1 text-xs text-zinc-500">Add a bank account or UPI to receive earnings</p>
              <Button onClick={() => setIsAddingBank(true)} color="dark/zinc" className="mt-4">
                Add Method
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <BellIcon className="size-4 text-zinc-400" />
          <SectionTitle>Notifications</SectionTitle>
        </div>
        <MenuSection>
          {notifLoading ? (
          <div className="flex justify-center py-8">
            <div className="size-5 animate-spin rounded-xl border-2 border-zinc-200 border-t-zinc-600" />
          </div>
        ) : (
          <>
            <NotificationToggle
              icon={EnvelopeIcon}
              iconColor="sky"
              label="Email notifications"
              description="Receive updates via email"
              enabled={localNotifPrefs.email}
              onToggle={(enabled) => handleNotificationToggle("email", enabled)}
            />
            <MenuSeparator />
            <NotificationToggle
              icon={DeviceTabletIcon}
              iconColor="emerald"
              label="In-app notifications"
              description="Show notifications in the app"
              enabled={localNotifPrefs.inApp}
              onToggle={(enabled) => handleNotificationToggle("inApp", enabled)}
            />
          </>
        )}
        </MenuSection>
      </div>

      {/* Appearance */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <SunIcon className="size-4 text-zinc-400" />
          <SectionTitle>Appearance</SectionTitle>
        </div>
        <MenuSection>
          <ThemeSelector />
        </MenuSection>
      </div>

      {/* Support */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <ChatBubbleLeftRightIcon className="size-4 text-zinc-400" />
          <SectionTitle>Support</SectionTitle>
        </div>
        <MenuSection>
          <MenuRow icon={ChatBubbleLeftRightIcon} iconColor="sky" label="Help & FAQ" onClick={() => navigate("/support")} isFirst />
        <MenuSeparator />
        <MenuRow icon={DocumentTextIcon} iconColor="zinc" label="Terms of Service" onClick={() => window.open("/terms", "_blank")} />
        <MenuSeparator />
        <MenuRow icon={ShieldCheckIconSolid} iconColor="emerald" label="Privacy Policy" onClick={() => window.open("/privacy", "_blank")} isLast />
        </MenuSection>
      </div>

      {/* Sign Out */}
      <MenuSection>
        <MenuDangerButton onClick={() => logout()}>
          <ArrowRightStartOnRectangleIcon className="size-4" />
          Sign Out
        </MenuDangerButton>
      </MenuSection>

      {/* Footer */}
      <p className="text-center text-[13px] text-zinc-400">Hypedrive Shopper v1.0.0</p>

      {/* Dialogs */}
      <ChangeEmailDialog
        open={isChangingEmail}
        currentEmail={userEmail}
        onSave={() => { refetchProfile(); setIsChangingEmail(false); }}
        onCancel={() => setIsChangingEmail(false)}
      />

      <AddBankAccountDialog
        open={isAddingBank}
        onSuccess={() => { refetchMethods(); setIsAddingBank(false); }}
        onCancel={() => setIsAddingBank(false)}
      />

      <KYCVerificationDialog
        open={isVerifyingKYC}
        kycStatus={kycStatus}
        onSuccess={() => { refetchProfile(); setIsVerifyingKYC(false); }}
        onCancel={() => setIsVerifyingKYC(false)}
      />

      <ChangePasswordDialog
        open={isChangingPassword}
        onSuccess={() => setIsChangingPassword(false)}
        onCancel={() => setIsChangingPassword(false)}
      />

      <SessionsDialog
        open={isViewingSessions}
        onClose={() => setIsViewingSessions(false)}
      />
    </div>
  );
}
