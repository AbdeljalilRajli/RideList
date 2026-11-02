"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface ReservationCheckoutProps {
  car: CarProps;
  initialPickupDate?: string;
  initialReturnDate?: string;
  initialPickupLocation?: string;
  initialDropoffLocation?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export type ProtectionTier = "premium" | "standard" | "basic";

interface AddonItem {
  id: string;
  title: string;
  subtitle: string;
  pricePerDay?: number;
  flatPrice?: number;
  icon: string;
}

const ADDONS: AddonItem[] = [
  {
    id: "toll",
    title: "Unlimited Express Toll Pass",
    subtitle: "Bypass Bay Area Fastrak and toll plazas with zero transaction penalties.",
    pricePerDay: 8,
    icon: "toll",
  },
  {
    id: "fuel",
    title: "Pre-Paid Fuel Refill",
    subtitle: "Return at empty; skip airport pump markups and return refueling fees.",
    flatPrice: 42,
    icon: "local_gas_station",
  },
  {
    id: "childSeat",
    title: "Child Safety Seat",
    subtitle: "Sanitized front/rear facing seat certified to federal safety standards.",
    pricePerDay: 10,
    icon: "child_friendly",
  },
  {
    id: "secondDriver",
    title: "Additional Registered Driver",
    subtitle: "Share the driving duties. Complimentary for executive members.",
    flatPrice: 0,
    icon: "group_add",
  },
];

