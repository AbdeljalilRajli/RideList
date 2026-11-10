"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AdminBooking } from "@/hooks/useAdminData";
import DataFreshnessBadge from "@/components/common/DataFreshnessBadge";

interface BookingTableProps {
  bookings: AdminBooking[];
  loading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => Promise<void>;
  onUpdateStatus: (
    booking: AdminBooking,
    newStatus: "confirmed" | "rejected" | "completed" | "cancelled"
  ) => Promise<void>;
  actionLoadingId: string | null;
  onToast?: (text: string, type?: "success" | "error") => void;
}

function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "212" + digits.substring(1);
  }
  if (!digits.startsWith("212") && digits.length === 9) {
    return "212" + digits;
  }
  return digits;
}

export default function BookingTable({
  bookings,
  loading,
  isRefreshing,
  lastUpdated,
  onRefresh,
  onUpdateStatus,
  actionLoadingId,
  onToast,
}: BookingTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected"
  >("all");

  // Selected booking for full details modal
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null
  );

  // Unfiltered stats: always computed from the complete unfiltered bookings list
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const rejected = bookings.filter((b) => b.status === "rejected").length;
    return { total, pending, confirmed, completed, cancelled, rejected };
  }, [bookings]);

  // In-memory instant filtering
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.reference_code.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_phone.includes(q) ||
        `${b.cars?.make || ""} ${b.cars?.model || ""}`
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const handleAction = async (
    booking: AdminBooking,
    newStatus: "confirmed" | "rejected" | "completed" | "cancelled"
  ) => {
    try {
      await onUpdateStatus(booking, newStatus);
      if (newStatus === "confirmed") {
        onToast?.(`Booking ${booking.reference_code} has been CONFIRMED.`);
      } else if (newStatus === "completed") {
        onToast?.(`Booking ${booking.reference_code} marked as COMPLETED.`);
      } else if (newStatus === "rejected") {
        onToast?.(
          `Booking ${booking.reference_code} has been REJECTED.`,
          "error"
        );
      } else {
        onToast?.(`Booking ${booking.reference_code} has been CANCELLED.`);
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      onToast?.(err.message || "Failed to update booking status.", "error");
    }
  };

  const tabs = [
    { key: "all", label: `All (${stats.total})` },
    { key: "pending", label: `Pending (${stats.pending})` },
    { key: "confirmed", label: `Confirmed (${stats.confirmed})` },
    { key: "completed", label: `Completed (${stats.completed})` },
    { key: "cancelled", label: `Cancelled (${stats.cancelled})` },
    { key: "rejected", label: `Rejected (${stats.rejected})` },
  ] as const;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-xs animate-pulse space-y-2"
              >
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-7 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                Total Reservations
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-black">
                  {stats.total}
                </span>
                <span className="text-[11px] font-bold text-[#5937E0]">
                  Bookings
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                Pending Review
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {stats.pending}
                </span>
                <span className="text-[11px] font-bold text-amber-600">
                  Action Required
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                Confirmed & Active
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {stats.confirmed}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  Scheduled
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                Completed
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {stats.completed}
                </span>
                <span className="text-[11px] font-bold text-blue-600">
                  Finished
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search + Realtime Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by code, customer name, phone, or car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0]"
              />
              <svg
                className="w-5 h-5 text-[#9CA3AF] absolute left-3.5 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <DataFreshnessBadge
              isRefreshing={isRefreshing}
              lastUpdated={lastUpdated}
              onRefresh={onRefresh}
            />
          </div>

          {/* Status Tabs (Instant In-Memory Switching) */}
          <div className="flex flex-wrap items-center gap-2">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-gray-100 rounded-full animate-pulse"
                  ></div>
                ))}
              </>
            ) : (
              tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? "bg-[#5937E0] text-white shadow-xs"
                      : "bg-[#F8F8FB] text-[#6C757D] hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-50 rounded-xl animate-pulse flex items-center justify-between px-6"
              >
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-bold text-black mb-1">
              No reservations found
            </p>
            <p className="text-xs text-[#6C757D]">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or filter."
                : "No customer bookings have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F8FB] border-b border-[#E5E7EB] text-[#6C757D] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Reference & Date</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Customer & WhatsApp</th>
                  <th className="py-4 px-6">Schedule & Location</th>
                  <th className="py-4 px-6">Price & Caution</th>
                  <th className="py-4 px-6">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredBookings.map((b) => {
                  const carThumb =
                    (Array.isArray(b.cars?.images) && b.cars?.images[0]) ||
                    "/logo-icon.png";

                  const phoneClean = cleanPhoneForWhatsApp(b.customer_phone);

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F8F8FB]/60 transition-colors"
                    >
                      {/* 1. Reference & Created */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-black text-black text-sm block">
                          {b.reference_code}
                        </span>
                        <span className="text-[11px] text-[#6C757D]">
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* 2. Vehicle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] overflow-hidden shrink-0">
                            <Image
                              src={carThumb}
                              alt={`${b.cars?.make} ${b.cars?.model}`}
                              fill
                              unoptimized
                              className="object-contain p-1"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-black text-xs block">
                              {b.cars?.make} {b.cars?.model}
                            </span>
                            <span className="text-[11px] text-[#6C757D]">
                              {b.cars?.year}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Customer & WhatsApp */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-black text-xs block">
                          {b.customer_name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                              `Bonjour ${b.customer_name}! Nous vous contactons depuis l'agence RideList concernant votre réservation ${b.reference_code} pour la ${b.cars?.make} ${b.cars?.model}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <span>💬 {b.customer_phone}</span>
                          </a>
                        </div>
                        {b.customer_email && (
                          <span className="text-[11px] text-[#6C757D] block truncate max-w-[160px]">
                            {b.customer_email}
                          </span>
                        )}
                      </td>

                      {/* 4. Schedule & Location */}
                      <td className="py-4 px-6 text-xs">
                        <div className="space-y-1">
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
                          <span className="text-[11px] text-[#5937E0] block truncate max-w-[180px]">
                            📍 {b.pickup_place}
                          </span>
                        </div>
                      </td>

                      {/* 5. Pricing */}
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-[#5937E0] text-sm block">
                          {b.total_price} DH
                        </span>
                        <span className="text-[11px] text-[#6C757D] block">
                          Caution: {b.deposit_amount} DH
                        </span>
                        {b.extras && b.extras.length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            +{b.extras.length}{" "}
                            {b.extras.length === 1 ? "extra" : "extras"}
                          </span>
                        )}
                      </td>

                      {/* 6. Status & Actions */}
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          {/* Current Status Pill */}
                          <div>
                            {b.status === "pending" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                                ● Pending
                              </span>
                            )}
                            {b.status === "confirmed" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                ● Confirmed
                              </span>
                            )}
                            {b.status === "completed" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                                ● Completed
                              </span>
                            )}
                            {b.status === "cancelled" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 text-[11px] font-bold border border-red-200">
                                ● Cancelled
                              </span>
                            )}
                            {b.status === "rejected" && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-300">
                                ● Rejected
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {actionLoadingId === b.id ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#5937E0]">
                              <div className="w-3.5 h-3.5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {b.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAction(b, "confirmed")
                                    }
                                    className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => handleAction(b, "rejected")}
                                    className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold border border-red-200 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {b.status === "confirmed" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAction(b, "completed")
                                    }
                                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction(b, "cancelled")
                                    }
                                    className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => setSelectedBooking(b)}
                                className="px-2 py-1 rounded-md bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#5937E0] text-[10px] font-bold cursor-pointer"
                              >
                                Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 border border-[#E5E7EB] shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[11px] font-bold text-[#6C757D] uppercase">
                  Reservation Details
                </span>
                <h3 className="text-xl font-mono font-black text-[#5937E0]">
                  {selectedBooking.reference_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F8FB]">
                <strong className="block text-black text-sm mb-1">
                  {selectedBooking.cars?.make} {selectedBooking.cars?.model} (
                  {selectedBooking.cars?.year})
                </strong>
                <p className="text-[#6C757D]">
                  Pickup: {selectedBooking.pickup_date} at{" "}
                  {selectedBooking.pickup_time} ({selectedBooking.pickup_place})
                </p>
                {selectedBooking.pickup_address && (
                  <p className="text-black italic">
                    Address: {selectedBooking.pickup_address}
                  </p>
                )}
                <p className="text-[#6C757D] mt-1">
                  Return: {selectedBooking.return_date} at{" "}
                  {selectedBooking.return_time} ({selectedBooking.return_place})
                </p>
                {selectedBooking.return_address && (
                  <p className="text-black italic">
                    Address: {selectedBooking.return_address}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F8FB] space-y-1">
                <p>
                  <span className="text-[#6C757D]">Customer:</span>{" "}
                  <strong className="text-black">
                    {selectedBooking.customer_name}
                  </strong>
                </p>
                <p>
                  <span className="text-[#6C757D]">Phone:</span>{" "}
                  <strong className="text-black">
                    {selectedBooking.customer_phone}
                  </strong>
                </p>
                <p>
                  <span className="text-[#6C757D]">Email:</span>{" "}
                  <strong className="text-black">
                    {selectedBooking.customer_email || "N/A (Guest)"}
                  </strong>
                </p>
                <p>
                  <span className="text-[#6C757D]">Country:</span>{" "}
                  <strong className="text-black">
                    {selectedBooking.customer_country || "Morocco"}
                  </strong>
                </p>
                {selectedBooking.notes && (
                  <p className="pt-1 text-[#0F0F1A] border-t border-[#E5E7EB]">
                    <span className="text-[#6C757D]">Notes:</span>{" "}
                    {selectedBooking.notes}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F8FB] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Total Amount:</span>
                  <strong className="text-base font-extrabold text-[#5937E0]">
                    {selectedBooking.total_price} DH
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">
                    Security Deposit (Caution):
                  </span>
                  <strong className="text-black">
                    {selectedBooking.deposit_amount} DH
                  </strong>
                </div>
                {selectedBooking.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">Delivery Fee:</span>
                    <strong className="text-black">
                      +{selectedBooking.delivery_fee} DH
                    </strong>
                  </div>
                )}
                {selectedBooking.extras &&
                  selectedBooking.extras.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E7EB]">
                      <span className="text-[#6C757D] block mb-1">
                        Extras Included:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {selectedBooking.extras.map((ex: any, i: number) => (
                          <li key={i} className="text-black">
                            {ex.name} (+{ex.cost || ex.price} DH)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 rounded-full bg-[#5937E0] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
