"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { getCarImage, getCasablancaToday, formatDayMonth } from "@/lib/utils";
import { normalizeFuel, normalizeTransmission, formatBodyType, formatSegment } from "@/lib/carTaxonomy";
import { supabase } from "@/lib/supabase";
import BookingForm from "@/components/BookingForm";
import CarCard from "@/components/CarCard";

export default function CarDetailClient({ car }: { car: CarProps }) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  // Load unavailable confirmed date ranges for this car
  const [unavailableRanges, setUnavailableRanges] = useState<
    { pickup_date: string; return_date: string }[]
  >([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadRanges() {
      let carId = car.id;
      const isUuid =
        carId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          carId
        );
      if (!isUuid) {
        const { data: dbCar } = await supabase
          .from("cars")
          .select("id")
          .ilike("make", car.make)
          .ilike("model", car.model)
          .limit(1)
          .maybeSingle();
        if (dbCar?.id) carId = dbCar.id;
      }
      if (!carId) return;

      try {
        const { data, error } = await supabase.rpc("get_unavailable_ranges", {
          p_car_id: carId,
        });
        if (!error && data && !isCancelled) {
          setUnavailableRanges(data);
        }
      } catch (err) {
        console.error("Failed to load car unavailable ranges:", err);
      }
    }
    loadRanges();
    return () => {
      isCancelled = true;
    };
  }, [car.id, car.make, car.model]);

  const casablancaToday = getCasablancaToday();
  const activeBookingToday = unavailableRanges.find(
    (r) => r.pickup_date <= casablancaToday && r.return_date >= casablancaToday
  );
  const rentedUntil = activeBookingToday?.return_date;
  const isMaintenance = car.status === "maintenance";

  const relatedCars: CarProps[] = useMemo(() => {
    if (!car) return [];
    return (cars as CarProps[]).filter((c) => c.make !== car.make).slice(0, 3);
  }, [car]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const mainCarImage = getCarImage(car);
  const galleryImages =
    car.images && car.images.length > 0
      ? car.images
      : [mainCarImage, mainCarImage, mainCarImage];

  return (
    <main className="w-full pt-[104px] bg-[#F8F8FB] text-[#000000] min-h-screen pb-24">
      {/* 1. Contextual Strip with Breadcrumbs */}
      <section className="w-full bg-white border-b border-[#E5E7EB] py-6">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-[#6C757D]">
            <Link href="/" className="hover:text-[#5937E0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">
              Fleet
            </Link>
            <span>/</span>
            <span className="text-[#000000] font-bold">
              {car.make} {car.model}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {isMaintenance ? (
              <div className="px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                Unavailable
              </div>
            ) : rentedUntil ? (
              <div className="px-3.5 py-1.5 rounded-full bg-[#181524] text-white text-xs font-bold">
                Back on {formatDayMonth(rentedUntil)}
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Available Now
              </div>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-[#F8F8FB] text-xs font-bold text-[#000000] hover:bg-[#EEEDF9] transition-all cursor-pointer"
            >
              {copiedShare ? "Link Copied!" : "Share Vehicle"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Primary Showcase Section */}
      <section className="w-full py-10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Image stage & Thumbnail Gallery */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm relative overflow-hidden flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 shrink-0">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#5937E0] uppercase tracking-wider block mb-1">
                      {car.class || "Sedan"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#000000] tracking-tight break-words">
                      {car.make} {car.model}
                    </h1>
                    {/* Mobile stacked price under title */}
                    <div className="flex items-baseline gap-2 mt-2 sm:hidden">
                      <span className="text-2xl font-extrabold text-[#FFA000] whitespace-nowrap">
                        {car.price_per_day} DH
                      </span>
                      <span className="text-xs text-[#6C757D] whitespace-nowrap font-medium">per day</span>
                    </div>
                  </div>
                  {/* Desktop right-aligned price */}
                  <div className="hidden sm:block text-right shrink-0">
                    <span className="text-3xl font-extrabold text-[#FFA000] block whitespace-nowrap">
                      {car.price_per_day} DH
                    </span>
                    <span className="text-xs text-[#6C757D] whitespace-nowrap">per day</span>
                  </div>
                </div>

                {/* Main Image Stage - Grows to fill remaining height on desktop/tablet, natural height on mobile */}
                <div className="relative w-full h-[320px] sm:h-[400px] lg:h-auto lg:flex-1 lg:min-h-[340px] bg-[#F8F8FB] rounded-2xl flex items-center justify-center p-6 my-4">
                  <Image
                    src={galleryImages[activeThumb] || mainCarImage}
                    alt={`${car.make} ${car.model}`}
                    fill
                    priority
                    className="object-contain p-4 transition-transform duration-500"
                  />
                </div>

                {/* Thumbnail Angles - Anchored to bottom */}
                <div className="grid grid-cols-3 gap-4 pt-2 shrink-0 mt-auto">
                  {galleryImages.slice(0, 3).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveThumb(idx)}
                      className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all p-2 bg-[#F8F8FB] cursor-pointer ${
                        activeThumb === idx ? "border-[#5937E0] shadow-md" : "border-[#E5E7EB] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Technical Specifications & Rent a car Button */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm flex flex-col h-full">
                <h2 className="text-xl font-bold text-[#000000] mb-6">
                  Technical Specification
                </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {car.body_type && (
                  <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                    <span className="text-xs text-[#6C757D] block mb-1">Body Type</span>
                    <span className="text-sm font-bold text-[#000000]">
                      {formatBodyType(car.body_type)}
                    </span>
                  </div>
                )}
                {car.segment && (
                  <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                    <span className="text-xs text-[#6C757D] block mb-1">Vehicle Segment</span>
                    <span className="text-sm font-bold text-[#000000]">
                      {formatSegment(car.segment)}
                    </span>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Gearbox</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {normalizeTransmission(car.transmission)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Fuel Type</span>
                  <span className="text-sm font-bold text-[#000000] capitalize">
                    {normalizeFuel(car.fuel_type)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Passengers</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {car.seats || 5} Seats
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Mileage Policy</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {car.km_policy || "Unlimited"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Security Deposit</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {car.deposit_amount ? `${car.deposit_amount} DH` : "3,000 DH"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Model Year</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {car.year}
                  </span>
                </div>
              </div>

              {/* Main CTA: Rent a car or Unavailable state */}
              {isMaintenance ? (
                <div className="mb-8 p-4 rounded-2xl bg-[#F1F1F6] border border-[#E5E7EB] text-center">
                  <span className="block text-sm font-bold text-black mb-1">
                    Currently Unavailable
                  </span>
                  <p className="text-xs text-[#6C757D] mb-3">
                    This vehicle is currently undergoing maintenance and unavailable for booking.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-bold text-xs transition-all shadow-sm"
                  >
                    Browse Available Fleet →
                  </Link>
                </div>
              ) : (
                <div className="mb-8 space-y-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full h-14 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-bold text-base shadow-[0_8px_24px_rgba(89,55,224,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                  >
                    <span>Rent a car</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  {rentedUntil && (
                    <p className="text-center text-xs text-[#6C757D]">
                      Currently on the road · Returns on <strong>{formatDayMonth(rentedUntil)}</strong> (bookable for other dates)
                    </p>
                  )}
                </div>
              )}

              {/* Car Equipment & Features Checklist */}
              <div className="pt-6 border-t border-[#E5E7EB]">
                <h3 className="text-base font-bold text-[#000000] mb-4">
                  Car Equipment & Comfort
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#000000]">
                  {[
                    "Air Conditioning",
                    "Bluetooth & USB",
                    "GPS Navigation",
                    "Keyless Entry",
                    "Cruise Control",
                    "Parking Sensors",
                    "Heated Seats",
                    "Apple CarPlay / Android Auto",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#5937E0] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* 3. Related Vehicles Section */}
      <section className="w-full mt-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#5937E0] uppercase tracking-wider block mb-1">
                Explore More
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
                Choose the car that suits you
              </h2>
            </div>
            <Link
              href="/fleet"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5937E0] hover:underline whitespace-nowrap"
            >
              <span>View all cars</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedCars.map((related, idx) => (
              <CarCard key={related.id || `${related.make}-${related.model}-${idx}`} car={related} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <BookingForm
          car={car}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </main>
  );
}
