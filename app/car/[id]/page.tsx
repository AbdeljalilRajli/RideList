"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import BookingForm from "@/components/BookingForm";
import CarCard from "@/components/CarCard";
import { supabase } from "@/lib/supabase";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Gallery active index
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    async function loadCar() {
      if (!params?.id) return;
      const carId = params.id as string;
      setLoading(true);

      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            carId
          );

        // 1. If valid UUID, query Supabase directly by id
        if (isUuid) {
          const { data, error } = await supabase
            .from("cars")
            .select("*")
            .eq("id", carId)
            .maybeSingle();

          if (data && !error) {
            setCar(data as CarProps);
            setLoading(false);
            return;
          }
        }

        // 2. Query all active cars from Supabase to match slug / make / model
        const { data: dbCars, error: dbError } = await supabase
          .from("cars")
          .select("*")
          .neq("status", "hidden");

        if (dbCars && !dbError && dbCars.length > 0) {
          // Check by computed slug match or make/model match
          const matchedCar = dbCars.find((c: any) => {
            const slugPrefix = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              c.id === carId ||
              carId.toLowerCase().startsWith(slugPrefix) ||
              (carId.toLowerCase().includes(c.make.toLowerCase()) &&
                carId.toLowerCase().includes(c.model.toLowerCase().replace(/\s+/g, "-")))
            );
          });

          if (matchedCar) {
            setCar(matchedCar as CarProps);
            setLoading(false);
            return;
          }
        }

        // 3. Fallback: check static cars (legacy slug match)
        for (let index = 0; index < cars.length; index++) {
          const c = cars[index];
          const computedId = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}-${c.year}-${index}`;
          if (computedId === carId || carId.toLowerCase().includes(c.model.toLowerCase().replace(/\s+/g, "-"))) {
            setCar(c as CarProps);
            break;
          }
        }
      } catch (err) {
        console.error("Error loading car details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCar();
  }, [params?.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5937E0] mx-auto mb-4"></div>
          <p className="text-[#6C757D] font-medium text-sm">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center pt-24">
        <div className="text-center bg-white p-10 rounded-[20px] border border-[#E5E7EB] shadow-sm max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-[#000000] mb-2">Vehicle Not Found</h1>
          <p className="text-[#6C757D] text-sm mb-6">
            The vehicle listing you are looking for is unavailable or may have been updated.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[50px] bg-[#5937E0] text-white text-sm font-semibold hover:bg-[#4A2CC7] transition-all shadow-md"
          >
            ← Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const isRented = car.status === "rented";
  const mainCarImage = getCarImage(car);
  const galleryImages = (car.images && car.images.length > 0) ? car.images : [mainCarImage, mainCarImage, mainCarImage];

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
            {isRented ? (
              <div className="px-3.5 py-1.5 rounded-full bg-[#181524] text-white text-xs font-bold uppercase tracking-wider">
                Currently Rented
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Available Now
              </div>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-[#F8F8FB] text-xs font-bold text-[#000000] hover:bg-[#EEEDF9] transition-all"
            >
              {copiedShare ? "Link Copied!" : "Share Vehicle"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Primary Showcase Section */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image stage & Thumbnail Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-[#5937E0] uppercase tracking-wider block mb-1">
                    {car.class || "Sedan"}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#000000] tracking-tight">
                    {car.make} {car.model}
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-[#FFA000] block">
                    {car.price_per_day} DH
                  </span>
                  <span className="text-xs text-[#6C757D]">per day</span>
                </div>
              </div>

              {/* Main Image Stage */}
              <div className="relative w-full h-[320px] sm:h-[400px] bg-[#F8F8FB] rounded-2xl flex items-center justify-center p-6 my-4">
                <Image
                  src={galleryImages[activeThumb] || mainCarImage}
                  alt={`${car.make} ${car.model}`}
                  fill
                  priority
                  className="object-contain p-4 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail Angles */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {galleryImages.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveThumb(idx)}
                    className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all p-2 bg-[#F8F8FB] ${
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
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#000000] mb-6">
                Technical Specification
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Gearbox</span>
                  <span className="text-sm font-bold text-[#000000]">
                    {car.transmission === "a" ? "Automatic" : "Manual"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]">
                  <span className="text-xs text-[#6C757D] block mb-1">Fuel Type</span>
                  <span className="text-sm font-bold text-[#000000] capitalize">
                    {car.fuel_type || "Gasoline"}
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

              {/* Main CTA: Rent a car or Rented state */}
              {isRented ? (
                <div className="mb-8 p-4 rounded-2xl bg-[#F1F1F6] border border-[#E5E7EB] text-center">
                  <span className="block text-sm font-bold text-black mb-1">
                    Currently Rented
                  </span>
                  <p className="text-xs text-[#6C757D] mb-3">
                    This vehicle is currently on the road and unavailable for reservation.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-bold text-xs transition-all shadow-sm"
                  >
                    Browse Available Fleet →
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full h-14 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-bold text-base shadow-[0_8px_24px_rgba(89,55,224,0.3)] transition-all flex items-center justify-center gap-2 mb-8 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                >
                  <span>Rent a car</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
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
      </section>

      {/* 3. Related Vehicles Section */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-16">
        <div className="flex items-center justify-between mb-8">
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
            className="text-xs font-bold text-[#5937E0] hover:underline hidden sm:block"
          >
            View all cars →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedCars.map((related, idx) => (
            <CarCard key={related.id || `${related.make}-${related.model}-${idx}`} car={related} index={idx} />
          ))}
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