export default function ReservationCheckout({
  car,
  initialPickupDate,
  initialReturnDate,
  initialPickupLocation = "SFO Airport - Rental Concourse",
  initialDropoffLocation = "SFO Airport - Rental Concourse",
  onClose,
  isModal = false,
}: ReservationCheckoutProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Current Step: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Rental schedule
  const [pickupDate, setPickupDate] = useState(
    initialPickupDate || new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState(
    initialReturnDate || new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]
  );
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnTime, setReturnTime] = useState("10:00 AM");
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation);
  const [dropoffLocation, setDropoffLocation] = useState(initialDropoffLocation);

  // Step 1: Protection & Add-ons
  const [protection, setProtection] = useState<ProtectionTier>("premium");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["toll"]);

  // Step 2: Driver details
  const [driver, setDriver] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "(415) 555-0192",
    dob: "1994-06-15",
    address: "1842 Pacific Heights",
    city: "San Francisco",
    state: "CA",
    postalCode: "94109",
    country: "United States",
    licenseNumber: "D9482104",
    licenseState: "California",
    licenseExpiry: "2029-08-20",
    flightCarrier: "United Airlines",
    flightNumber: "UA 1482",
    hasSecondDriver: false,
  });

  // Step 3: Payment
  const [paySchedule, setPaySchedule] = useState<"online" | "counter">("online");
  const [cardData, setCardData] = useState({
    cardholder: "Julian Vance",
    cardNumber: "•••• •••• •••• 4242",
    expiry: "09/28",
    cvv: "842",
    zip: "94109",
    termsAccepted: true,
  });

  // Submission & Confirmed state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [submissionError, setSubmissionError] = useState<string>("");

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      const parts = (user.displayName || "").split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setDriver((prev) => ({
        ...prev,
        firstName: prev.firstName || first || "Julian",
        lastName: prev.lastName || last || "Vance",
        email: prev.email || user.email || "",
      }));
      setCardData((prev) => ({
        ...prev,
        cardholder: prev.cardholder || user.displayName || "Julian Vance",
      }));
    }
  }, [user]);

  // Duration calculation
  const totalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(pickupDate).getTime();
    const end = new Date(returnDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [pickupDate, returnDate]);

  // Pricing calculation
  const protectionDailyRate = protection === "premium" ? 18 : protection === "standard" ? 10 : 0;
  const vehicleSubtotal = car.price_per_day * totalDays;
  const protectionSubtotal = protectionDailyRate * totalDays;

  const addonsSubtotal = useMemo(() => {
    let sum = 0;
    selectedAddons.forEach((id) => {
      const item = ADDONS.find((a) => a.id === id);
      if (item) {
        if (item.flatPrice !== undefined) sum += item.flatPrice;
        else if (item.pricePerDay !== undefined) sum += item.pricePerDay * totalDays;
      }
    });
    return sum;
  }, [selectedAddons, totalDays]);

  const taxSubtotal = Math.round((vehicleSubtotal + protectionSubtotal) * 0.1);
  const onlineDiscount = paySchedule === "online" ? Math.round(vehicleSubtotal * 0.05) : 0;
  const totalEstimatedPrice = vehicleSubtotal + protectionSubtotal + addonsSubtotal + taxSubtotal - onlineDiscount;
  const dueToday = paySchedule === "online" ? totalEstimatedPrice : 0;
  const dueAtCounter = paySchedule === "online" ? 0 : totalEstimatedPrice;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit to Firestore
  const handleConfirmReservation = async () => {
    if (!cardData.termsAccepted) {
      setSubmissionError("Please agree to the Rental Agreement and Protection Terms.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const generatedRef = `RL-${Math.floor(100000 + Math.random() * 900000)}`;
      const fullName = `${driver.firstName} ${driver.lastName}`.trim() || user?.displayName || "Member Guest";

      await addDoc(collection(db, "bookings"), {
        carId: `${car.make.toLowerCase()}-${car.model.toLowerCase().replace(/\s+/g, "-")}-${car.year}`,
        carMake: car.make,
        carModel: car.model,
        carYear: car.year,
        carPricePerDay: car.price_per_day,
        userId: user?.uid || null,
        customerName: fullName,
        customerEmail: driver.email || user?.email || "guest@ridelist.com",
        customerPhone: driver.phone,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        pickupLocation,
        dropoffLocation,
        totalDays,
        totalPrice: totalEstimatedPrice,
        protectionPlan: protection,
        addons: selectedAddons,
        paySchedule,
        dueToday,
        dueAtCounter,
        bookingReference: generatedRef,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      setBookingRef(generatedRef);
      setCurrentStep(4);
    } catch (err: any) {
      console.error("Failed to persist booking to Firestore:", err);
      setSubmissionError(err.message || "Failed to confirm reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const carImage = getCarImage(car);

  return (
    <div className={`w-full text-[#0F0F1A] ${isModal ? "p-4 sm:p-6" : "min-h-screen bg-[#F8F8FB]"}`}>
      {/* 1. Stepper Progress Bar Header (Matches Stitch exactly) */}
      <div className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          {/* Steps Indicator */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-medium text-xs">
            {/* Step 1 */}
            <button
              onClick={() => currentStep > 1 && setCurrentStep(1)}
              className={`flex items-center gap-2 ${
                currentStep === 1
                  ? "text-[#0F0F1A] font-bold"
                  : currentStep > 1
                  ? "text-[#3730A3] hover:underline"
                  : "text-[#9CA3AF]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1
                    ? "bg-[#3730A3] text-white"
                    : currentStep > 1
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#F1F2F8] text-[#6B7280]"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </span>
              <span className="hidden sm:inline">Vehicle & Protection</span>
            </button>

            <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">chevron_right</span>

            {/* Step 2 */}
            <button
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`flex items-center gap-2 ${
                currentStep === 2
                  ? "text-[#0F0F1A] font-bold"
                  : currentStep > 2
                  ? "text-[#3730A3] hover:underline"
                  : "text-[#9CA3AF]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2
                    ? "bg-[#3730A3] text-white"
                    : currentStep > 2
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#F1F2F8] text-[#6B7280]"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </span>
              <span className="hidden sm:inline">Driver Information</span>
            </button>

            <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">chevron_right</span>

            {/* Step 3 */}
            <button
              onClick={() => currentStep > 3 && setCurrentStep(3)}
              className={`flex items-center gap-2 ${
                currentStep === 3
                  ? "text-[#0F0F1A] font-bold"
                  : currentStep > 3
                  ? "text-[#3730A3] hover:underline"
                  : "text-[#9CA3AF]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3
                    ? "bg-[#3730A3] text-white"
                    : currentStep > 3
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-[#F1F2F8] text-[#6B7280]"
                }`}
              >
                {currentStep > 3 ? "✓" : "3"}
              </span>
              <span className="hidden sm:inline">Payment & Guarantee</span>
            </button>

            <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">chevron_right</span>

            {/* Step 4 */}
            <div
              className={`flex items-center gap-2 ${
                currentStep === 4 ? "text-[#0F0F1A] font-bold" : "text-[#9CA3AF]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 4 ? "bg-emerald-600 text-white" : "bg-[#F1F2F8] text-[#6B7280]"
                }`}
              >
                4
              </span>
              <span className="hidden sm:inline">Confirmation</span>
            </div>
          </div>

          {/* Right Trust Strip */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="material-symbols-outlined text-[18px] text-[#3730A3]">verified_user</span>
              <span>Free cancellation up to 48 hrs</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F1F2F8] hover:bg-[#E5E7EB] text-[#6B7280] flex items-center justify-center transition-colors"
                aria-label="Close checkout"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reservation Content Layout */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* ================= STEP 4: CONFIRMATION ================= */}
        {currentStep === 4 ? (
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Success Banner */}
            <div className="p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-lg text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
                Reservation Confirmed & Guaranteed
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
                You&apos;re Ready to Roll!
              </h1>
              <p className="text-[#6B7280] text-sm max-w-lg mt-2">
                We&apos;ve securely reserved your {car.make} {car.model} at {pickupLocation}. All check-in passes and rental documents have been linked to your account.
              </p>

              {/* Reference Pill */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <div>
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Booking Reference</span>
                  <span className="text-2xl font-extrabold text-[#3730A3] tracking-widest">{bookingRef}</span>
                </div>
                <div className="sm:border-l sm:border-[#E5E7EB] sm:pl-8 text-left">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Assigned Bay</span>
                  <span className="text-lg font-bold text-[#0F0F1A]">Express Bay B-14</span>
                </div>
                <div className="sm:border-l sm:border-[#E5E7EB] sm:pl-8 text-left">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Keyless Pass</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    <span className="material-symbols-outlined text-[16px]">smartphone</span> NFC Armed
                  </span>
                </div>
              </div>
            </div>

            {/* Arrival & Keyless Handover instructions */}
            <div className="p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm">
              <h2 className="text-xl font-bold text-[#0F0F1A] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3730A3]">flight_land</span>
                Arrival & Express Handover
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EEEDF9] text-[#3730A3] font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-[#0F0F1A]">AirTrain to Rental Center</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    From baggage claim, follow overhead signs toward Blue Line AirTrain straight to the RideList Level 2 Concourse.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EEEDF9] text-[#3730A3] font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-[#0F0F1A]">Locate Bay B-14</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Skip all counter lines. Your {car.make} {car.model} will be climate-conditioned and unlocked via your digital pass.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#EEEDF9] text-[#3730A3] font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-[#0F0F1A]">Express Gate Exit</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Show your QR pass at the exit gate scanner. The boom gate lifts automatically for non-stop departure.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Go to Member Dashboard
              </Link>
              <Link
                href="/fleet"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F8F8FB] text-[#0F0F1A] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                Browse Fleet Directory
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto h-12 px-6 rounded-full bg-[#F1F2F8] hover:bg-[#E5E7EB] text-[#6B7280] font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Voucher
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEPS 1, 2, 3 LAYOUT ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Main Form Steps (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Error banner */}
              {submissionError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <span>{submissionError}</span>
                </div>
              )}

              {/* ========== STEP 1: VEHICLE & PROTECTION ========== */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-8">
                  {/* Selected Vehicle Card */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-56 h-36 relative bg-[#F8F8FB] rounded-2xl flex items-center justify-center shrink-0">
                      <Image
                        src={carImage}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-contain p-3"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-0.5 rounded-full bg-[#EEEDF9] text-[#3730A3] text-[11px] font-bold uppercase">
                          {car.class || "Premium Class"}
                        </span>
                        <span className="text-xs text-[#6B7280] font-semibold">{car.year}</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#0F0F1A]">
                        {car.make} {car.model}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                        <div>
                          <span className="block font-bold text-[#0F0F1A]">Transmission</span>
                          <span>{car.transmission === "a" ? "Automatic" : "Manual"}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[#0F0F1A]">Drivetrain</span>
                          <span>{car.drive.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[#0F0F1A]">Efficiency</span>
                          <span>{car.city_mpg} MPG</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[#0F0F1A]">Rate</span>
                          <span className="text-[#3730A3] font-bold">${car.price_per_day}/day</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental Schedule & Stations */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm">
                    <h3 className="text-lg font-bold text-[#0F0F1A] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#3730A3]">calendar_month</span>
                      Trip Schedule & Station
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Pick-up Date
                        </label>
                        <input
                          type="date"
                          value={pickupDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={returnDate}
                          min={pickupDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Pick-up Location
                        </label>
                        <select
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        >
                          <option value="SFO Airport - Rental Concourse">SFO Airport - Rental Concourse</option>
                          <option value="Downtown San Francisco - Union Square">Downtown San Francisco - Union Square</option>
                          <option value="San Jose Mineta Airport (SJC)">San Jose Mineta Airport (SJC)</option>
                          <option value="Oakland International Airport (OAK)">Oakland International Airport (OAK)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Return Location
                        </label>
                        <select
                          value={dropoffLocation}
                          onChange={(e) => setDropoffLocation(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        >
                          <option value="SFO Airport - Rental Concourse">SFO Airport - Rental Concourse</option>
                          <option value="Downtown San Francisco - Union Square">Downtown San Francisco - Union Square</option>
                          <option value="San Jose Mineta Airport (SJC)">San Jose Mineta Airport (SJC)</option>
                          <option value="Oakland International Airport (OAK)">Oakland International Airport (OAK)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Protection Coverage Options (Stitch Step 1) */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Coverage Selection</span>
                      <h3 className="text-2xl font-bold text-[#0F0F1A]">Select Protection Coverage</h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Drive with total confidence. All tiers include 24/7 client dispatch.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {/* Premium Tier */}
                      <div
                        onClick={() => setProtection("premium")}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                          protection === "premium"
                            ? "border-[#3730A3] bg-[#EEEDF9]/40 shadow-md ring-1 ring-[#3730A3]"
                            : "border-[#E5E7EB] bg-white hover:border-[#3730A3]/50"
                        }`}
                      >
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#1E1B4B] text-white text-[10px] font-extrabold uppercase tracking-wide">
                          Recommended
                        </span>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-base text-[#0F0F1A]">Premium Peace</span>
                            <span className="text-xl font-extrabold text-[#3730A3]">$18<span className="text-xs text-[#6B7280]">/d</span></span>
                          </div>
                          <p className="text-xs text-[#6B7280] mb-3">Zero deductible liability for all road events.</p>
                          <ul className="text-xs text-[#0F0F1A] space-y-1.5">
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> $0 Collision Deductible</li>
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> Windshield & Tire Coverage</li>
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> 24/7 Key Replacement</li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0F0F1A]">{protection === "premium" ? "Selected" : "Select Tier"}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${protection === "premium" ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB]"}`}>
                            {protection === "premium" && "✓"}
                          </span>
                        </div>
                      </div>

                      {/* Standard Tier */}
                      <div
                        onClick={() => setProtection("standard")}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          protection === "standard"
                            ? "border-[#3730A3] bg-[#EEEDF9]/40 shadow-md ring-1 ring-[#3730A3]"
                            : "border-[#E5E7EB] bg-white hover:border-[#3730A3]/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-base text-[#0F0F1A]">Standard Care</span>
                            <span className="text-xl font-extrabold text-[#0F0F1A]">$10<span className="text-xs text-[#6B7280]">/d</span></span>
                          </div>
                          <p className="text-xs text-[#6B7280] mb-3">Collision waiver with capped $500 excess.</p>
                          <ul className="text-xs text-[#0F0F1A] space-y-1.5">
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> $500 Capped Deductible</li>
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> Collision Damage Waiver</li>
                            <li className="flex items-center gap-1.5 text-[#9CA3AF]"><span className="material-symbols-outlined text-[16px]">close</span> Glass/Rim Excluded</li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0F0F1A]">{protection === "standard" ? "Selected" : "Select Tier"}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${protection === "standard" ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB]"}`}>
                            {protection === "standard" && "✓"}
                          </span>
                        </div>
                      </div>

                      {/* Basic Tier */}
                      <div
                        onClick={() => setProtection("basic")}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          protection === "basic"
                            ? "border-[#3730A3] bg-[#EEEDF9]/40 shadow-md ring-1 ring-[#3730A3]"
                            : "border-[#E5E7EB] bg-white hover:border-[#3730A3]/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-base text-[#0F0F1A]">Basic Statutory</span>
                            <span className="text-xl font-extrabold text-[#0F0F1A]">$0<span className="text-xs text-[#6B7280]">/d</span></span>
                          </div>
                          <p className="text-xs text-[#6B7280] mb-3">State minimum liability; personal insurance pays.</p>
                          <ul className="text-xs text-[#0F0F1A] space-y-1.5">
                            <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span> Statutory Liability</li>
                            <li className="flex items-center gap-1.5 text-amber-600 font-semibold"><span className="material-symbols-outlined text-[16px]">info</span> $2,000 Hold at Counter</li>
                            <li className="flex items-center gap-1.5 text-[#9CA3AF]"><span className="material-symbols-outlined text-[16px]">close</span> No Windshield Coverage</li>
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0F0F1A]">{protection === "basic" ? "Selected" : "Select Tier"}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${protection === "basic" ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB]"}`}>
                            {protection === "basic" && "✓"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Travel Add-ons (Stitch Step 1) */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-4">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Convenience Upgrades</span>
                      <h3 className="text-2xl font-bold text-[#0F0F1A]">Essential Travel Add-Ons</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                      {ADDONS.map((addon) => {
                        const isChecked = selectedAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                              isChecked
                                ? "bg-[#EEEDF9]/30 border-[#3730A3]"
                                : "bg-[#F8F8FB] border-[#E5E7EB] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isChecked ? "bg-[#3730A3] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"}`}>
                                <span className="material-symbols-outlined text-[22px]">{addon.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-[#0F0F1A]">{addon.title}</h4>
                                <p className="text-xs text-[#6B7280]">{addon.subtitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="font-extrabold text-sm text-[#0F0F1A]">
                                {addon.flatPrice !== undefined
                                  ? addon.flatPrice === 0
                                    ? "FREE"
                                    : `$${addon.flatPrice} flat`
                                  : `$${addon.pricePerDay}/day`}
                              </span>
                              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${isChecked ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB] bg-white"}`}>
                                {isChecked && <span className="text-xs font-bold">✓</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-14 px-8 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <span>Continue to Driver Details</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========== STEP 2: DRIVER DETAILS ========== */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-8">
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Step 2 of 4</span>
                      <h2 className="text-2xl font-bold text-[#0F0F1A]">Legal Driver Profile</h2>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Must match the government-issued photo driver&apos;s license presented upon key handover.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={driver.firstName}
                          onChange={(e) => setDriver({ ...driver, firstName: e.target.value })}
                          placeholder="Julian"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={driver.lastName}
                          onChange={(e) => setDriver({ ...driver, lastName: e.target.value })}
                          placeholder="Vance"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={driver.email}
                          onChange={(e) => setDriver({ ...driver, email: e.target.value })}
                          placeholder="julian.vance@example.com"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={driver.phone}
                          onChange={(e) => setDriver({ ...driver, phone: e.target.value })}
                          placeholder="(415) 555-0192"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Date of Birth (25+ Age Tier) *
                        </label>
                        <input
                          type="date"
                          value={driver.dob}
                          onChange={(e) => setDriver({ ...driver, dob: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={driver.address}
                          onChange={(e) => setDriver({ ...driver, address: e.target.value })}
                          placeholder="1842 Pacific Heights"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Driver's License Details */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Identity Verification</span>
                      <h3 className="text-2xl font-bold text-[#0F0F1A]">Driver&apos;s License & Verification</h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Encrypted and processed instantly to enable contactless Express Pass handover.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          License Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={driver.licenseNumber}
                          onChange={(e) => setDriver({ ...driver, licenseNumber: e.target.value })}
                          placeholder="D9482104"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Issuing State / Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={driver.licenseState}
                          onChange={(e) => setDriver({ ...driver, licenseState: e.target.value })}
                          placeholder="California"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Expiration Date *
                        </label>
                        <input
                          type="date"
                          value={driver.licenseExpiry}
                          onChange={(e) => setDriver({ ...driver, licenseExpiry: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flight & Arrival Tracking */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Flight Monitoring (Optional)</span>
                      <h3 className="text-2xl font-bold text-[#0F0F1A]">Flight & Arrival Tracking</h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        We monitor flight delays in real-time and hold your vehicle at no additional charge.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Airline Carrier
                        </label>
                        <input
                          type="text"
                          value={driver.flightCarrier}
                          onChange={(e) => setDriver({ ...driver, flightCarrier: e.target.value })}
                          placeholder="United Airlines"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Flight Number
                        </label>
                        <input
                          type="text"
                          value={driver.flightNumber}
                          onChange={(e) => setDriver({ ...driver, flightNumber: e.target.value })}
                          placeholder="UA 1482"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="h-12 px-6 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-bold text-xs hover:bg-[#F8F8FB] transition-colors"
                    >
                      ← Back to Protection
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!driver.firstName || !driver.lastName || !driver.email) {
                          setSubmissionError("Please fill in the required driver name and email.");
                          return;
                        }
                        setSubmissionError("");
                        setCurrentStep(3);
                      }}
                      className="h-14 px-8 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <span>Continue to Payment & Guarantee</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========== STEP 3: PAYMENT & GUARANTEE ========== */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-8">
                  {/* Payment Schedule Selector (Online vs Counter) */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
                    <div>
                      <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Step 3 of 4</span>
                      <h2 className="text-2xl font-bold text-[#0F0F1A]">Payment Schedule</h2>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Choose how and when you prefer your reservation to be charged.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pay Online */}
                      <div
                        onClick={() => setPaySchedule("online")}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                          paySchedule === "online"
                            ? "border-[#3730A3] bg-[#EEEDF9]/40 shadow-md ring-1 ring-[#3730A3]"
                            : "border-[#E5E7EB] bg-white hover:border-[#3730A3]/50"
                        }`}
                      >
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                          Save 5% Online
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base text-[#0F0F1A]">Pay Online Now</span>
                          </div>
                          <p className="text-xs text-[#6B7280] leading-relaxed">
                            Lock in guaranteed discounted rate with complimentary express keyless lane pass.
                          </p>
                          <div className="mt-3">
                            <span className="text-2xl font-extrabold text-[#3730A3]">${dueToday}</span>
                            <span className="text-xs text-[#6B7280]"> total charged today</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold">
                          <span>{paySchedule === "online" ? "Selected Option" : "Select Option"}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${paySchedule === "online" ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB]"}`}>
                            {paySchedule === "online" && "✓"}
                          </span>
                        </div>
                      </div>

                      {/* Pay at Counter */}
                      <div
                        onClick={() => setPaySchedule("counter")}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          paySchedule === "counter"
                            ? "border-[#3730A3] bg-[#EEEDF9]/40 shadow-md ring-1 ring-[#3730A3]"
                            : "border-[#E5E7EB] bg-white hover:border-[#3730A3]/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-base text-[#0F0F1A]">Pay at Counter</span>
                          </div>
                          <p className="text-xs text-[#6B7280] leading-relaxed">
                            Hold vehicle today with credit pre-authorization. Full payment charged upon pickup.
                          </p>
                          <div className="mt-3">
                            <span className="text-2xl font-extrabold text-[#0F0F1A]">$0.00</span>
                            <span className="text-xs text-[#6B7280]"> due today (${dueAtCounter} at desk)</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold">
                          <span>{paySchedule === "counter" ? "Selected Option" : "Select Option"}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${paySchedule === "counter" ? "bg-[#3730A3] border-[#3730A3] text-white" : "border-[#E5E7EB]"}`}>
                            {paySchedule === "counter" && "✓"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Tokenization Fields */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider">Secure Payment</span>
                        <h3 className="text-2xl font-bold text-[#0F0F1A]">Billing Method</h3>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F2F8] text-xs font-bold text-[#6B7280]">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
                        256-Bit SSL Encrypted
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Cardholder Full Name
                        </label>
                        <input
                          type="text"
                          value={cardData.cardholder}
                          onChange={(e) => setCardData({ ...cardData, cardholder: e.target.value })}
                          placeholder="Julian Vance"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                          placeholder="4111 2222 3333 4444"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="09/28"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full h-12 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                        />
                      </div>
                    </div>

                    {/* Master Agreement Checkbox */}
                    <label className="flex items-start gap-3 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardData.termsAccepted}
                        onChange={(e) => setCardData({ ...cardData, termsAccepted: e.target.checked })}
                        className="mt-1 w-4 h-4 text-[#3730A3] rounded border-[#E5E7EB] focus:ring-[#3730A3]"
                      />
                      <span className="text-xs text-[#6B7280] leading-relaxed">
                        I acknowledge the RideList Master Rental Agreement, the chosen Loss & Damage Protection tier, and authorize RideList to secure this reservation. Free cancellation is honored up to 48 hours before pickup.
                      </span>
                    </label>
                  </div>

                  {/* Step Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-12 px-6 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-bold text-xs hover:bg-[#F8F8FB] transition-colors"
                    >
                      ← Back to Driver Details
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmReservation}
                      className="h-14 px-8 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Reservation...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>Authorize & Confirm Reservation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Reservation Summary (4 Cols) */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E7EB] shadow-md flex flex-col gap-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Reservation Summary</span>
                    <h3 className="text-lg font-extrabold text-[#0F0F1A]">
                      {car.make} {car.model}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EEEDF9] text-[#3730A3] text-xs font-bold">
                    {totalDays} {totalDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                {/* Itinerary Snippet */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3730A3] shrink-0 mt-0.5">location_on</span>
                    <div>
                      <span className="font-bold text-[#0F0F1A] block">Pick-up Station</span>
                      <p className="text-[#6B7280]">{pickupLocation}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{pickupDate} • {pickupTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3730A3] shrink-0 mt-0.5">flag</span>
                    <div>
                      <span className="font-bold text-[#0F0F1A] block">Return Station</span>
                      <p className="text-[#6B7280]">{dropoffLocation}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{returnDate} • {returnTime}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-[#E5E7EB] space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Vehicle Rate (${car.price_per_day} × {totalDays}d)</span>
                    <span className="font-semibold text-[#0F0F1A]">${vehicleSubtotal}</span>
                  </div>

                  <div className="flex justify-between text-[#6B7280]">
                    <span className="capitalize">{protection} Protection (${protectionDailyRate}/d)</span>
                    <span className="font-semibold text-[#0F0F1A]">${protectionSubtotal}</span>
                  </div>

                  {addonsSubtotal > 0 && (
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Add-ons ({selectedAddons.length} active)</span>
                      <span className="font-semibold text-[#0F0F1A]">${addonsSubtotal}</span>
                    </div>
                  )}

                  {onlineDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Online Prep Discount (5%)</span>
                      <span>-${onlineDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6B7280]">
                    <span>Airport Fees & Taxes</span>
                    <span className="font-semibold text-[#0F0F1A]">${taxSubtotal}</span>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-extrabold text-[#0F0F1A] block">Total Estimated</span>
                      <span className="text-[11px] text-[#6B7280]">
                        {paySchedule === "online" ? "Charged in full today" : "Due upon pickup at desk"}
                      </span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#3730A3]">${totalEstimatedPrice}</span>
                  </div>
                </div>

                {/* Micro Assurance Card */}
                <div className="p-3.5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] text-[11px] text-[#6B7280] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0F0F1A]">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                    Zero Deposit Hold Guarantee
                  </div>
                  <p>Free cancellation up to 48 hours prior to scheduled pick-up.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
