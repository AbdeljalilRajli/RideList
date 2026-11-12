"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CarProps } from "@/types";
import { supabase } from "@/lib/supabase";
import CarFormModal from "@/components/admin/CarFormModal";
import DeleteCarModal from "@/components/admin/DeleteCarModal";
import MigrateImagesModal from "@/components/admin/MigrateImagesModal";
import BookingTable from "@/components/admin/BookingTable";
import UserDropdown from "@/components/auth/UserDropdown";
import { useAdminData } from "@/hooks/useAdminData";
import DataFreshnessBadge from "@/components/common/DataFreshnessBadge";
import { formatBodyType, formatSegment, normalizeFuel, normalizeTransmission } from "@/lib/carTaxonomy";
import { useAuth } from "@/contexts/AuthContext";

interface AdminPortalProps {
  initialTab?: "fleet" | "bookings";
}

function AdminPortalContent({ initialTab }: AdminPortalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { user, isAdmin, loading: authLoading } = useAuth();

  // Tab state: prioritize route URL (/admin/bookings or /admin/cars), then searchParam, then prop
  const getResolvedTab = (): "fleet" | "bookings" => {
    if (pathname?.includes("/bookings") || tabParam === "bookings")
      return "bookings";
    if (pathname?.includes("/cars") || tabParam === "fleet") return "fleet";
    return initialTab || "fleet";
  };

  const [adminTab, setAdminTab] = useState<"fleet" | "bookings">(getResolvedTab);

  // Keep adminTab in sync when pathname or searchParams change
  useEffect(() => {
    setAdminTab(getResolvedTab());
  }, [pathname, tabParam]);

  // Filters & Search for Fleet
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "rented" | "maintenance" | "hidden"
  >("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<CarProps | null>(null);
  const [carToDelete, setCarToDelete] = useState<CarProps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Redirect if not verified admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [user, isAdmin, authLoading, router]);

  // Shared Single Source of Truth Hook for Fleet & Bookings with Realtime
  const {
    cars,
    bookings,
    loading,
    isRefreshing,
    lastUpdated,
    actionLoadingId,
    bookingsStats,
    carsStats,
    refresh,
    updateBookingStatus,
    updateCarStatus,
    saveCar,
    deleteCar,
  } = useAdminData(isAdmin);

  // Quick Status Toggle directly from Table with optimistic rollback
  const handleStatusChange = async (
    carId: string,
    newStatus: "available" | "rented" | "maintenance" | "hidden"
  ) => {
    try {
      await updateCarStatus(carId, newStatus);
      showToast(`Vehicle status changed to "${newStatus.toUpperCase()}".`);
    } catch (err: any) {
      console.error("Status update error:", err);
      showToast(err.message || "Failed to update vehicle status.", "error");
    }
  };

  // Filtered cars in memory (instant switching)
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        `${car.make} ${car.model} ${car.year} ${car.body_type || ""} ${car.segment || ""} ${car.class || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());

      const matchesStatus =
        statusFilter === "all" ? true : car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cars, searchQuery, statusFilter]);

  // Count cars with legacy local images
  const localImagesCount = useMemo(() => {
    return cars.filter((c) => {
      const mainImg =
        (Array.isArray(c.images) && c.images[0]) || c.image || "";
      return mainImg.startsWith("/") && !mainImg.startsWith("http");
    }).length;
  }, [cars]);

  const switchTab = (tab: "fleet" | "bookings") => {
    setAdminTab(tab);
    if (tab === "bookings") {
      router.push("/admin/bookings", { scroll: false });
    } else {
      router.push("/admin/cars", { scroll: false });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6C757D] text-sm font-medium">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const fleetTabs = [
    { key: "all", label: `All (${carsStats.total})` },
    { key: "available", label: `Available (${carsStats.available})` },
    { key: "rented", label: `Rented (${carsStats.rented})` },
    { key: "maintenance", label: `Maintenance (${carsStats.maintenance})` },
    { key: "hidden", label: `Hidden (${carsStats.hidden})` },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8F8FB] text-black font-['Work_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all ${
            toastMessage.type === "success"
              ? "bg-[#10B981] text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="RideList Logo"
                width={200}
                height={70}
                priority
                unoptimized
                className="h-10 w-auto object-contain"
              />
            </Link>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#5937E0] text-white text-[11px] font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="text-xs font-bold text-[#6C757D] hover:text-[#5937E0] transition-colors hidden md:block"
            >
              View Public Site →
            </Link>

            {/* Shared User Dropdown */}
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-8">
        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] mb-8">
          <button
            type="button"
            onClick={() => switchTab("fleet")}
            className={`pb-3.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === "fleet"
                ? "border-[#5937E0] text-[#5937E0]"
                : "border-transparent text-[#6C757D] hover:text-black"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"
              />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <span>Vehicles & Fleet</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                adminTab === "fleet"
                  ? "bg-[#EEEDF9] text-[#5937E0]"
                  : "bg-gray-100 text-[#6C757D]"
              }`}
            >
              {loading ? "..." : carsStats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("bookings")}
            className={`pb-3.5 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === "bookings"
                ? "border-[#5937E0] text-[#5937E0]"
                : "border-transparent text-[#6C757D] hover:text-black"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Reservations & Bookings</span>
            {bookingsStats.pending > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
                {bookingsStats.pending} new
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  adminTab === "bookings"
                    ? "bg-[#EEEDF9] text-[#5937E0]"
                    : "bg-gray-100 text-[#6C757D]"
                }`}
              >
                {loading ? "..." : `Orders (${bookingsStats.total})`}
              </span>
            )}
          </button>
        </div>

        {adminTab === "fleet" ? (
          <>
            {/* Page Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-['Work_Sans',sans-serif] tracking-tight">
                  Fleet & Car Management
                </h1>
                <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
                  Manage vehicle inventory, photos in Supabase Storage, pricing
                  in MAD, and live availability.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {localImagesCount > 0 && (
                  <button
                    onClick={() => setIsMigrateModalOpen(true)}
                    className="px-4 py-2.5 rounded-full bg-[#EEEDF9] hover:bg-[#5937E0] text-[#5937E0] hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <span>Upload Local Images ({localImagesCount})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCarToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add Vehicle</span>
                </button>
              </div>
            </div>

            {/* Fleet KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs animate-pulse space-y-2"
                    >
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-7 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Card 1: Total */}
                  <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
                    <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                      Total Fleet
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-black">
                        {carsStats.total}
                      </span>
                      <span className="text-[11px] font-bold text-[#5937E0]">
                        Vehicles
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Available */}
                  <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
                    <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                      Available for Rent
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#10B981]">
                        {carsStats.available}
                      </span>
                      <span className="text-[11px] font-bold text-[#10B981]">
                        Bookable
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Rented */}
                  <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
                    <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                      Currently Rented
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#FFA000]">
                        {carsStats.rented}
                      </span>
                      <span className="text-[11px] font-bold text-[#FFA000]">
                        On Road
                      </span>
                    </div>
                  </div>

                  {/* Card 4: In Maintenance / Hidden */}
                  <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
                    <span className="text-xs font-semibold text-[#6C757D] block mb-1">
                      Maintenance / Hidden
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#6C757D]">
                        {carsStats.maintenance + carsStats.hidden}
                      </span>
                      <span className="text-[11px] font-bold text-[#6C757D]">
                        Unavailable
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Toolbar: Search & Status Filters */}
            <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-4 sm:p-6 mb-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Input + Realtime Freshness */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search by make, model, or class..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0] transition-colors"
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
                    onRefresh={refresh}
                  />
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {loading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-8 w-20 bg-gray-100 rounded-full animate-pulse"
                        ></div>
                      ))}
                    </>
                  ) : (
                    fleetTabs.map((tab) => (
                      <button
                        key={tab.key}
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

            {/* Cars Inventory Table */}
            <div className="bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-xs">
              {loading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-50 rounded-xl animate-pulse flex items-center justify-between px-6"
                    >
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCars.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-sm font-bold text-black mb-1">
                    No vehicles found
                  </p>
                  <p className="text-xs text-[#6C757D] mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search query or status filter."
                      : "Get started by adding your first vehicle to the fleet."}
                  </p>
                  <button
                    onClick={() => {
                      setCarToEdit(null);
                      setIsFormModalOpen(true);
                    }}
                    className="px-5 py-2 rounded-full bg-[#5937E0] text-white text-xs font-bold"
                  >
                    + Add Vehicle
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8F8FB] border-b border-[#E5E7EB] text-[#6C757D] text-[11px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Vehicle</th>
                        <th className="py-4 px-6">Category & Specs</th>
                        <th className="py-4 px-6">Pricing & Policy</th>
                        <th className="py-4 px-6">Status (Quick Switch)</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredCars.map((car) => {
                        const mainImage =
                          (Array.isArray(car.images) && car.images[0]) ||
                          car.image ||
                          "/logo-icon.png";

                        const isLocal =
                          mainImage.startsWith("/") &&
                          !mainImage.startsWith("http");

                        return (
                          <tr
                            key={car.id || `${car.make}-${car.model}`}
                            className="hover:bg-[#F8F8FB]/60 transition-colors"
                          >
                            {/* 1. Vehicle Identity */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="relative w-16 h-12 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] overflow-hidden shrink-0">
                                  <Image
                                    src={mainImage}
                                    alt={`${car.make} ${car.model}`}
                                    fill
                                    unoptimized
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-black text-sm flex items-center gap-1.5">
                                    <span>
                                      {car.make} {car.model}
                                    </span>
                                    {isLocal && (
                                      <span
                                        className="inline-block w-2 h-2 rounded-full bg-amber-500"
                                        title="Local image file"
                                      ></span>
                                    )}
                                  </div>
                                  <span className="text-xs text-[#6C757D]">
                                    {car.year} • {car.color || "Standard"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Specs */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-[#EEEDF9] text-[#5937E0] font-bold text-[11px]">
                                  {formatBodyType(car.body_type)}
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px] capitalize">
                                  {formatSegment(car.segment)}
                                </span>
                              </div>
                              <span className="text-xs text-[#6C757D] block">
                                {normalizeTransmission(car.transmission)} • {normalizeFuel(car.fuel_type)} • {car.seats || 5} seats
                              </span>
                            </td>

                            {/* 3. Pricing */}
                            <td className="py-4 px-6">
                              <div className="font-bold text-black text-sm">
                                {car.price_per_day}{" "}
                                <span className="text-xs font-normal text-[#6C757D]">
                                  DH/day
                                </span>
                              </div>
                              <span className="text-xs text-[#6C757D] block">
                                Deposit: {car.deposit_amount ?? 3000} DH •{" "}
                                {car.km_policy || "Unlimited"}
                              </span>
                            </td>

                            {/* 4. Quick Status Switcher */}
                            <td className="py-4 px-6">
                              {actionLoadingId === car.id ? (
                                <div className="flex items-center gap-1.5 text-xs text-[#5937E0] font-semibold">
                                  <div className="w-3.5 h-3.5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
                                  <span>Saving...</span>
                                </div>
                              ) : (
                                <select
                                  value={car.status || "available"}
                                  onChange={(e) =>
                                    car.id &&
                                    handleStatusChange(
                                      car.id,
                                      e.target.value as any
                                    )
                                  }
                                  className={`h-8 px-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                                    car.status === "available"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : car.status === "rented"
                                      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                      : car.status === "maintenance"
                                      ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                  }`}
                                >
                                  <option value="available">● Available</option>
                                  <option value="rented">● Rented</option>
                                  <option value="maintenance">
                                    ● Maintenance
                                  </option>
                                  <option value="hidden">● Hidden</option>
                                </select>
                              )}
                            </td>

                            {/* 5. Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setCarToEdit(car);
                                    setIsFormModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] flex items-center justify-center transition-colors cursor-pointer"
                                  title="Edit vehicle"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => {
                                    setCarToDelete(car);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#F8F8FB] hover:bg-red-50 text-[#6C757D] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete vehicle"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
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
          </>
        ) : (
          <BookingTable
            bookings={bookings}
            loading={loading}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            onRefresh={refresh}
            onUpdateStatus={updateBookingStatus}
            actionLoadingId={actionLoadingId}
            onToast={showToast}
          />
        )}
      </main>

      {/* Add / Edit Car Modal */}
      <CarFormModal
        isOpen={isFormModalOpen}
        carToEdit={carToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setCarToEdit(null);
        }}
        onSaved={(savedCar, isNew) => {
          saveCar(savedCar, isNew);
          if (isNew) {
            showToast(
              `Vehicle "${savedCar.make} ${savedCar.model}" created successfully.`
            );
          } else {
            showToast(
              `Vehicle "${savedCar.make} ${savedCar.model}" updated successfully.`
            );
          }
        }}
      />

      {/* Delete Car Confirmation Modal */}
      <DeleteCarModal
        isOpen={isDeleteModalOpen}
        car={carToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCarToDelete(null);
        }}
        onDeleted={async (carId) => {
          await deleteCar(carId);
          showToast("Vehicle and its photos were deleted successfully.");
        }}
      />

      {/* Migrate Local Images Modal */}
      <MigrateImagesModal
        isOpen={isMigrateModalOpen}
        cars={cars}
        onClose={() => setIsMigrateModalOpen(false)}
        onCompleted={() => {
          refresh();
          showToast(
            "Image migration completed successfully! All cars now use Supabase Storage."
          );
        }}
      />
    </div>
  );
}

export default function AdminPortal({ initialTab }: AdminPortalProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6C757D] text-sm font-medium">
              Loading Admin Portal...
            </p>
          </div>
        </div>
      }
    >
      <AdminPortalContent initialTab={initialTab} />
    </Suspense>
  );
}
