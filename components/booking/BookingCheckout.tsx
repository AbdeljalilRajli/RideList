"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  RENTAL_LOCATIONS,
  BOOKING_EXTRAS,
  buildWhatsAppBookingUrl,
  LocationOption,
} from "@/constants/booking";

interface BookingCheckoutProps {
  car: CarProps;
  onClose: () => void;
  initialPickupDate?: string;
  initialReturnDate?: string;
  initialPickupLocation?: string;
}

export default function BookingCheckout({
  car,
  onClose,
  initialPickupDate,
  initialReturnDate,
  initialPickupLocation,
}: BookingCheckoutProps) {
  // Step state: 1 = Trip & Extras, 2 = Customer Info & Review, 3 = Confirmation / WhatsApp
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Today's formatted string (YYYY-MM-DD) for min date
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  }, []);

  // Trip Dates & Times
  const [pickupDate, setPickupDate] = useState(initialPickupDate || todayStr);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState(initialReturnDate || tomorrowStr);
  const [returnTime, setReturnTime] = useState("10:00");

  // Locations
  const [pickupPlaceId, setPickupPlaceId] = useState(
    initialPickupLocation || RENTAL_LOCATIONS[0].id
  );
  const [pickupCustomAddress, setPickupCustomAddress] = useState("");
  const [returnPlaceId, setReturnPlaceId] = useState(RENTAL_LOCATIONS[0].id);
  const [returnCustomAddress, setReturnCustomAddress] = useState("");

  // Extras selected (set of extra IDs)
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCountry, setCustomerCountry] = useState("Morocco");
  const [notes, setNotes] = useState("");

  // Spam protection honeypot
  const [honeypot, setHoneypot] = useState("");

  // Loading & Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user } = useAuth();

  // Pre-fill customer details if logged in
  useEffect(() => {
    if (user) {
      const name =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string);
      if (name && !customerName) {
        setCustomerName(name);
      }
      if (user.email && !customerEmail) {
        setCustomerEmail(user.email);
      }
    }
  }, [user]);

  // Created Booking state for Step 3
  const [createdBooking, setCreatedBooking] = useState<{
    referenceCode: string;
    totalPrice: number;
    depositAmount: number;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  // Selected Location objects
  const pickupLocation = useMemo(
    () => RENTAL_LOCATIONS.find((l) => l.id === pickupPlaceId) || RENTAL_LOCATIONS[0],
    [pickupPlaceId]
  );
  const returnLocation = useMemo(
    () => RENTAL_LOCATIONS.find((l) => l.id === returnPlaceId) || RENTAL_LOCATIONS[0],
    [returnPlaceId]
  );

  // Duration in days (minimum 1 day)
  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(`${pickupDate}T${pickupTime || "00:00"}`);
    const end = new Date(`${returnDate}T${returnTime || "00:00"}`);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  // Pricing calculations (Moroccan Dirham)
  const baseRentalPrice = useMemo(() => {
    return (car.price_per_day || 500) * rentalDays;
  }, [car.price_per_day, rentalDays]);

  const deliveryFee = useMemo(() => {
    return (pickupLocation.fee || 0) + (returnLocation.fee || 0);
  }, [pickupLocation.fee, returnLocation.fee]);

  const selectedExtrasData = useMemo(() => {
    return BOOKING_EXTRAS.filter((e) => selectedExtraIds.includes(e.id)).map((e) => {
      const cost = e.perDay ? e.price * rentalDays : e.price;
      return {
        id: e.id,
        name: e.name,
        price: e.price,
        per_day: e.perDay,
        cost,
      };
    });
  }, [selectedExtraIds, rentalDays]);

  const extrasTotalPrice = useMemo(() => {
    return selectedExtrasData.reduce((acc, curr) => acc + curr.cost, 0);
  }, [selectedExtrasData]);

  const estimatedTotal = useMemo(() => {
    return baseRentalPrice + deliveryFee + extrasTotalPrice;
  }, [baseRentalPrice, deliveryFee, extrasTotalPrice]);

  const depositAmount = car.deposit_amount ?? 3000;
  const carImage = getCarImage(car);

  // Toggle Extra
  const toggleExtra = (extraId: string) => {
    setSelectedExtraIds((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  };

  // Step 1 Validation & Proceed
  const handleProceedToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (returnDate < pickupDate) {
      setErrorMessage("Return date must be equal to or after pickup date.");
      return;
    }

    if (pickupLocation.requiresAddress && !pickupCustomAddress.trim()) {
      setErrorMessage("Please enter your hotel name or delivery address.");
      return;
    }

    if (returnLocation.requiresAddress && !returnCustomAddress.trim()) {
      setErrorMessage("Please enter your return hotel name or address.");
      return;
    }

    setStep(2);
  };

  // Step 2 Submit Booking Request
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Spam check
    if (honeypot) {
      // Silently dismiss bot
      onClose();
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage("Please enter a valid phone number (WhatsApp enabled).");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ensure target vehicle ID is a valid UUID
      let targetCarId = car.id;
      const isUuid =
        targetCarId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          targetCarId
        );

      if (!isUuid) {
        // Look up car in Supabase by make and model as robust fallback
        const { data: dbCar } = await supabase
          .from("cars")
          .select("id, price_per_day, deposit_amount")
          .ilike("make", car.make)
          .ilike("model", car.model)
          .limit(1)
          .maybeSingle();

        if (dbCar?.id) {
          targetCarId = dbCar.id;
        } else {
          throw new Error(
            "Vehicle ID could not be verified with our fleet. Please refresh the page and select the vehicle again."
          );
        }
      }

      // 2. Call secure Supabase RPC 'create_booking' (SECURITY DEFINER)
      // Handles both guests and logged-in users, calculates pricing server-side,
      // and returns reference_code, total_price, deposit_amount
      const { data, error } = await supabase.rpc("create_booking", {
        p_car_id: targetCarId,
        p_pickup_date: pickupDate,
        p_pickup_time: pickupTime,
        p_return_date: returnDate,
        p_return_time: returnTime,
        p_pickup_place: pickupLocation.name,
        p_return_place: returnLocation.name,
        p_customer_name: customerName.trim(),
        p_customer_phone: customerPhone.trim(),
        p_customer_email: customerEmail.trim() || null,
        p_customer_country: customerCountry.trim() || "Morocco",
        p_pickup_address: pickupLocation.requiresAddress
          ? pickupCustomAddress.trim()
          : null,
        p_return_address: returnLocation.requiresAddress
          ? returnCustomAddress.trim()
          : null,
        p_extras: selectedExtrasData,
        p_notes: notes.trim() || null,
      });

      if (error) {
        throw new Error(error.message || "Failed to submit booking request.");
      }

      // Handle RPC return table (array of rows or single row)
      const bookingResult = Array.isArray(data) ? data[0] : data;
      if (!bookingResult || !bookingResult.reference_code) {
        throw new Error("Invalid response received from server.");
      }

      setCreatedBooking({
        referenceCode: bookingResult.reference_code,
        totalPrice: Number(bookingResult.total_price),
        depositAmount: Number(bookingResult.deposit_amount),
      });

      setStep(3);
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMessage(
        err.message ||
          "Could not submit reservation. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdBooking?.referenceCode) {
      navigator.clipboard.writeText(createdBooking.referenceCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  return (
    <div className="flex flex-col max-h-[90vh] bg-white text-black font-['Work_Sans',sans-serif]">
      {/* Top Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center font-bold text-sm">
            {step === 3 ? "✓" : `${step}/2`}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-black tracking-tight">
              {step === 3
                ? "Booking Request Confirmed!"
                : step === 2
                ? "Customer Details & Summary"
                : `Book ${car.make} ${car.model}`}
            </h2>
            <p className="text-xs text-[#6C757D]">
              {step === 3
                ? "Save your reference code or confirm immediately on WhatsApp."
                : "Fast reservation • No credit card required • Pay at pickup"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="w-9 h-9 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Body */}
      <div className="overflow-y-auto flex-1 p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold leading-relaxed flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: TRIP DATES, LOCATIONS & EXTRAS
           ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToCustomer} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Dates, Locations & Extras */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Dates & Times */}
                <div className="bg-[#F8F8FB] rounded-2xl p-5 border border-[#E5E7EB]">
                  <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5937E0]"></span>
                    Rental Dates & Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pickup Date */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Pickup Time */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Pickup Time
                      </label>
                      <input
                        type="time"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Return Date */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Return Date
                      </label>
                      <input
                        type="date"
                        required
                        min={pickupDate || todayStr}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Return Time */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Return Time
                      </label>
                      <input
                        type="time"
                        required
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                      Duration: {rentalDays} {rentalDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>

                {/* 2. Pickup & Return Locations */}
                <div className="bg-[#F8F8FB] rounded-2xl p-5 border border-[#E5E7EB] space-y-4">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5937E0]"></span>
                    Pickup & Return Location in Morocco
                  </h3>

                  {/* Pickup Place */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                      Pickup Place
                    </label>
                    <select
                      value={pickupPlaceId}
                      onChange={(e) => setPickupPlaceId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                    >
                      {RENTAL_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.fee > 0 ? `(+${loc.fee} DH)` : "(Free)"}
                        </option>
                      ))}
                    </select>

                    {pickupLocation.requiresAddress && (
                      <input
                        type="text"
                        required
                        placeholder="Enter your hotel name, riad or address in Morocco *"
                        value={pickupCustomAddress}
                        onChange={(e) => setPickupCustomAddress(e.target.value)}
                        className="w-full h-11 mt-2 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    )}
                  </div>

                  {/* Return Place */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                      Return Place
                    </label>
                    <select
                      value={returnPlaceId}
                      onChange={(e) => setReturnPlaceId(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                    >
                      {RENTAL_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.fee > 0 ? `(+${loc.fee} DH)` : "(Free)"}
                        </option>
                      ))}
                    </select>

                    {returnLocation.requiresAddress && (
                      <input
                        type="text"
                        required
                        placeholder="Enter return hotel name or address in Morocco *"
                        value={returnCustomAddress}
                        onChange={(e) => setReturnCustomAddress(e.target.value)}
                        className="w-full h-11 mt-2 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Insurance Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Basic Insurance Included
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      Comprehensive collision & third-party liability coverage included at no extra cost. Zero excess upgrade available at car handover if requested.
                    </p>
                  </div>
                </div>

                {/* 4. Optional Extras */}
                <div>
                  <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5937E0]"></span>
                    Optional Extras & Accessories
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BOOKING_EXTRAS.map((extra) => {
                      const isSelected = selectedExtraIds.includes(extra.id);
                      return (
                        <div
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#5937E0] bg-[#EEEDF9]/40 shadow-xs"
                              : "border-[#E5E7EB] bg-white hover:border-[#5937E0]/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-black">{extra.name}</span>
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-[#5937E0] border-[#5937E0] text-white"
                                  : "border-[#E5E7EB] bg-white text-transparent"
                              }`}
                            >
                              ✓
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6C757D] leading-tight mb-2">
                            {extra.description}
                          </p>
                          <div className="text-xs font-bold text-[#5937E0]">
                            +{extra.price} DH {extra.perDay ? "/day" : "flat"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Summary Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#F8F8FB] rounded-2xl border border-[#E5E7EB] p-6 sticky top-4 space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB]">
                    <div className="relative w-24 h-16 rounded-xl bg-white overflow-hidden shrink-0 border border-[#E5E7EB]">
                      <Image
                        src={carImage}
                        alt={`${car.make} ${car.model}`}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-black">
                        {car.make} {car.model}
                      </h4>
                      <p className="text-xs text-[#6C757D]">
                        {car.year} • {car.transmission === "a" ? "Automatic" : "Manual"} • {car.fuel_type}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-[#5937E0]">
                        {car.km_policy || "Unlimited km"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6C757D]">
                        Base Rental ({car.price_per_day} DH × {rentalDays} {rentalDays === 1 ? "day" : "days"})
                      </span>
                      <span className="font-bold text-black">{baseRentalPrice} DH</span>
                    </div>

                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#6C757D]">Pickup & Return Delivery</span>
                        <span className="font-bold text-black">+{deliveryFee} DH</span>
                      </div>
                    )}

                    {selectedExtrasData.map((e) => (
                      <div key={e.id} className="flex justify-between">
                        <span className="text-[#6C757D]">
                          {e.name} {e.per_day ? `(${e.price} × ${rentalDays}d)` : ""}
                        </span>
                        <span className="font-bold text-black">+{e.cost} DH</span>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-bold text-black block">Total Amount</span>
                        <span className="text-[11px] text-[#10B981] font-semibold">Pay upon delivery</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-[#5937E0] block">
                          {estimatedTotal} DH
                        </span>
                        <span className="text-[10px] text-[#6C757D]">All Moroccan taxes included</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Deposit Caution Notice */}
                  <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black">Security Deposit (Caution):</span>
                      <span className="font-extrabold text-black">{depositAmount} DH</span>
                    </div>
                    <p className="text-[11px] text-[#6C757D] mt-1 leading-tight">
                      Blocked at car handover (card or cash) and refunded upon return.
                    </p>
                  </div>

                  {/* Submit / Next Button */}
                  <button
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Customer Details</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 2: CUSTOMER DETAILS, POLICIES & CONFIRMATION
           ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleSubmitBooking} className="space-y-8">
            {/* Honeypot for spam bots (hidden) */}
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Customer Form */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#F8F8FB] rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5937E0]"></span>
                    Primary Driver Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Full Name (as in Passport/ID) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Youssef El Amrani"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* WhatsApp Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+212 6 12 34 56 78"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Country of Residence */}
                    <div>
                      <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                        Country of Residence
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Morocco, France, Spain"
                        value={customerCountry}
                        onChange={(e) => setCustomerCountry(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>
                  </div>

                  {/* Flight number / Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6C757D] mb-1">
                      Flight Number / Special Delivery Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Flight AT 204 arriving at 14:30, please meet us outside Terminal 2."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] text-[16px] sm:text-xs text-black focus:outline-none focus:border-[#5937E0] min-h-[44px]"
                    ></textarea>
                  </div>
                </div>

                {/* Important Rental Handover Rules */}
                <div className="bg-[#FFFBEB] rounded-2xl p-5 border border-[#FDE68A] text-[#92400E] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#78350F]">
                    <svg className="w-4 h-4 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Handover Requirements in Morocco</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      <strong>Original Documents:</strong> Please bring your original valid Driving Licence and Passport or National ID card. No documents are uploaded online.
                    </li>
                    <li>
                      <strong>Payment:</strong> 100% paid at vehicle handover (Cash in Moroccan Dirham or Credit/Debit card).
                    </li>
                    <li>
                      <strong>Deposit (Caution):</strong> {depositAmount} DH authorized at delivery and released upon vehicle return.
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-[#F8F8FB]"
                  >
                    ← Back to Trip Details
                  </button>
                </div>
              </div>

              {/* Right Column: Order Confirmation Box */}
              <div className="lg:col-span-5">
                <div className="bg-[#F8F8FB] rounded-2xl border border-[#E5E7EB] p-6 space-y-5">
                  <h4 className="text-sm font-bold text-black border-b border-[#E5E7EB] pb-3">
                    Reservation Summary
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[#6C757D] block">Vehicle:</span>
                      <span className="font-bold text-black text-sm">
                        {car.make} {car.model} ({car.year})
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6C757D] block">Pickup:</span>
                      <span className="font-bold text-black">
                        {pickupDate} at {pickupTime}
                      </span>
                      <span className="text-[11px] text-[#6C757D] block">
                        {pickupLocation.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6C757D] block">Return:</span>
                      <span className="font-bold text-black">
                        {returnDate} at {returnTime}
                      </span>
                      <span className="text-[11px] text-[#6C757D] block">
                        {returnLocation.name}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] flex justify-between items-baseline">
                      <span className="text-sm font-bold text-black">Total to pay on delivery</span>
                      <span className="text-2xl font-extrabold text-[#5937E0]">
                        {estimatedTotal} DH
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Booking Request</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 3: SUCCESS & CONFIRM ON WHATSAPP
           ========================================================================= */}
        {step === 3 && createdBooking && (
          <div className="max-w-xl mx-auto py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider block mb-1">
                Request Registered • Pending Confirmation
              </span>
              <h3 className="text-2xl font-extrabold text-black font-['Work_Sans',sans-serif]">
                Thank you, {customerName}!
              </h3>
              <p className="text-xs text-[#6C757D] max-w-md mx-auto mt-1">
                Your reservation request for the <strong className="text-black">{car.make} {car.model}</strong> has been saved.
              </p>
            </div>

            {/* Reference Code Card */}
            <div className="bg-[#EEEDF9] border-2 border-[#5937E0] rounded-2xl p-5 max-w-sm mx-auto">
              <span className="text-xs font-semibold text-[#5937E0] block mb-1">
                Your Booking Reference Code
              </span>
              <div className="text-2xl font-black text-[#5937E0] tracking-wider mb-2">
                {createdBooking.referenceCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-1.5 rounded-full bg-white text-xs font-bold text-[#5937E0] hover:bg-purple-50 transition-all border border-[#5937E0]/20 shadow-2xs"
              >
                {copiedCode ? "✓ Copied to clipboard" : "Copy Reference Code"}
              </button>
            </div>

            {/* Total and Deposit Info */}
            <div className="p-4 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-[#0F0F1A] max-w-sm mx-auto flex justify-around">
              <div>
                <span className="text-[#6C757D] block">Total to Pay</span>
                <span className="font-extrabold text-black text-sm">
                  {createdBooking.totalPrice} DH
                </span>
              </div>
              <div className="border-r border-[#E5E7EB]"></div>
              <div>
                <span className="text-[#6C757D] block">Deposit (Caution)</span>
                <span className="font-extrabold text-black text-sm">
                  {createdBooking.depositAmount} DH
                </span>
              </div>
            </div>

            {/* Big Green WhatsApp Button */}
            <div className="pt-2">
              <a
                href={buildWhatsAppBookingUrl({
                  referenceCode: createdBooking.referenceCode,
                  carMake: car.make,
                  carModel: car.model,
                  carYear: car.year,
                  pickupDate,
                  pickupTime,
                  pickupPlace: pickupLocation.name,
                  returnDate,
                  returnTime,
                  returnPlace: returnLocation.name,
                  totalPrice: createdBooking.totalPrice,
                  depositAmount: createdBooking.depositAmount,
                  customerName,
                  customerPhone,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.178 1.564 5.926l-1.636 5.975 6.136-1.609c1.704.931 3.659 1.469 5.736 1.469 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
                <span>Confirm on WhatsApp</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-xs">
              <Link
                href={`/track?ref=${encodeURIComponent(createdBooking.referenceCode)}&contact=${encodeURIComponent(customerPhone)}`}
                className="text-[#5937E0] font-bold hover:underline"
              >
                Track this booking online →
              </Link>
              <span className="hidden sm:inline text-[#E5E7EB]">•</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#6C757D] font-bold hover:text-black"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
