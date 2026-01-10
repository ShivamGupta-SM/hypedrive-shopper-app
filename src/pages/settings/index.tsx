import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/dialog";
import { Heading, Subheading } from "@/components/heading";
import { MenuSection, MenuRow, MenuSeparator, MenuDangerButton } from "@/components/menu-list";
import { Text } from "@/components/text";
import { useShopperProfile, useKYCStatus, useWithdrawalMethods } from "@/hooks/use-api";
import { getAuthenticatedClient } from "@/lib/client";
import type { wallets } from "@/lib/api-client";
import {
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MapPinIcon,
  CameraIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";
import { useLogout } from "@refinedev/core";
import { useState, useId, useRef } from "react";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800 dark:border-zinc-700 dark:border-t-zinc-200" />
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Loading profile...
      </p>
    </div>
  );
}

function EditProfileSheet({
  open,
  profile,
  onSave,
  onCancel,
}: {
  open: boolean;
  profile: {
    displayName?: string;
    bio?: string;
    phoneNumber?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    phoneNumber: profile.phoneNumber || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const displayNameId = useId();
  const bioId = useId();
  const phoneNumberId = useId();

  // Reset form when dialog opens with new profile data
  const resetForm = () => {
    setFormData({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      phoneNumber: profile.phoneNumber || "",
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (formData.phoneNumber && !/^[+]?[\d\s-]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const client = getAuthenticatedClient();
      await client.shoppers.updateShopperProfile({
        displayName: formData.displayName.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onCancel(); }} size="md">
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Update your profile information.</DialogDescription>

      <DialogBody>
        <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
            <div className="px-4 py-3">
              <label htmlFor={displayNameId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Display Name</label>
              <input
                id={displayNameId}
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your display name"
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={phoneNumberId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Phone Number</label>
              <input
                id={phoneNumberId}
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={bioId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Bio <span className="text-zinc-400">(Optional)</span></label>
              <textarea
                id={bioId}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                maxLength={200}
                className="mt-1 w-full resize-none bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
              <p className="mt-1 text-right text-[11px] text-zinc-400">{formData.bio.length}/200</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              Profile updated successfully!
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={() => { resetForm(); onCancel(); }}>
          Cancel
        </Button>
        <Button type="submit" form="edit-profile-form" disabled={loading || success} color="dark/zinc">
          {loading ? "Saving..." : success ? "Saved!" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Add Bank Account Dialog
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
  const holderNameId = useId();
  const accountNumberId = useId();
  const confirmAccountId = useId();
  const bankNameId = useId();
  const ifscCodeId = useId();
  const upiIdFieldId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (accountType === "bank_account") {
      if (!formData.accountHolderName.trim()) {
        setError("Account holder name is required");
        setLoading(false);
        return;
      }
      if (!formData.accountNumber.trim()) {
        setError("Account number is required");
        setLoading(false);
        return;
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        setError("Account numbers do not match");
        setLoading(false);
        return;
      }
      if (!formData.ifscCode.trim()) {
        setError("IFSC code is required");
        setLoading(false);
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
        setError("Invalid IFSC code format");
        setLoading(false);
        return;
      }
    } else {
      if (!formData.upiId.trim()) {
        setError("UPI ID is required");
        setLoading(false);
        return;
      }
      const upiRegex = /^[\w.-]+@[\w]+$/;
      if (!upiRegex.test(formData.upiId)) {
        setError("Invalid UPI ID format (e.g., user@upi)");
        setLoading(false);
        return;
      }
    }

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
      <DialogTitle>Add Payout Method</DialogTitle>
      <DialogDescription>Add a bank account or UPI for withdrawals.</DialogDescription>

      <DialogBody>
        <form id="add-bank-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Account Type Selection */}
          <div>
            <p className="mb-2 text-[13px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Payment Type</p>
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <button
                type="button"
                onClick={() => setAccountType("bank_account")}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  accountType === "bank_account" ? "bg-white dark:bg-zinc-800" : ""
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500">
                  <BuildingLibraryIcon className="size-4 text-white" />
                </div>
                <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">Bank Account</span>
                {accountType === "bank_account" && (
                  <CheckCircleIcon className="size-5 text-emerald-500" />
                )}
              </button>
              <div className="ml-14 h-px bg-zinc-200 dark:bg-zinc-700" />
              <button
                type="button"
                onClick={() => setAccountType("upi")}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  accountType === "upi" ? "bg-white dark:bg-zinc-800" : ""
                }`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                  <span className="text-[11px] font-bold text-white">UPI</span>
                </div>
                <span className="flex-1 text-[15px] text-zinc-900 dark:text-white">UPI</span>
                {accountType === "upi" && (
                  <CheckCircleIcon className="size-5 text-emerald-500" />
                )}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <p className="mb-2 text-[13px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {accountType === "bank_account" ? "Bank Details" : "UPI Details"}
            </p>
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              {accountType === "bank_account" ? (
                <>
                  <div className="px-4 py-3">
                    <label htmlFor={holderNameId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Account Holder Name</label>
                    <input
                      id={holderNameId}
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="Name as per bank records"
                      className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="px-4 py-3">
                    <label htmlFor={accountNumberId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Account Number</label>
                    <input
                      id={accountNumberId}
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Enter account number"
                      className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="px-4 py-3">
                    <label htmlFor={confirmAccountId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Confirm Account Number</label>
                    <input
                      id={confirmAccountId}
                      type="text"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                      placeholder="Re-enter account number"
                      className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="px-4 py-3">
                    <label htmlFor={bankNameId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Bank Name <span className="text-zinc-400">(Optional)</span></label>
                    <input
                      id={bankNameId}
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., State Bank of India"
                      className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="px-4 py-3">
                    <label htmlFor={ifscCodeId} className="text-[13px] text-zinc-500 dark:text-zinc-400">IFSC Code</label>
                    <input
                      id={ifscCodeId}
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g., SBIN0001234"
                      maxLength={11}
                      className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                    />
                  </div>
                </>
              ) : (
                <div className="px-4 py-3">
                  <label htmlFor={upiIdFieldId} className="text-[13px] text-zinc-500 dark:text-zinc-400">UPI ID</label>
                  <input
                    id={upiIdFieldId}
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g., yourname@upi"
                    className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                  />
                </div>
              )}
            </div>
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
        <Button type="button" outline onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="add-bank-form" disabled={loading} color="dark/zinc">
          {loading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Edit Address Dialog
function EditAddressDialog({
  open,
  address,
  onSave,
  onCancel,
}: {
  open: boolean;
  address: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    address: address.address || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const addressId = useId();
  const cityId = useId();
  const stateId = useId();
  const postalCodeId = useId();

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  ];

  const resetForm = () => {
    setFormData({
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      setError("Please enter a valid 6-digit PIN code");
      setLoading(false);
      return;
    }

    try {
      const client = getAuthenticatedClient();
      await client.shoppers.updateShopperProfile({
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSave();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onCancel(); }} size="md">
      <DialogTitle>Edit Address</DialogTitle>
      <DialogDescription>Update your address for deliveries and verification.</DialogDescription>

      <DialogBody>
        <form id="edit-address-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
            <div className="px-4 py-3">
              <label htmlFor={addressId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Street Address</label>
              <textarea
                id={addressId}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House no., Building, Street, Area"
                rows={2}
                className="mt-1 w-full resize-none bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={cityId} className="text-[13px] text-zinc-500 dark:text-zinc-400">City</label>
              <input
                id={cityId}
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={stateId} className="text-[13px] text-zinc-500 dark:text-zinc-400">State</label>
              <select
                id={stateId}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 focus:outline-none dark:text-white [&>option]:bg-white [&>option]:text-zinc-900 dark:[&>option]:bg-zinc-800 dark:[&>option]:text-white"
              >
                <option value="">Select state</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={postalCodeId} className="text-[13px] text-zinc-500 dark:text-zinc-400">PIN Code</label>
              <input
                id={postalCodeId}
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="6-digit PIN code"
                maxLength={6}
                inputMode="numeric"
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              Address updated successfully!
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={() => { resetForm(); onCancel(); }}>
          Cancel
        </Button>
        <Button type="submit" form="edit-address-form" disabled={loading || success} color="dark/zinc">
          {loading ? "Saving..." : success ? "Saved!" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Change Email Dialog
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
  const newEmailId = useId();

  const resetForm = () => {
    setNewEmail("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!newEmail.trim()) {
      setError("Please enter a new email address");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("New email must be different from current email");
      setLoading(false);
      return;
    }

    try {
      const client = getAuthenticatedClient();
      await client.auth.changeEmail({
        newEmail: newEmail.trim(),
        callbackURL: `${window.location.origin}/settings`,
      });
      setSuccess(true);
      setTimeout(() => {
        onSave();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onCancel(); }} size="md">
      <DialogTitle>Change Email</DialogTitle>
      <DialogDescription>A verification link will be sent to your new email address.</DialogDescription>

      <DialogBody>
        <form id="change-email-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
            <div className="px-4 py-3">
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Current Email</p>
              <p className="mt-1 text-[15px] text-zinc-600 dark:text-zinc-300">{currentEmail}</p>
            </div>
            <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-4 py-3">
              <label htmlFor={newEmailId} className="text-[13px] text-zinc-500 dark:text-zinc-400">New Email</label>
              <input
                id={newEmailId}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="mt-1 w-full bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <XCircleIcon className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              Verification email sent! Check your inbox.
            </div>
          )}
        </form>
      </DialogBody>

      <DialogActions>
        <Button type="button" outline onClick={() => { resetForm(); onCancel(); }}>
          Cancel
        </Button>
        <Button type="submit" form="change-email-form" disabled={loading || success} color="dark/zinc">
          {loading ? "Sending..." : success ? "Sent!" : "Send Verification"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// KYC Verification Dialog - PAN + Aadhaar flow
function KYCVerificationDialog({
  open,
  kycStatus,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  kycStatus: {
    status?: string;
    panVerified?: boolean;
    aadhaarVerified?: boolean;
  } | null;
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
  const panId = useId();
  const aadhaarId = useId();
  const otpId = useId();

  const resetForm = () => {
    setStep(kycStatus?.panVerified ? "aadhaar" : "pan");
    setPanNumber("");
    setAadhaarNumber("");
    setOtp("");
    setClientId("");
    setError(null);
    setPanVerifiedName(null);
  };

  // PAN Validation - format: XXXXX0000X
  const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());

  // Aadhaar Validation - 12 digits
  const isValidAadhaar = (aadhaar: string) => /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));

  const handleSubmitPAN = async () => {
    if (!isValidPan(panNumber)) {
      setError("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.submitPAN({
        panNumber: panNumber.toUpperCase(),
      });

      if (result.verified) {
        setPanVerifiedName(result.name || null);
        // Move to Aadhaar step after short delay
        setTimeout(() => {
          setStep("aadhaar");
          setError(null);
        }, 1500);
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
    if (!isValidAadhaar(cleanAadhaar)) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getAuthenticatedClient();
      const result = await client.shoppers.initiateAadhaarVerification({
        aadhaarNumber: cleanAadhaar,
      });

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
      const result = await client.shoppers.completeAadhaarVerification({
        clientId,
        otp,
      });

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

  // Format Aadhaar as user types: XXXX XXXX XXXX
  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  return (
    <Dialog open={open} onClose={() => { resetForm(); onCancel(); }} size="md">
      <DialogTitle>
        {step === "pan" && "Verify PAN"}
        {step === "aadhaar" && "Verify Aadhaar"}
        {step === "aadhaar_otp" && "Enter OTP"}
      </DialogTitle>
      <DialogDescription>
        {step === "pan" && "Enter your PAN card number for identity verification."}
        {step === "aadhaar" && "Enter your Aadhaar number. An OTP will be sent to your linked mobile."}
        {step === "aadhaar_otp" && "Enter the 6-digit OTP sent to your Aadhaar-linked mobile number."}
      </DialogDescription>

      <DialogBody>
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
              step === "pan"
                ? "bg-sky-500 text-white"
                : kycStatus?.panVerified || panVerifiedName
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}>
              {kycStatus?.panVerified || panVerifiedName ? <CheckCircleIcon className="size-4" /> : "1"}
            </div>
            <div className={`h-0.5 flex-1 ${
              step !== "pan" ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
            }`} />
            <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
              step === "aadhaar" || step === "aadhaar_otp"
                ? "bg-sky-500 text-white"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}>
              2
            </div>
          </div>

          {/* PAN Step */}
          {step === "pan" && (
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <div className="px-4 py-3">
                <label htmlFor={panId} className="text-[13px] text-zinc-500 dark:text-zinc-400">PAN Number</label>
                <input
                  id={panId}
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="mt-1 w-full bg-transparent font-mono text-[15px] uppercase tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          {/* PAN Success Message */}
          {step === "pan" && panVerifiedName && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircleIcon className="size-4 shrink-0" />
              PAN verified! Name: {panVerifiedName}
            </div>
          )}

          {/* Aadhaar Step */}
          {step === "aadhaar" && (
            <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <div className="px-4 py-3">
                <label htmlFor={aadhaarId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Aadhaar Number</label>
                <input
                  id={aadhaarId}
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                  placeholder="0000 0000 0000"
                  maxLength={14}
                  inputMode="numeric"
                  className="mt-1 w-full bg-transparent font-mono text-[15px] tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === "aadhaar_otp" && (
            <>
              <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
                OTP sent to your Aadhaar-linked mobile number ending in ****
              </div>
              <div className="overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
                <div className="px-4 py-3">
                  <label htmlFor={otpId} className="text-[13px] text-zinc-500 dark:text-zinc-400">Enter OTP</label>
                  <input
                    id={otpId}
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className="mt-1 w-full bg-transparent font-mono text-[15px] tracking-[0.5em] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
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
        <Button type="button" outline onClick={() => { resetForm(); onCancel(); }}>
          Cancel
        </Button>
        {step === "pan" && (
          <Button
            type="button"
            onClick={handleSubmitPAN}
            disabled={loading || panNumber.length !== 10}
            color="dark/zinc"
          >
            {loading ? "Verifying..." : "Verify PAN"}
          </Button>
        )}
        {step === "aadhaar" && (
          <Button
            type="button"
            onClick={handleInitiateAadhaar}
            disabled={loading || aadhaarNumber.replace(/\s/g, "").length !== 12}
            color="dark/zinc"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        )}
        {step === "aadhaar_otp" && (
          <Button
            type="button"
            onClick={handleVerifyAadhaarOTP}
            disabled={loading || otp.length !== 6}
            color="dark/zinc"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Profile Card - Hero section at top
function ProfileCard({
  profile,
  isVerified,
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
  isVerified: boolean;
  onEdit: () => void;
  onAvatarChange: (file: File) => void;
  avatarUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
    e.target.value = "";
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar with camera overlay */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              className="group relative"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.userName}
                  className="size-20 rounded-full object-cover sm:size-16"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-600 sm:size-16 sm:text-xl dark:bg-zinc-700 dark:text-zinc-300">
                  {profile.initials}
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 group-active:opacity-100">
                {avatarUploading ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <CameraIcon className="size-5 text-white" />
                )}
              </div>
            </button>
            {isVerified && !avatarUploading && (
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900">
                <CheckCircleIcon className="size-3 text-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
              {profile.userName}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {profile.userEmail}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Member since {profile.memberSince}
            </p>
          </div>

          {/* Edit button */}
          <Button onClick={onEdit} outline className="w-full sm:w-auto">
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

// KYC Card
function KYCCard({
  kycStatus,
  onStartKYC,
}: {
  kycStatus: {
    status?: string;
    panVerified?: boolean;
    aadhaarVerified?: boolean;
  } | null;
  onStartKYC: () => void;
}) {
  const isFullyVerified = kycStatus?.status === "verified";
  const isPanVerified = kycStatus?.panVerified || false;
  const isAadhaarVerified = kycStatus?.aadhaarVerified || false;
  const isPartiallyVerified = isPanVerified || isAadhaarVerified;

  if (isFullyVerified) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
          <ShieldCheckIcon className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">Identity Verified</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">PAN & Aadhaar verified</p>
        </div>
        <Badge color="emerald">Verified</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-amber-50 p-4 sm:flex-row sm:items-center dark:bg-amber-950/30">
      <div className="flex items-center gap-3 sm:flex-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500">
          <IdentificationIcon className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-amber-900 dark:text-amber-100">Complete KYC</p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {isPartiallyVerified ? (
              <span className="flex items-center gap-2">
                <span className={isPanVerified ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  {isPanVerified ? "PAN verified" : "PAN pending"}
                </span>
                <span>·</span>
                <span className={isAadhaarVerified ? "text-emerald-600 dark:text-emerald-400" : ""}>
                  {isAadhaarVerified ? "Aadhaar verified" : "Aadhaar pending"}
                </span>
              </span>
            ) : (
              "Required for withdrawals over ₹30,000"
            )}
          </p>
        </div>
      </div>
      <Button onClick={onStartKYC} color="amber" className="w-full shrink-0 sm:w-auto">
        {isPartiallyVerified ? "Continue" : "Verify Now"}
      </Button>
    </div>
  );
}

// Bank Account Row
function BankAccountRow({
  method,
  onVerify,
  onSetDefault,
  onDelete,
}: {
  method: wallets.WithdrawalMethod;
  onVerify: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500">
        {method.accountType === "upi" ? (
          <span className="text-[10px] font-bold text-white">UPI</span>
        ) : (
          <CreditCardIcon className="size-4 text-white" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-zinc-900 dark:text-white">
            {method.accountType === "upi"
              ? method.upiId
              : method.bankName || "Bank Account"}
          </span>
          {method.isDefault && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Default
            </span>
          )}
        </div>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          {method.accountType === "upi"
            ? "UPI"
            : `•••• ${method.accountNumber?.slice(-4) || "****"}`}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {method.isVerified ? (
          <CheckCircleIcon className="size-5 text-emerald-500" />
        ) : (
          <button
            type="button"
            onClick={onVerify}
            className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
          >
            Verify
          </button>
        )}
        {!method.isDefault && method.isVerified && (
          <button
            type="button"
            onClick={onSetDefault}
            className="rounded p-1 text-zinc-400 active:text-amber-500"
          >
            <StarIcon className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-zinc-400 active:text-red-500"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const {
    data: profile,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useShopperProfile();
  const {
    data: kycStatus,
    loading: kycLoading,
  } = useKYCStatus();
  const {
    data: withdrawalMethodsData,
    loading: methodsLoading,
    refetch: refetchMethods,
  } = useWithdrawalMethods();
  const { mutate: logout } = useLogout();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isVerifyingKYC, setIsVerifyingKYC] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  if (profileLoading || kycLoading) {
    return <LoadingSpinner />;
  }

  const withdrawalMethods = withdrawalMethodsData?.methods || [];

  const handleAvatarChange = async (file: File) => {
    setAvatarUploading(true);
    try {
      const client = getAuthenticatedClient();

      // 1. Get a signed upload URL from storage API
      const { uploadUrl, fileUrl } = await client.storage.requestProfilePictureUploadUrl({
        filename: file.name,
      });

      // 2. Upload the file to the signed URL
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // 3. Update profile with the new avatar URL
      await client.shoppers.updateShopperProfile({
        avatarUrl: fileUrl,
      });

      refetchProfile();
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleStartKYC = () => {
    setIsVerifyingKYC(true);
  };

  const handleKYCSuccess = () => {
    setIsVerifyingKYC(false);
    refetchProfile();
  };

  const handleAddBankSuccess = () => {
    refetchMethods();
    setIsAddingBank(false);
  };

  const handleProfileSave = () => {
    refetchProfile();
    setIsEditing(false);
  };

  const handleAddressSave = () => {
    refetchProfile();
    setIsEditingAddress(false);
  };

  const handleEmailSave = () => {
    refetchProfile();
    setIsChangingEmail(false);
  };

  const handleVerifyMethod = async (id: string) => {
    try {
      const client = getAuthenticatedClient();
      await client.wallets.verifyWithdrawalMethod(id);
      refetchMethods();
    } catch (err) {
      console.error("Failed to verify:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const client = getAuthenticatedClient();
      await client.wallets.setDefaultWithdrawalMethod(id);
      refetchMethods();
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;
    try {
      const client = getAuthenticatedClient();
      await client.wallets.deleteWithdrawalMethod(id);
      refetchMethods();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const shopper = profile?.shopper;

  const userName =
    profile?.user?.name ||
    `${shopper?.firstName || ""} ${shopper?.lastName || ""}`.trim() ||
    "User";
  const userEmail = profile?.user?.email || "";
  const displayName = shopper?.displayName || userName;
  const phoneNumber = shopper?.phoneNumber || "Not set";
  const memberSince = shopper?.createdAt
    ? new Date(shopper.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isVerified = kycStatus?.status === "verified";

  // Address fields
  const address = shopper?.address || "";
  const city = shopper?.city || "";
  const state = shopper?.state || "";
  const postalCode = shopper?.postalCode || "";
  const hasAddress = address || city || state || postalCode;
  const addressDisplay = hasAddress
    ? [city, state].filter(Boolean).join(", ") || "Address set"
    : "Not set";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Settings</Heading>
        <Text className="mt-1 text-sm">Manage your profile and preferences</Text>
      </div>

      {/* Profile Card - Hero */}
      <ProfileCard
        profile={{ userName, userEmail, initials, avatarUrl: shopper?.avatarUrl, memberSince }}
        isVerified={isVerified}
        onEdit={() => setIsEditing(true)}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
      />

      {/* KYC Status */}
      <KYCCard kycStatus={kycStatus} onStartKYC={handleStartKYC} />

      {/* Two Column Layout for Desktop */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Account & Contact Info */}
        <MenuSection>
          <MenuRow
            icon={UserCircleIcon}
            iconColor="sky"
            label="Display Name"
            value={displayName}
            onClick={() => setIsEditing(true)}
            isFirst
          />
          <MenuSeparator />
          <MenuRow
            icon={EnvelopeIcon}
            iconColor="orange"
            label="Email"
            value={userEmail}
            onClick={() => setIsChangingEmail(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={PhoneIcon}
            iconColor="emerald"
            label="Phone"
            value={phoneNumber}
            onClick={() => setIsEditing(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={MapPinIcon}
            iconColor="red"
            label="Address"
            value={addressDisplay}
            onClick={() => setIsEditingAddress(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={CalendarIcon}
            iconColor="amber"
            label="Member Since"
            value={memberSince}
            isLast
          />
        </MenuSection>

        {/* Payout Methods */}
        <MenuSection>
          <div className="flex items-center justify-between border-b border-zinc-950/5 px-4 py-3 dark:border-white/5">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="size-4 text-zinc-400" />
              <Subheading className="text-sm">Payout Methods</Subheading>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingBank(true)}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400"
            >
              <PlusIcon className="size-3.5" />
              Add
            </button>
          </div>
          {methodsLoading ? (
            <div className="flex justify-center py-8">
              <div className="size-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
            </div>
          ) : withdrawalMethods.length > 0 ? (
            withdrawalMethods.map((method: wallets.WithdrawalMethod, index: number) => (
              <div key={method.id}>
                {index > 0 && <MenuSeparator />}
                <BankAccountRow
                  method={method}
                  onVerify={() => handleVerifyMethod(method.id)}
                  onSetDefault={() => handleSetDefault(method.id)}
                  onDelete={() => handleDeleteMethod(method.id)}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <BuildingLibraryIcon className="size-6 text-zinc-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
                No payout methods
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Add a bank account or UPI to receive earnings
              </p>
              <Button onClick={() => setIsAddingBank(true)} className="mt-4">
                <PlusIcon className="size-4" />
                Add Method
              </Button>
            </div>
          )}
        </MenuSection>
      </div>

      {/* Support Section */}
      <MenuSection>
        <MenuRow
          icon={QuestionMarkCircleIcon}
          iconColor="zinc"
          label="Help & FAQ"
          onClick={() => {}}
          isFirst
        />
        <MenuSeparator />
        <MenuRow
          icon={DocumentTextIcon}
          iconColor="zinc"
          label="Terms of Service"
          onClick={() => {}}
        />
        <MenuSeparator />
        <MenuRow
          icon={LockClosedIcon}
          iconColor="zinc"
          label="Privacy Policy"
          onClick={() => {}}
          isLast
        />
      </MenuSection>

      {/* Sign Out */}
      <MenuSection>
        <MenuDangerButton onClick={() => logout()}>
          <ArrowRightStartOnRectangleIcon className="size-4" />
          Sign Out
        </MenuDangerButton>
      </MenuSection>

      {/* Footer */}
      <p className="text-center text-[13px] text-zinc-400">
        Hypedrive Shopper v1.0.0
      </p>

      {/* Edit Profile Sheet */}
      <EditProfileSheet
        open={isEditing}
        profile={{
          displayName: shopper?.displayName,
          bio: shopper?.bio,
          phoneNumber: shopper?.phoneNumber,
        }}
        onSave={handleProfileSave}
        onCancel={() => setIsEditing(false)}
      />

      {/* Edit Address Dialog */}
      <EditAddressDialog
        open={isEditingAddress}
        address={{
          address: shopper?.address,
          city: shopper?.city,
          state: shopper?.state,
          postalCode: shopper?.postalCode,
        }}
        onSave={handleAddressSave}
        onCancel={() => setIsEditingAddress(false)}
      />

      {/* Change Email Dialog */}
      <ChangeEmailDialog
        open={isChangingEmail}
        currentEmail={userEmail}
        onSave={handleEmailSave}
        onCancel={() => setIsChangingEmail(false)}
      />

      {/* Add Payout Method Dialog */}
      <AddBankAccountDialog
        open={isAddingBank}
        onSuccess={handleAddBankSuccess}
        onCancel={() => setIsAddingBank(false)}
      />
    </div>
  );
}
