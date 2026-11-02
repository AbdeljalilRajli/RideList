"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

interface Booking {
  id: string;
  carId: string;
  carMake: string;
  carModel: string;
  carYear?: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  totalDays: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  bookingReference?: string;
  paySchedule?: "online" | "counter";
  protectionPlan?: string;
  createdAt: Date;
}

const AdminDashboard = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
};

const AdminDashboardContent = () => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "completed" | "cancelled">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/");
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user && userData?.role === "admin") {
      fetchBookings();
    }
  }, [user, userData]);

  const fetchBookings = async () => {
    try {
      const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        };
      }) as Booking[];

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings in admin console:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    setUpdatingId(bookingId);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error("Failed to update status in Firestore:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const active = bookings.filter((b) => b.status === "confirmed").length;
    const revenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    return { total, pending, active, revenue };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;
      const matchesSearch =
        (b.customerName || "").toLowerCase().includes(q) ||
        (b.customerEmail || "").toLowerCase().includes(q) ||
        (b.carMake || "").toLowerCase().includes(q) ||
        (b.carModel || "").toLowerCase().includes(q) ||
        (b.bookingReference || "").toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3] mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#6B7280]">Loading operations control...</p>
        </div>
      </div>
    );
  }

  if (!user || userData?.role !== "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#0F0F1A] pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col gap-8">
        {/* Top Control Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1B4B] text-white text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px] text-indigo-300">admin_panel_settings</span>
                Executive Admin
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                Live Ops Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
              Fleet Operations & Bookings
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Dispatch authorization, member reservations, and rental ledger management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="h-11 px-5 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F8F8FB] text-[#0F0F1A] text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Sync Bookings
            </button>
            <Link
              href="/fleet"
              className="h-11 px-6 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
              Fleet Directory
            </Link>
          </div>
        </header>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Bookings */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Bookings</span>
              <div className="w-10 h-10 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#0F0F1A]">{stats.total}</span>
              <p className="text-xs text-[#6B7280] mt-1">All-time reservation volume</p>
            </div>
          </div>

          {/* Active Dispatches */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Dispatches</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-emerald-600">{stats.active}</span>
              <p className="text-xs text-[#6B7280] mt-1">Confirmed vehicles on road / queued</p>
            </div>
          </div>

          {/* Pending Review */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Pending Review</span>
              <div className="w-10 h-10 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#3730A3]">{stats.pending}</span>
              <p className="text-xs text-[#6B7280] mt-1">Awaiting dispatch clearance</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Gross Fleet Revenue</span>
              <div className="w-10 h-10 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">paid</span>
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#0F0F1A]">${stats.revenue}</span>
              <p className="text-xs text-[#6B7280] mt-1">Confirmed & completed turnover</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8F8FB] border border-[#E5E7EB] rounded-full self-start md:self-auto">
            {[
              { id: "all", label: `All (${bookings.length})` },
              { id: "confirmed", label: `Confirmed (${bookings.filter((b) => b.status === "confirmed").length})` },
              { id: "pending", label: `Pending (${bookings.filter((b) => b.status === "pending").length})` },
              { id: "completed", label: `Completed (${bookings.filter((b) => b.status === "completed").length})` },
              { id: "cancelled", label: `Cancelled (${bookings.filter((b) => b.status === "cancelled").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-white text-[#0F0F1A] shadow-sm border border-[#E5E7EB]"
                    : "text-[#6B7280] hover:text-[#0F0F1A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver, email, ref #..."
              className="w-full h-11 pl-10 pr-4 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#0F0F1A] focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>
        </div>

        {/* Bookings Ledger Section */}
        <section className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0F0F1A]">Reservation Roster</h2>
              <p className="text-xs text-[#6B7280]">
                Showing {filteredBookings.length} of {bookings.length} reservations
              </p>
            </div>
          </div>

          {loadingBookings ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3730A3] mx-auto mb-3"></div>
              <p className="text-xs text-[#6B7280]">Syncing live booking roster from Firestore...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-16 text-center bg-[#F8F8FB] m-6 rounded-2xl border border-[#E5E7EB]">
              <div className="w-14 h-14 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">inbox</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F0F1A]">No Bookings Found</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
                There are no client bookings matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F8FB] border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-4 px-6">Driver & Contact</th>
                    <th className="py-4 px-6">Vehicle Reserved</th>
                    <th className="py-4 px-6">Rental Itinerary</th>
                    <th className="py-4 px-6">Financials</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredBookings.map((b) => {
                    const isUpdating = updatingId === b.id;
                    const refCode = b.bookingReference || `RL-${b.id.slice(0, 6).toUpperCase()}`;

                    return (
                      <tr key={b.id} className="hover:bg-[#F8F8FB]/50 transition-colors">
                        {/* Driver */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0F0F1A]">{b.customerName || "Member Guest"}</span>
                              <code className="text-[10px] px-2 py-0.5 rounded bg-[#EEEDF9] text-[#3730A3] font-bold">
                                {refCode}
                              </code>
                            </div>
                            <span className="text-[#6B7280]">{b.customerEmail}</span>
                            <span className="text-[#9CA3AF] text-[11px]">{b.customerPhone}</span>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#0F0F1A]">
                              {b.carMake} {b.carModel}
                            </span>
                            <span className="text-[#6B7280]">{b.carYear || 2024} Edition</span>
                            {b.protectionPlan && (
                              <span className="text-[10px] font-semibold text-[#3730A3] capitalize mt-0.5">
                                {b.protectionPlan} Plan
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Itinerary */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="font-semibold text-[#0F0F1A]">
                              {b.pickupDate} → {b.returnDate}
                            </div>
                            <span className="text-[#6B7280]">Duration: {b.totalDays} Days</span>
                            <span className="text-[11px] text-[#9CA3AF] truncate max-w-xs">
                              {b.pickupLocation || "SFO Airport"}
                            </span>
                          </div>
                        </td>

                        {/* Financials */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-base font-extrabold text-[#0F0F1A]">${b.totalPrice}</span>
                            <span className="text-[11px] text-[#6B7280] capitalize">
                              {b.paySchedule === "online" ? "Online Guaranteed" : "Pay at Counter"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "pending"
                                ? "bg-[#EEEDF9] text-[#3730A3]"
                                : b.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {b.status === "confirmed" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>}
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          {isUpdating ? (
                            <div className="inline-block w-4 h-4 border-2 border-[#3730A3] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, "confirmed")}
                                    className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, "cancelled")}
                                    className="px-3 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {b.status === "confirmed" && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, "completed")}
                                    className="px-3 py-1.5 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-[11px] transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, "cancelled")}
                                    className="px-3 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {b.status === "cancelled" && (
                                <button
                                  onClick={() => updateBookingStatus(b.id, "pending")}
                                  className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F8F8FB] text-[#0F0F1A] font-bold text-[11px] transition-colors"
                                >
                                  Reopen
                                </button>
                              )}

                              {b.status === "completed" && (
                                <span className="text-[11px] font-semibold text-[#6B7280]">Archived</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
