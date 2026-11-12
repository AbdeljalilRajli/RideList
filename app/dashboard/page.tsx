"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAgencyWhatsAppNumber } from "@/constants/booking";
import { useCustomerBookings } from "@/hooks/useCustomerBookings";
import DataFreshnessBadge from "@/components/common/DataFreshnessBadge";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, userData, isAdmin, loading: authLoading } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected"
  >("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Unified Customer Bookings Hook with Supabase Realtime & optimistic cancellation
  const {
    bookings,
    loading: loadingBookings,
    isRefreshing,
    lastUpdated,
    cancellingId,
    stats,
    refresh,
    cancelBooking,
  } = useCustomerBookings(user);

  // Customer cancel pending booking with optimistic rollback
  const handleCancelBooking = async (
    bookingId: string,
    referenceCode: string
  ) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking request ${referenceCode}?`
    );
    if (!confirmCancel) return;

    try {
      await cancelBooking(bookingId);
      showToast(`Reservation ${referenceCode} has been cancelled.`);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      showToast(err.message || "Failed to cancel reservation.");
    }
  };

  // In-memory instant filtering
  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const agencyPhone = getAgencyWhatsAppNumber();

  // 1. While auth context is checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6C757D] text-sm font-medium">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // 2. Definitely logged out: return null while redirect completes (NEVER render dashboard UI/skeleton)
  if (!user) {
    return null;
  }

  const tabs = [
    { key: "all", label: `All (${stats.total})` },
    { key: "pending", label: `Pending (${stats.pending})` },
    { key: "confirmed", label: `Confirmed (${stats.confirmed})` },
    { key: "completed", label: `Completed (${stats.completed})` },
    { key: "cancelled", label: `Cancelled (${stats.cancelled})` },
    { key: "rejected", label: `Rejected (${stats.rejected})` },
  ] as const;

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-black pt-[130px] sm:pt-[150px] pb-24 px-4 sm:px-6 lg:px-8 font-['Work_Sans',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#5937E0] text-white text-xs font-bold shadow-xl animate-fadeIn">
          {toastMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Customer Header Banner */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#5937E0] uppercase tracking-wider block mb-1">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Welcome, {userData?.displayName || user?.email?.split("@")[0]}
            </h1>
            <p className="text-xs text-[#6C757D] mt-1">
              {user?.email} • {stats.total}{" "}
              {stats.total === 1 ? "reservation" : "reservations"} total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-full bg-[#EEEDF9] text-[#5937E0] hover:bg-[#5937E0] hover:text-white text-xs font-bold transition-all shadow-xs"
              >
                Go to Admin Portal →
              </Link>
            )}

            <Link
              href="/profile"
              className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#EEEDF9] text-black hover:text-[#5937E0] text-xs font-bold transition-all shadow-2xs"
            >
              Edit Profile
            </Link>

            <Link
              href="/fleet"
              className="px-4 py-2 rounded-full bg-[#EEEDF9] text-[#5937E0] hover:bg-[#5937E0] hover:text-white text-xs font-bold transition-all shadow-xs"
            >
              Browse Fleet →
            </Link>

            <Link
              href="/fleet"
              className="px-5 py-2 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              + Book Another Vehicle
            </Link>
          </div>
        </div>

        {/* Action Bar: Filter Tabs on Left, Live Status on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left: Filter Tabs with room to breathe */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {loadingBookings ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-100 rounded-full animate-pulse shrink-0"
                  ></div>
                ))}
              </>
            ) : (
              tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    statusFilter === tab.key
                      ? "bg-[#5937E0] text-white shadow-xs"
                      : "bg-white border border-[#E5E7EB] text-[#6C757D] hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))
            )}
          </div>

          {/* Right: Live Realtime Status & Manual Refresh */}
          <div className="shrink-0 flex items-center justify-end">
            <DataFreshnessBadge
              isRefreshing={isRefreshing}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
            />
          </div>
        </div>

        {/* Bookings List */}
        {loadingBookings ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                  <div className="h-5 bg-gray-200 rounded w-28"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-[24px] border border-[#E5E7EB] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-black mb-1">
              No Reservations Found
            </h3>
            <p className="text-xs text-[#6C757D] mb-4 max-w-sm mx-auto">
              {statusFilter !== "all"
                ? `You have no reservations currently marked as ${statusFilter}.`
                : "You haven't made any bookings with this account yet. Choose a vehicle from our fleet to get started."}
            </p>
            <Link
              href="/fleet"
              className="inline-block px-6 py-2.5 rounded-full bg-[#5937E0] text-white text-xs font-bold"
            >
              Explore Our Fleet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const carThumb =
                (Array.isArray(b.cars?.images) && b.cars?.images[0]) ||
                "/logo-icon.png";

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                    {/* Reference & Date */}
                    <div>
                      <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider block">
                        Reference Code
                      </span>
                      <span className="text-lg font-mono font-black text-[#5937E0]">
                        {b.reference_code}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      {b.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Pending Review
                        </span>
                      )}
                      {b.status === "confirmed" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Confirmed & Scheduled
                        </span>
                      )}
                      {b.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Completed
                        </span>
                      )}
                      {b.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Cancelled
                        </span>
                      )}
                      {b.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          Declined
                        </span>
                      )}

                      {/* Cancel button if pending */}
                      {b.status === "pending" && (
                        <button
                          onClick={() =>
                            handleCancelBooking(b.id, b.reference_code)
                          }
                          disabled={cancellingId === b.id}
                          className="px-3 py-1 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === b.id
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Car Info */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="relative w-20 h-14 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] overflow-hidden shrink-0">
                        <Image
                          src={carThumb}
                          alt={`${b.cars?.make} ${b.cars?.model}`}
                          fill
                          unoptimized
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-black text-sm">
                          {b.cars?.make} {b.cars?.model} ({b.cars?.year})
                        </h4>
                        <span className="text-xs font-extrabold text-[#5937E0] block mt-0.5">
                          {b.total_price} DH{" "}
                          <span className="font-normal text-[#6C757D] text-[11px]">
                            (Pay at pickup)
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="md:col-span-4 space-y-1 text-xs">
                      <div>
                        <span className="text-[#6C757D]">Pickup: </span>
                        <strong className="text-black">
                          {b.pickup_date} ({b.pickup_time})
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#6C757D]">Return: </span>
                        <strong className="text-black">
                          {b.return_date} ({b.return_time})
                        </strong>
                      </div>
                      <div className="text-[11px] text-[#6C757D] truncate">
                        Location: {b.pickup_place}
                      </div>
                    </div>

                    {/* WhatsApp Assist */}
                    <div className="md:col-span-3 text-right">
                      <a
                        href={`https://wa.me/${agencyPhone}?text=${encodeURIComponent(
                          `Bonjour RideList! Je vous contacte concernant ma réservation ${b.reference_code}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>WhatsApp Help</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
