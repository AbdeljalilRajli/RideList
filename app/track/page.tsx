"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAgencyWhatsAppNumber } from "@/constants/booking";

interface TrackedBooking {
  reference_code: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_image: string;
  car_transmission: string;
  car_fuel_type: string;
  car_km_policy: string;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  return_time: string;
  pickup_place: string;
  return_place: string;
  pickup_address: string | null;
  return_address: string | null;
  extras: any[];
  delivery_fee: number;
  total_price: number;
  deposit_amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  customer_name: string;
  customer_phone: string;
  created_at: string;
}

function TrackBookingContent() {
  const searchParams = useSearchParams();

  const [referenceCode, setReferenceCode] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-fill from query params if coming from booking confirmation
  useEffect(() => {
    const qRef = searchParams.get("ref");
    const qContact = searchParams.get("contact");

    if (qRef) setReferenceCode(qRef);
    if (qContact) setContact(qContact);

    if (qRef && qContact) {
      executeTrack(qRef, qContact);
    }
  }, [searchParams]);

  const executeTrack = async (refVal: string, contactVal: string) => {
    setLoading(true);
    setErrorMessage(null);
    setHasSearched(true);
    setBooking(null);

    try {
      // Call secure Supabase RPC function (SECURITY DEFINER)
      const { data, error } = await supabase.rpc("track_booking", {
        p_reference_code: refVal.trim().toUpperCase(),
        p_contact: contactVal.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        setErrorMessage(
          "No booking found matching this reference code and contact. Please check your reference code (e.g. RL-XXXXXX) and your phone number or email."
        );
        return;
      }

      setBooking(data[0] as TrackedBooking);
    } catch (err: any) {
      console.error("Tracking error:", err);
      setErrorMessage(
        err.message || "An error occurred while tracking your reservation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim() || !contact.trim()) {
      setErrorMessage("Please enter both your Booking Reference Code and your Phone or Email.");
      return;
    }
    executeTrack(referenceCode, contact);
  };

  const agencyPhone = getAgencyWhatsAppNumber();

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-black pt-[140px] sm:pt-[160px] pb-24 px-4 sm:px-6 lg:px-8 font-['Work_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold uppercase tracking-wider mb-2">
            Morocco Rental Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight mb-2">
            Track My Reservation
          </h1>
          <p className="text-sm text-[#6C757D] max-w-md mx-auto">
            Check the real-time status of your vehicle booking using your reference code and phone or email.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 sm:p-8 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Booking Reference Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RL-A4B8C1"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-mono font-bold tracking-wider placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Phone (WhatsApp) or Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+212 6... or name@example.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching Reservation...</span>
                </>
              ) : (
                <span>Check Status</span>
              )}
            </button>
          </form>
        </div>

        {/* Error / Not Found Message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold leading-relaxed mb-8 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Booking Result Card */}
        {booking && (
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-lg overflow-hidden animate-fadeIn">
            {/* Status Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-[#F8F8FB]">
              <div>
                <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider block">
                  Reference Code
                </span>
                <span className="text-xl font-mono font-black text-[#5937E0]">
                  {booking.reference_code}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {booking.status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Review
                  </span>
                )}
                {booking.status === "confirmed" && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Confirmed & Scheduled
                  </span>
                )}
                {booking.status === "completed" && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Completed
                  </span>
                )}
                {(booking.status === "cancelled" || booking.status === "rejected") && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {booking.status === "cancelled" ? "Cancelled" : "Declined"}
                  </span>
                )}
              </div>
            </div>

            {/* Vehicle Preview Strip */}
            <div className="p-6 sm:p-8 border-b border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-24 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] overflow-hidden shrink-0">
                <Image
                  src={booking.car_image || "/logo-icon.png"}
                  alt={`${booking.car_make} ${booking.car_model}`}
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-extrabold text-black">
                  {booking.car_make} {booking.car_model} ({booking.car_year})
                </h3>
                <p className="text-xs text-[#6C757D] mt-1">
                  {booking.car_transmission === "a" ? "Automatic" : "Manual"} • {booking.car_fuel_type} • {booking.car_km_policy || "Unlimited km"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    ✓ Basic insurance included
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-[11px] font-bold">
                    Pay at pickup
                  </span>
                </div>
              </div>
            </div>

            {/* Itinerary & Financials */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Itinerary */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C757D]">
                  Itinerary & Schedule
                </h4>

                <div className="p-3.5 rounded-xl bg-[#F8F8FB] space-y-1">
                  <span className="text-[11px] font-bold text-[#5937E0] uppercase block">
                    Pickup
                  </span>
                  <p className="font-bold text-black text-sm">
                    {booking.pickup_date} at {booking.pickup_time}
                  </p>
                  <p className="text-[#6C757D]">{booking.pickup_place}</p>
                  {booking.pickup_address && (
                    <p className="text-[11px] text-[#0F0F1A] italic">
                      Address: {booking.pickup_address}
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F8FB] space-y-1">
                  <span className="text-[11px] font-bold text-[#5937E0] uppercase block">
                    Return
                  </span>
                  <p className="font-bold text-black text-sm">
                    {booking.return_date} at {booking.return_time}
                  </p>
                  <p className="text-[#6C757D]">{booking.return_place}</p>
                  {booking.return_address && (
                    <p className="text-[11px] text-[#0F0F1A] italic">
                      Address: {booking.return_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Client */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C757D]">
                  Pricing & Client Summary
                </h4>

                <div className="p-3.5 rounded-xl bg-[#F8F8FB] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">Customer:</span>
                    <span className="font-bold text-black">{booking.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">Phone:</span>
                    <span className="font-bold text-black">{booking.customer_phone}</span>
                  </div>
                  {booking.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6C757D]">Delivery Fee:</span>
                      <span className="font-bold text-black">+{booking.delivery_fee} DH</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-baseline">
                    <span className="font-bold text-black">Total to pay:</span>
                    <span className="text-xl font-extrabold text-[#5937E0]">
                      {booking.total_price} DH
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6C757D]">
                    <span>Deposit (Caution):</span>
                    <span className="font-bold text-black">{booking.deposit_amount} DH (reimbursed at return)</span>
                  </div>
                </div>

                {/* WhatsApp Assist */}
                <a
                  href={`https://wa.me/${agencyPhone}?text=${encodeURIComponent(
                    `Bonjour RideList! Concernant ma réservation ${booking.reference_code} (${booking.car_make} ${booking.car_model}), j'ai une question.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.178 1.564 5.926l-1.636 5.975 6.136-1.609c1.704.931 3.659 1.469 5.736 1.469 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                  </svg>
                  <span>Chat with Agency on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/fleet"
            className="text-xs font-bold text-[#6C757D] hover:text-[#5937E0] transition-colors"
          >
            ← Browse More Vehicles in Our Fleet
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function TrackBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center pt-24">
          <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackBookingContent />
    </Suspense>
  );
}
