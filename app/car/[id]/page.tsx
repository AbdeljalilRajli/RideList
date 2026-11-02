"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import BookingForm from "@/components/BookingForm";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Booking Dock Form States
  const [pickupLocation, setPickupLocation] = useState("sfo");
  const [pickupDate, setPickupDate] = useState("2026-11-10");
  const [returnDate, setReturnDate] = useState("2026-11-13");
  const [addonInsurance, setAddonInsurance] = useState(true);
  const [addonChildSeat, setAddonChildSeat] = useState(false);
  const [addonDriver, setAddonDriver] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  // Gallery active index
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    if (params.id) {
      const carId = params.id as string;
      let foundCar: CarProps | null = null;

      for (let index = 0; index < cars.length; index++) {
        const c = cars[index];
        const computedId = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}-${c.year}-${index}`;
        if (computedId === carId) {
          foundCar = c;
          break;
        }
      }

      setCar(foundCar);
      setLoading(false);
    }
  }, [params.id]);

  // Rental duration calculation
  const rentalDays = useMemo(() => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [pickupDate, returnDate]);

  // Pricing calculations
  const priceBreakdown = useMemo(() => {
    if (!car) return { base: 0, addons: 0, taxes: 0, total: 0 };
    const base = car.price_per_day * rentalDays;
    let addonsPerDay = 0;
    if (addonInsurance) addonsPerDay += 12;
    if (addonChildSeat) addonsPerDay += 8;
    if (addonDriver) addonsPerDay += 10;
    const addons = addonsPerDay * rentalDays;
    const taxes = Math.round((base + addons) * 0.12);
    const total = base + addons + taxes;
    return { base, addons, taxes, total };
  }, [car, rentalDays, addonInsurance, addonChildSeat, addonDriver]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3] mx-auto mb-4"></div>
          <p className="text-[#6B7280] font-medium text-sm">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center pt-20">
        <div className="text-center bg-white p-10 rounded-2xl border border-[#E5E7EB] shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FFDAD6] text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F0F1A] mb-2">Vehicle Not Found</h1>
          <p className="text-[#6B7280] text-sm mb-6">
            The vehicle listing you are looking for is unavailable or may have been updated.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3730A3] text-white text-sm font-semibold hover:bg-[#312E81] transition-all shadow-md"
          >
            ← Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const mainCarImage = getCarImage(car);
  const galleryImages = [mainCarImage, mainCarImage, mainCarImage, mainCarImage];

  return (
    <main className="w-full pt-20 bg-[#F8F8FB] text-[#0F0F1A] min-h-screen">
      {/* 1. Contextual Strip with Breadcrumbs & Trust Badges */}
      <div className="w-full bg-[#F1F2F8] border-b border-[#E5E7EB] py-4">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[#6B7280] text-xs font-semibold uppercase tracking-wider">
            <Link href="/" className="hover:text-[#3730A3] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </Link>
            <span className="text-[#9CA3AF]">/</span>
            <Link href="/fleet" className="hover:text-[#3730A3] transition-colors">
              Fleet
            </Link>
            <span className="text-[#9CA3AF]">/</span>
            <span className="text-[#0F0F1A] normal-case font-bold">
              {car.make} {car.model} ({car.year})
            </span>
          </nav>

          {/* Trust Badges & Verified Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-[#E5E7EB]">
              <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-pulse"></span>
              <span className="text-xs font-medium text-[#0F0F1A]">Available at SFO Airport & Downtown</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEEDF9] text-[#3730A3] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              RideList Certified
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Showcase Container */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 md:py-12 w-full">
        {/* Title & Status Deck */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-[#EEEDF9] text-[#3730A3] text-xs font-bold uppercase tracking-wide">
                {car.class || "Premium Class"}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[#3730A3] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-bold text-[#0F0F1A]">4.9</span>
                <span className="text-[#6B7280]">(148 verified reviews)</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[#6B7280] text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#3730A3]">check_circle</span>
                Cleaned & Sanitized
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F0F1A]">
              {car.make} <span className="text-[#3730A3]">{car.model}</span> ({car.year})
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] mt-2 max-w-2xl leading-relaxed">
              Effortless, agile, and exceptionally efficient {car.fuel_type} driving engineered for seamless urban commutes and open highway balance.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label="Save to Wishlist"
              className={`w-12 h-12 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                isWishlisted ? "text-[#BA1A1A]" : "text-[#6B7280] hover:text-[#BA1A1A]"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share listing"
              className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center text-[#6B7280] hover:text-[#0F0F1A] transition-transform hover:scale-105 active:scale-95 relative"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
              {copiedShare && (
                <span className="absolute -top-8 px-2 py-0.5 rounded bg-[#0F0F1A] text-white text-[10px] whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="w-3 h-3 rounded-full bg-[#3730A3]"></span>
              <span className="text-xs font-bold text-[#0F0F1A]">Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* 3. Main Content Grid: Left 8 cols (Gallery & Specs) + Right 4 cols (Sticky Booking Dock) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start pt-8">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Interactive High-Fidelity Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm group">
                <Image
                  src={galleryImages[activeThumb]}
                  alt={`${car.make} ${car.model}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-contain p-6 bg-[#F8F8FB] transition-all duration-300"
                />

                {/* Floating Feature Overlays */}
                <div className="absolute top-5 left-5 flex items-center gap-2 pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1E1B4B]/90 backdrop-blur-md text-white text-xs font-semibold shadow-md flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#EEEDF9] text-[16px]">verified</span>
                    Flagship Model
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#0F0F1A] text-xs font-bold shadow-md border border-[#E5E7EB]">
                    {car.year} Edition
                  </span>
                </div>

                {/* In-Image Spec Badge Pill */}
                <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-[#E5E7EB] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEEDF9] flex items-center justify-center shrink-0 text-[#3730A3]">
                      <span className="material-symbols-outlined text-[20px]">speed</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F0F1A]">{car.combination_mpg} MPG Combined</div>
                      <div className="text-xs text-[#6B7280]">
                        {car.city_mpg} City / {car.highway_mpg} Hwy Efficiency
                      </div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#EEEDF9] text-xs font-semibold text-[#3730A3]">
                    {car.transmission === "a" ? "Automatic" : "Manual"}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveThumb(i)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] bg-white border-2 transition-all p-2 ${
                      activeThumb === i ? "border-[#3730A3] shadow-sm" : "border-[#E5E7EB] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative w-full h-full bg-[#F8F8FB] rounded-lg">
                      <Image
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        sizes="160px"
                        className="object-contain p-1"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Engineering Specifications Bento Cards */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F0F1A]">Vehicle Specifications</h2>
                <span className="text-xs font-semibold text-[#6B7280] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#3730A3]">tune</span>
                  Verified Factory Specs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* 1. Transmission */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings_input_component</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Transmission</span>
                    <span className="text-base font-bold text-[#0F0F1A]">
                      {car.transmission === "a" ? "Automatic (CVT)" : "Manual 6-Speed"}
                    </span>
                  </div>
                </div>

                {/* 2. Drivetrain */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">swap_driving_apps</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Drivetrain</span>
                    <span className="text-base font-bold text-[#0F0F1A]">
                      {car.drive.toUpperCase()} ({car.drive.toLowerCase() === "awd" ? "All-Wheel" : "Front-Wheel"})
                    </span>
                  </div>
                </div>

                {/* 3. Fuel Efficiency */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Efficiency</span>
                    <span className="text-base font-bold text-[#0F0F1A]">
                      {car.combination_mpg} MPG Combined
                    </span>
                  </div>
                </div>

                {/* 4. Capacity */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Seating Capacity</span>
                    <span className="text-base font-bold text-[#0F0F1A]">{car.seats} Passengers</span>
                  </div>
                </div>

                {/* 5. Luggage */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">luggage</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Cargo Volume</span>
                    <span className="text-base font-bold text-[#0F0F1A]">2 Large + 2 Small Bags</span>
                  </div>
                </div>

                {/* 6. Powertrain */}
                <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-3 group hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#F8F8FB] flex items-center justify-center text-[#3730A3] group-hover:bg-[#3730A3] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">engineering</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider block">Powertrain</span>
                    <span className="text-base font-bold text-[#0F0F1A]">
                      {car.displacement}L {car.cylinders}-Cylinder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About This Vehicle Editorial Section */}
            <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#3730A3] uppercase tracking-widest">
                  Architectural Performance
                </span>
                <h2 className="text-2xl font-bold text-[#0F0F1A]">About This Vehicle</h2>
              </div>
              <div className="text-[#6B7280] text-sm leading-relaxed space-y-4">
                <p>
                  The {car.year} {car.make} {car.model} delivers a benchmark in modern automotive refinement. Combining athletic proportions with an airy greenhouse, this vehicle is crafted for drivers who appreciate agile maneuvering without sacrificing cabin tranquility or fuel frugality.
                </p>
                <p>
                  Step inside to experience an ergonomic cockpit centered around premium touchpoints: tactile controls, integrated ventilation mesh, and intuitive smartphone tethering with both Apple CarPlay® and Android Auto™. Its balanced chassis glides comfortably across open highway routes while remaining pinpoint accurate around city turns.
                </p>
              </div>

              {/* Highlight Vignette Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3730A3] shrink-0 shadow-sm border border-[#E5E7EB]">
                    <span className="material-symbols-outlined text-[24px]">shield</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F0F1A]">Active Safety Suite</div>
                    <div className="text-xs text-[#6B7280]">Collision mitigation & lane keeping assist</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3730A3] shrink-0 shadow-sm border border-[#E5E7EB]">
                    <span className="material-symbols-outlined text-[24px]">eco</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F0F1A]">Eco Efficiency Mapping</div>
                    <div className="text-xs text-[#6B7280]">Optimized throttle for extended range</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Included Features & Amenities */}
            <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F0F1A]">Included Features & Amenities</h2>
                <span className="text-xs font-bold text-[#3730A3] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  All-Inclusive Standard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  { title: "Apple CarPlay & Android Auto", desc: "Seamless wireless smartphone projection" },
                  { title: "Adaptive Cruise & Lane Keep Assist", desc: "Low-stress automated highway pacing" },
                  { title: "Rearview Camera w/ Dynamic Guidelines", desc: "Multi-angle wide and top-down view" },
                  { title: "Keyless Smart Entry & Push Button", desc: "Walk-away auto-lock and proximity sensor" },
                  { title: "Bluetooth® High-Def Audio", desc: "Noise-canceling mic with dual device link" },
                  { title: "Clean Vehicle Guarantee", desc: "Fresh cabin detailing before every handoff" },
                  { title: "Unlimited Mileage Option Available", desc: "Standard 250 mi/day or statewide unmetered" },
                  { title: "24/7 Roadside Assistance", desc: "Flat tire, lockout, and towing coverage" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#EEEDF9] flex items-center justify-center text-[#3730A3] shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0F0F1A]">{item.title}</span>
                      <span className="text-xs text-[#6B7280]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Rental Policies & Assurance Accordion */}
            <div className="p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Transparent Terms</span>
                <h2 className="text-2xl font-bold text-[#0F0F1A]">Rental Policies & Assurance</h2>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: "calendar_month",
                    title: "Cancellation & Refund Policy",
                    content: "Enjoy 100% full refund eligibility up to 24 hours prior to your scheduled pickup time. Modifications can be executed through your RideList dashboard at no fee.",
                  },
                  {
                    icon: "badge",
                    title: "Driver Requirements & Eligibility",
                    content: "Renters must be at least 21 years of age with a valid government-issued driver's license and credit or debit card matching the reservation name. Drivers under 25 are subject to a nominal daily surcharge.",
                  },
                  {
                    icon: "security",
                    title: "Insurance, Damage Waiver & Deposits",
                    content: "A standard security authorization hold of $200 is placed upon vehicle dispatch and released immediately upon incident-free return. You may use personal auto insurance or add RideList Comprehensive Protection for $0 deductible coverage.",
                  },
                  {
                    icon: "local_gas_station",
                    title: "Fuel & Cleanliness Protocol",
                    content: "Vehicles are handed over with a full tank of fuel. Please return at the same fill-level, or select pre-paid refueling at local pump market rates with zero service penalty.",
                  },
                ].map((item, idx) => {
                  const isOpen = openAccordion === idx;
                  return (
                    <div key={idx} className="rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : idx)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-bold text-[#0F0F1A]"
                      >
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#3730A3] text-[20px]">{item.icon}</span>
                          {item.title}
                        </span>
                        <span
                          className={`material-symbols-outlined transition-transform duration-200 text-[#6B7280] ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-[#6B7280] text-xs leading-relaxed border-t border-[#E5E7EB] pt-3">
                          {item.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Dock (4 cols) */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-xl flex flex-col gap-6">
              {/* Price Header Deck */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
                    ${car.price_per_day}
                  </span>
                  <span className="text-sm font-medium text-[#6B7280]">/ day</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#3730A3] text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> Best Value
                </div>
              </div>

              <div className="h-px w-full bg-[#E5E7EB]"></div>

              {/* Reservation Interactive Form */}
              <div className="flex flex-col gap-4">
                {/* Station Selection */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stationSelect" className="text-xs font-bold text-[#0F0F1A] uppercase tracking-wider">
                    Pickup & Return Station
                  </label>
                  <div className="relative">
                    <select
                      id="stationSelect"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#3730A3] transition-colors cursor-pointer"
                    >
                      <option value="sfo">San Francisco Intl Airport (SFO)</option>
                      <option value="oak">Oakland Metro Airport (OAK)</option>
                      <option value="dt-sf">Downtown SF Union Square Station</option>
                      <option value="sjc">San Jose Mineta Airport (SJC)</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none text-[20px]">
                      location_on
                    </span>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Date Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pickDate" className="text-xs font-bold text-[#0F0F1A] uppercase tracking-wider">
                      Pick-Up
                    </label>
                    <div className="relative">
                      <input
                        id="pickDate"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full h-12 pl-10 pr-3 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3] cursor-pointer"
                      />
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none text-[18px]">
                        calendar_today
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="retDate" className="text-xs font-bold text-[#0F0F1A] uppercase tracking-wider">
                      Return
                    </label>
                    <div className="relative">
                      <input
                        id="retDate"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full h-12 pl-10 pr-3 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3730A3] cursor-pointer"
                      />
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none text-[18px]">
                        calendar_today
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Add-ons */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-bold text-[#0F0F1A] uppercase tracking-wider">
                    Available Add-ons
                  </span>

                  {/* Addon 1 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] hover:bg-[#EEEDF9]/40 transition-colors cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addonInsurance}
                        onChange={(e) => setAddonInsurance(e.target.checked)}
                        className="w-5 h-5 rounded accent-[#3730A3] cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0F0F1A]">Full Coverage Protection</span>
                        <span className="text-[11px] text-[#6B7280]">$0 deductible damage waiver</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F0F1A]">
                      +$12<span className="text-[10px] text-[#6B7280] font-normal">/d</span>
                    </span>
                  </label>

                  {/* Addon 2 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] hover:bg-[#EEEDF9]/40 transition-colors cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addonChildSeat}
                        onChange={(e) => setAddonChildSeat(e.target.checked)}
                        className="w-5 h-5 rounded accent-[#3730A3] cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0F0F1A]">Child Safety Seat</span>
                        <span className="text-[11px] text-[#6B7280]">Sanitized rear or booster seat</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F0F1A]">
                      +$8<span className="text-[10px] text-[#6B7280] font-normal">/d</span>
                    </span>
                  </label>

                  {/* Addon 3 */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] hover:bg-[#EEEDF9]/40 transition-colors cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addonDriver}
                        onChange={(e) => setAddonDriver(e.target.checked)}
                        className="w-5 h-5 rounded accent-[#3730A3] cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#0F0F1A]">Additional Driver</span>
                        <span className="text-[11px] text-[#6B7280]">Authorized secondary operator</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0F0F1A]">
                      +$10<span className="text-[10px] text-[#6B7280] font-normal">/d</span>
                    </span>
                  </label>
                </div>

                {/* Price Breakdown Summary */}
                <div className="p-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Base Rate ({rentalDays} {rentalDays === 1 ? "day" : "days"})</span>
                    <span className="font-semibold text-[#0F0F1A]">${priceBreakdown.base}</span>
                  </div>
                  {priceBreakdown.addons > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span>Selected Add-ons</span>
                      <span className="font-semibold text-[#0F0F1A]">+${priceBreakdown.addons}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Taxes & Airport Surcharges (12%)</span>
                    <span className="font-semibold text-[#0F0F1A]">+${priceBreakdown.taxes}</span>
                  </div>
                  <div className="h-px bg-[#E5E7EB] my-1"></div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#0F0F1A]">Estimated Total</span>
                    <span className="text-xl font-extrabold text-[#3730A3]">
                      ${priceBreakdown.total}
                    </span>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full h-14 rounded-full bg-[#3730A3] hover:bg-[#312E81] text-white text-base font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                >
                  <span>Reserve Vehicle Now</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>

                <p className="text-center text-[11px] text-[#9CA3AF]">
                  No payment required today • Free cancellation up to 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stitch 4-Step Reservation System */}
      {isBookingModalOpen && (
        <BookingForm
          car={car}
          isOpen={isBookingModalOpen}
          closeModal={() => setIsBookingModalOpen(false)}
          initialPickupDate={pickupDate}
          initialReturnDate={returnDate}
          initialPickupLocation={pickupLocation === "sfo" ? "SFO Airport - Rental Concourse" : pickupLocation === "downtown" ? "Downtown San Francisco - Union Square" : "San Jose Mineta Airport (SJC)"}
        />
      )}
    </main>
  );
}
