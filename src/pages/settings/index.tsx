import { Button } from "@/components/button";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/dialog";
import { Heading, Subheading, SectionTitle } from "@/components/heading";
import { UpiIcon } from "@/components/icons/upi-icon";
import { MenuSection, MenuRow, MenuSeparator, MenuDangerButton } from "@/components/menu-list";
import { Text } from "@/components/text";
import { useShopperProfile, useKYCStatus, useWithdrawalMethods, useNotificationPreferences } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import { SettingsSkeleton } from "@/lib/skeleton";
import type { wallets } from "@/lib/api-client";
import {
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
  TrashIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon as ShieldCheckIconSolid,
  MapPinIcon,
  CameraIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  BellIcon,
  EnvelopeIcon,
  DeviceTabletIcon,
  PencilIcon,
  BanknotesIcon,
} from "@heroicons/react/16/solid";
import { duotoneColors, type DuotoneColor } from "@/components/menu-list";
import { useLogout } from "@refinedev/core";
import { useState, useRef, useEffect } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      await client.shoppers.updateShopperProfile({
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
    } finally {
      setLoading(false);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNewEmail("");
      setError(null);
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      await client.auth.changeEmail({
        newEmail: newEmail.trim(),
        callbackURL: `${window.location.origin}/settings`,
      });
      setSuccess(true);
      setTimeout(() => onSave(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change email");
    } finally {
      setLoading(false);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [open]);

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

    setLoading(true);

    try {
      const client = getAuthenticatedClient();
      await client.wallets.addWithdrawalMethod({
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
    } finally {
      setLoading(false);
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

function KYCVerificationDialog({
  open,
  kycStatus,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  kycStatus: { status?: string; panVerified?: boolean; aadhaarVerified?: boolean } | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"pan" | "aadhaar" | "aadhaar_otp">(
    kycStatus?.panVerified ? "aadhaar" : "pan"
  );
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panVerifiedName, setPanVerifiedName] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(kycStatus?.panVerified ? "aadhaar" : "pan");
      setPanNumber("");
      setAadhaarNumber("");
      setOtp("");
      setClientId("");
      setError(null);
      setPanVerifiedName(null);
    }
  }, [open, kycStatus?.panVerified]);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleSubmitPAN = async () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      setError("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.submitPAN({ panNumber: panNumber.toUpperCase() });

      if (result.verified) {
        setPanVerifiedName(result.name || null);
        setTimeout(() => { setStep("aadhaar"); setError(null); }, 1500);
      } else {
        setError(result.error || "PAN verification failed. Please check the number.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify PAN");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateAadhaar = async () => {
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, "");
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.initiateAadhaarVerification({ aadhaarNumber: cleanAadhaar });
      setClientId(result.clientId);
      setStep("aadhaar_otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.completeAadhaarVerification({ clientId, otp });

      if (result.verified) {
        onSuccess();
      } else {
        setError(result.error || "OTP verification failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
          <IdentificationIcon className={`size-4 ${duotoneColors.amber.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-lg">
            {step === "pan" && "Verify PAN"}
            {step === "aadhaar" && "Verify Aadhaar"}
            {step === "aadhaar_otp" && "Enter OTP"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {step === "pan" && "Enter your PAN card number for identity verification."}
            {step === "aadhaar" && "Enter your Aadhaar number. An OTP will be sent to your linked mobile."}
            {step === "aadhaar_otp" && "Enter the 6-digit OTP sent to your Aadhaar-linked mobile number."}
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex size-7 items-center justify-center rounded-xl text-xs font-bold ${
              step === "pan" ? "bg-sky-500 text-white"
                : kycStatus?.panVerified || panVerifiedName ? "bg-emerald-500 text-white"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}>
              {kycStatus?.panVerified || panVerifiedName ? <CheckCircleIcon className="size-4" /> : "1"}
            </div>
            <div className={`h-0.5 flex-1 ${step !== "pan" ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            <div className={`flex size-7 items-center justify-center rounded-xl text-xs font-bold ${
              step === "aadhaar" || step === "aadhaar_otp" ? "bg-sky-500 text-white"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}>
              2
            </div>
          </div>

          {/* PAN Step */}
          {step === "pan" && (
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
                />
              </div>
            </div>
          )}

          {step === "pan" && panVerifiedName && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              PAN verified! Name: {panVerifiedName}
            </div>
          )}

          {/* Aadhaar Step */}
          {step === "aadhaar" && (
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
              <div className="px-4 py-3">
                <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Aadhaar Number</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                  placeholder="0000 0000 0000"
                  maxLength={14}
                  inputMode="numeric"
                  className="mt-1 w-full bg-transparent font-mono text-base tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                />
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "aadhaar_otp" && (
            <>
              <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                OTP sent to your Aadhaar-linked mobile number
              </div>
              <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
                <div className="px-4 py-3">
                  <label className="text-[13px] text-zinc-500 dark:text-zinc-400">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className="mt-1 w-full bg-transparent font-mono text-base tracking-[0.5em] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleInitiateAadhaar}
                disabled={loading}
                className="text-sm text-sky-600 hover:underline dark:text-sky-400"
              >
                Resend OTP
              </button>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <ExclamationCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={onCancel}>Cancel</Button>
        {step === "pan" && (
          <Button onClick={handleSubmitPAN} disabled={loading || panNumber.length !== 10} color="dark/zinc">
            {loading ? "Verifying..." : "Verify PAN"}
          </Button>
        )}
        {step === "aadhaar" && (
          <Button onClick={handleInitiateAadhaar} disabled={loading || aadhaarNumber.replace(/\s/g, "").length !== 12} color="dark/zinc">
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        )}
        {step === "aadhaar_otp" && (
          <Button onClick={handleVerifyAadhaarOTP} disabled={loading || otp.length !== 6} color="dark/zinc">
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// PROFILE CARD
// =============================================================================

function ProfileCard({
  profile,
  isVerified,
  onEdit,
  onAvatarChange,
  avatarUploading,
}: {
  profile: { userName: string; userEmail: string; initials: string; avatarUrl?: string; memberSince: string };
  isVerified: boolean;
  onEdit: () => void;
  onAvatarChange: (file: File) => void;
  avatarUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="group relative"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.userName} className="size-20 rounded-xl object-cover sm:size-16" />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-xl bg-zinc-200 text-2xl font-semibold text-zinc-600 sm:size-16 sm:text-xl dark:bg-zinc-700 dark:text-zinc-300">
                  {profile.initials}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100">
                {avatarUploading ? (
                  <div className="size-5 animate-spin rounded-xl border-2 border-white/30 border-t-white" />
                ) : (
                  <CameraIcon className="size-5 text-white" />
                )}
              </div>
            </button>
            {isVerified && !avatarUploading && (
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-xl bg-emerald-500 ring-2 ring-white dark:ring-zinc-900">
                <CheckCircleIcon className="size-3 text-white" />
              </div>
            )}
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

          {/* Info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="truncate text-lg font-semibold text-zinc-900 dark:text-white">{profile.userName}</p>
            <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">{profile.userEmail}</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Member since {profile.memberSince}</p>
          </div>

          {/* Edit button */}
          <Button onClick={onEdit} outline className="w-full sm:w-auto">
            <PencilIcon className="size-4" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// KYC CARD
// =============================================================================

function KYCCard({ kycStatus, onStartKYC }: {
  kycStatus: { status?: string; panVerified?: boolean; aadhaarVerified?: boolean } | null;
  onStartKYC: () => void;
}) {
  const isFullyVerified = kycStatus?.status === "verified";
  const isPanVerified = kycStatus?.panVerified || false;
  const isAadhaarVerified = kycStatus?.aadhaarVerified || false;
  const isPartiallyVerified = isPanVerified || isAadhaarVerified;

  if (isFullyVerified) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
          <ShieldCheckIcon className={`size-4 ${duotoneColors.emerald.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900 dark:text-white">Identity Verified</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">PAN & Aadhaar verified</p>
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
          {isPartiallyVerified ? (
            <span className="flex items-center gap-2">
              <span className={isPanVerified ? "text-emerald-600 dark:text-emerald-400" : ""}>
                {isPanVerified ? "PAN ✓" : "PAN pending"}
              </span>
              <span>·</span>
              <span className={isAadhaarVerified ? "text-emerald-600 dark:text-emerald-400" : ""}>
                {isAadhaarVerified ? "Aadhaar ✓" : "Aadhaar pending"}
              </span>
            </span>
          ) : (
            "Required for withdrawals over ₹30,000"
          )}
        </p>
      </div>
      <Button onClick={onStartKYC} color="dark/zinc" className="shrink-0">
        {isPartiallyVerified ? "Continue" : "Verify"}
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
  const { data: profile, loading: profileLoading, refetch: refetchProfile } = useShopperProfile();
  const { data: kycStatus, loading: kycLoading } = useKYCStatus();
  const { data: withdrawalMethodsData, loading: methodsLoading, refetch: refetchMethods } = useWithdrawalMethods();
  const { data: notificationPrefs, loading: notifLoading, refetch: refetchNotifPrefs } = useNotificationPreferences();
  const { mutate: logout } = useLogout();

  // View state - "main" or "editProfile"
  const [view, setView] = useState<"main" | "editProfile">("main");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isVerifyingKYC, setIsVerifyingKYC] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

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

  if (profileLoading || kycLoading) {
    return <LoadingState />;
  }

  const shopper = profile?.shopper;
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
    setAvatarUploading(true);
    try {
      const client = getAuthenticatedClient();
      const { uploadUrl, fileUrl } = await client.storage.requestProfilePictureUploadUrl({ filename: file.name });
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await client.shoppers.updateShopperProfile({ avatarUrl: fileUrl });
      refetchProfile();
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleNotificationToggle = async (channel: "email" | "inApp", enabled: boolean) => {
    const previousPrefs = { ...localNotifPrefs };
    setLocalNotifPrefs((prev) => ({ ...prev, [channel]: enabled }));

    try {
      const client = getAuthenticatedClient();
      await client.notifications.updateNotificationPreferences({
        channels: { ...localNotifPrefs, [channel]: enabled },
      });
      refetchNotifPrefs();
    } catch {
      setLocalNotifPrefs(previousPrefs);
    }
  };

  const handleVerifyMethod = async (id: string) => {
    try {
      const client = getAuthenticatedClient();
      await client.wallets.verifyWithdrawalMethod(id);
      refetchMethods();
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      const client = getAuthenticatedClient();
      await client.wallets.setDefaultWithdrawalMethod(id);
      refetchMethods();
    } catch {}
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;
    try {
      const client = getAuthenticatedClient();
      await client.wallets.deleteWithdrawalMethod(id);
      refetchMethods();
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
        profile={{ userName, userEmail, initials, avatarUrl: shopper?.avatarUrl, memberSince }}
        isVerified={isVerified}
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

      {/* Support */}
      <div>
        <div className="mb-2 flex items-center gap-2 px-1">
          <ChatBubbleLeftRightIcon className="size-4 text-zinc-400" />
          <SectionTitle>Support</SectionTitle>
        </div>
        <MenuSection>
          <MenuRow icon={ChatBubbleLeftRightIcon} iconColor="sky" label="Help & FAQ" onClick={() => {}} isFirst />
        <MenuSeparator />
        <MenuRow icon={DocumentTextIcon} iconColor="zinc" label="Terms of Service" onClick={() => {}} />
        <MenuSeparator />
        <MenuRow icon={ShieldCheckIconSolid} iconColor="emerald" label="Privacy Policy" onClick={() => {}} isLast />
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
    </div>
  );
}
