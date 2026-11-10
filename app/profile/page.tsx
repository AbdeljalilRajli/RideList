"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userData, isAdmin, loading, updateProfile, changePassword, logout } = useAuth();

  // Profile fields state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Initialize input once user is loaded
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      const initialName =
        userData?.displayName ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "";
      setFullName(initialName);

      const initialPhone =
        userData?.phoneNumber ||
        user.user_metadata?.phone_number ||
        user.user_metadata?.phone ||
        user.phone ||
        "";
      setPhoneNumber(initialPhone);
    }
  }, [user, userData, loading, router]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Save Name & Phone
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Full name cannot be empty.", "error");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      showToast("Profile details updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      showToast("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err: any) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6C757D] text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const avatarLetter = (fullName.trim().charAt(0) || user.email?.charAt(0) || "U").toUpperCase();

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-black pt-[140px] sm:pt-[160px] pb-24 px-4 sm:px-6 font-['Work_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-28 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all ${
            toast.type === "success"
              ? "bg-[#10B981] text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* For Admins: Back to Dashboard link at top */}
        {isAdmin && (
          <div className="mb-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] hover:text-[#4A2CC7] hover:underline transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-6 sm:p-10 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#5937E0] text-white text-2xl font-bold flex items-center justify-center shrink-0 shadow-md">
                {avatarLetter}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
                  {fullName || "User Profile"}
                </h1>
                <p className="text-xs sm:text-sm text-[#6C757D]">{user.email}</p>
              </div>
            </div>

            <div className="self-start sm:self-center">
              {isAdmin ? (
                <span className="px-3.5 py-1.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5937E0]"></span>
                  Administrator
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Customer Account
                </span>
              )}
            </div>
          </div>

          {/* Form: Full Name, Phone, Email */}
          <form onSubmit={handleSaveProfile} className="pt-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Full Name <span className="text-[#5937E0]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Youssef El Amrani"
                className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-medium focus:outline-none focus:border-[#5937E0] transition-colors"
              />
              <p className="text-[11px] text-[#6C757D] mt-1.5">
                Displayed in the account dropdown and automatically prefilled in rental bookings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +212 6 XX XX XX XX"
                className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-medium focus:outline-none focus:border-[#5937E0] transition-colors"
              />
              <p className="text-[11px] text-[#6C757D] mt-1.5">
                Used to contact you on WhatsApp regarding your reservations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user.email || ""}
                  className="w-full h-12 px-4 rounded-xl bg-[#F1F1F6] border border-[#E5E7EB] text-sm text-[#6C757D] font-medium cursor-not-allowed"
                />
                <span className="absolute right-4 top-3.5 text-xs text-[#9CA3AF] flex items-center gap-1 font-semibold">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5">
                Your email is linked to your Supabase login and cannot be altered here.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={savingProfile}
                className="h-11 px-8 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Sign Out of Account
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                Security & Password
              </h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Change your account password securely using Supabase Auth
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-xs font-bold text-[#5937E0] hover:underline cursor-pointer"
            >
              {showPasswordSection ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-[#E5E7EB] space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  New Password <span className="text-[#5937E0]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="•••••••••••• (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Confirm New Password <span className="text-[#5937E0]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="h-10 px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Navigation Card */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-4">
            Quick Navigation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="p-4 rounded-2xl bg-[#F8F8FB] hover:bg-[#EEEDF9] border border-[#E5E7EB] hover:border-[#5937E0]/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-black group-hover:text-[#5937E0] block">
                      Admin Portal
                    </span>
                    <span className="text-[11px] text-[#6C757D]">Overview & Fleet</span>
                  </div>
                  <span className="text-[#5937E0] font-bold text-sm">→</span>
                </Link>

                <Link
                  href="/admin/bookings"
                  className="p-4 rounded-2xl bg-[#F8F8FB] hover:bg-[#EEEDF9] border border-[#E5E7EB] hover:border-[#5937E0]/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-black group-hover:text-[#5937E0] block">
                      Manage Reservations
                    </span>
                    <span className="text-[11px] text-[#6C757D]">Active bookings & orders</span>
                  </div>
                  <span className="text-[#5937E0] font-bold text-sm">→</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="p-4 rounded-2xl bg-[#F8F8FB] hover:bg-[#EEEDF9] border border-[#E5E7EB] hover:border-[#5937E0]/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-black group-hover:text-[#5937E0] block">
                      My Reservations
                    </span>
                    <span className="text-[11px] text-[#6C757D]">View & manage bookings</span>
                  </div>
                  <span className="text-[#5937E0] font-bold text-sm">→</span>
                </Link>

                <Link
                  href="/fleet"
                  className="p-4 rounded-2xl bg-[#F8F8FB] hover:bg-[#EEEDF9] border border-[#E5E7EB] hover:border-[#5937E0]/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-black group-hover:text-[#5937E0] block">
                      Browse Fleet
                    </span>
                    <span className="text-[11px] text-[#6C757D]">Rent another vehicle</span>
                  </div>
                  <span className="text-[#5937E0] font-bold text-sm">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
