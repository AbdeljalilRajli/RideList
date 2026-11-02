"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import { cars } from "@/constants";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  // Booking search console states
  const [pickupLocation, setPickupLocation] = useState("SFO Airport - Rental Concourse");
  const [pickupDate, setPickupDate] = useState("2026-11-10");
  const [returnDate, setReturnDate] = useState("2026-11-15");
  const [carType, setCarType] = useState("all");

  // Newsletter states
  const [dealsEmail, setDealsEmail] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [subscribedDeals, setSubscribedDeals] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const categories = [
    { label: "All Models", value: "all" },
    { label: "Economy", value: "economy" },
    { label: "SUV", value: "suv" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Luxury", value: "luxury" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/fleet?fuel=${carType === "hybrid" ? "hybrid" : ""}`);
  };

  const filteredCars = useMemo(() => {
    if (activeCategory === "all") return cars.slice(0, 8);
    return cars
      .filter((car) => {
        const cClass = car.class.toLowerCase();
        const fuel = car.fuel_type.toLowerCase();
        if (activeCategory === "economy") {
          return cClass.includes("compact") || cClass.includes("midsize");
        }
        if (activeCategory === "suv") {
          return cClass.includes("suv");
        }
        if (activeCategory === "hybrid") {
          return fuel.includes("hybrid") || fuel.includes("electric");
        }
        if (activeCategory === "luxury") {
          return car.price_per_day >= 75;
        }
        return true;
      })
      .slice(0, 8);
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#0F0F1A] overflow-hidden pt-20">
      {/* Top Ambient Glow */}
      <div className="relative w-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-[#3730A3]/10 blur-[120px] rounded-full"></div>
      </div>

      {/* 1. Hero Showcase Section */}
      <section className="max-w-[1280px] mx-auto px-6 pt-8 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEEDF9] text-[#3730A3] font-bold text-xs tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-pulse"></span>
              Elevated Mobility 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F0F1A] leading-[1.12]">
              Book a Car That’s <span className="text-[#3730A3]">Fast</span>. Rent With Ease.
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] max-w-xl leading-relaxed">
              The ultimate platform for convenient, stress-free car rentals at unbeatable prices. Select hand-inspected vehicles ready on your exact schedule.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalogue"
                className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-[#3730A3] text-white font-bold text-sm sm:text-base shadow-lg hover:bg-[#1E1B4B] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Explore Cars</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </a>

              <a
                href="#advantages"
                className="inline-flex items-center gap-2.5 h-14 px-7 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-bold text-sm sm:text-base shadow-sm hover:bg-[#F8F8FB] transition-all"
              >
                <span className="material-symbols-outlined text-[22px] text-[#3730A3]">play_circle</span>
                <span>How It Works</span>
              </a>
            </div>

            {/* Micro Location Meta */}
            <div className="flex items-center gap-2.5 pt-2 text-[#6B7280] text-xs sm:text-sm">
              <span className="material-symbols-outlined text-[#3730A3] text-[20px] shrink-0">verified_user</span>
              <span>Zero deposit on verified corporate profiles • Available in 18 metropolitan hubs</span>
            </div>
          </div>

          {/* Hero Right Visual Stacking Composition */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0">
            {/* Backing Card with Unified Local Hero Car */}
            <div className="relative w-full max-w-[560px] h-[380px] sm:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-br from-white via-[#F8F8FB] to-[#EEEDF9] border border-[#E5E7EB] shadow-2xl flex items-center justify-center p-6 group">
              <Image
                src="/hero.webp"
                alt="Signature Tier Luxury Car"
                fill
                priority
                className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Glassmorphic Bottom Pill */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#E5E7EB] shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Signature Fleet</span>
                  <p className="font-extrabold text-base sm:text-lg text-[#0F0F1A]">Porsche Panamera GTS</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#3730A3]">$85<span className="text-xs text-[#6B7280]">/d</span></span>
                  <span className="px-3 py-1 rounded-full bg-[#1E1B4B] text-white text-xs font-bold shadow-sm">
                    Available Now
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Stat Badge Top Right */}
            <div className="absolute -top-4 -right-2 sm:right-4 z-20 flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E5E7EB]">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-8 w-8 rounded-full bg-[#3730A3] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                  JD
                </span>
                <span className="inline-block h-8 w-8 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                  AL
                </span>
                <span className="inline-block h-8 w-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                  SR
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#3730A3]">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-extrabold text-sm text-[#0F0F1A]">4.8</span>
                </div>
                <span className="text-[11px] font-semibold text-[#6B7280]">2K+ happy clients</span>
              </div>
            </div>

            {/* Floating Best Price Badge Bottom Left */}
            <div className="absolute -bottom-5 -left-2 sm:left-2 z-20 flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-full bg-[#EEEDF9] flex items-center justify-center text-[#3730A3]">
                <span className="material-symbols-outlined text-[20px]">local_offer</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-[#0F0F1A]">Best Price Guaranteed</span>
                <span className="text-[11px] text-[#6B7280]">Direct rental fleet match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Booking Search Bar Console */}
      <section className="max-w-[1280px] mx-auto px-6 -mt-2 sm:-mt-4 relative z-30 w-full">
        <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E5E7EB]">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Pick-up Location */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-[#F8F8FB] hover:bg-[#F1F2F8] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#3730A3]">location_on</span>
                Pick-up Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Airport or City Center"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F0F1A] focus:outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Pick-up Date */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-[#F8F8FB] hover:bg-[#F1F2F8] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#3730A3]">calendar_today</span>
                Pick-up Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Return Date */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-[#F8F8FB] hover:bg-[#F1F2F8] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#3730A3]">event_available</span>
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Car Type Selector */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-2xl bg-[#F8F8FB] hover:bg-[#F1F2F8] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#3730A3]">directions_car</span>
                Car Type
              </label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              >
                <option value="all">All Fleet Types</option>
                <option value="suv">SUV & Crossover</option>
                <option value="sedan">Premium Sedan</option>
                <option value="hybrid">Hybrid & EV</option>
                <option value="luxury">Luxury Sport</option>
              </select>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full h-full min-h-[52px] rounded-2xl bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>Search Fleet</span>
            </button>
          </form>
        </div>
      </section>

      {/* 3. Trust Strip */}
      <section className="max-w-[1280px] mx-auto px-6 py-14 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-[#0F0F1A] truncate">No Hidden Charges</span>
              <span className="text-xs text-[#6B7280]">Transparent, upfront pricing</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-[#0F0F1A] truncate">24/7 Support</span>
              <span className="text-xs text-[#6B7280]">Live agent assistance always</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-[#0F0F1A] truncate">Flexible Rentals</span>
              <span className="text-xs text-[#6B7280]">Daily, weekly, or monthly terms</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">lock_clock</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-[#0F0F1A] truncate">Secure Payments</span>
              <span className="text-xs text-[#6B7280]">Encrypted instant checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Typography Stats Row */}
      <section className="max-w-[1280px] mx-auto px-6 py-2 w-full">
        <div className="bg-[#EEEDF9]/70 rounded-3xl p-8 md:p-12 border border-[#E5E7EB] shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-[#0F0F1A] tracking-tight">120+</span>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Cars Available</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-[#0F0F1A] tracking-tight">18</span>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">City Locations</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-[#0F0F1A] tracking-tight">2K+</span>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Happy Clients</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-[#3730A3] tracking-tight">24/7</span>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Dedicated Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Car Catalogue Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 w-full" id="catalogue">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#3730A3] font-bold">Curated Fleet</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] mt-1 tracking-tight">Car Catalogue</h2>
            <p className="text-[#6B7280] text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Explore the cars you might like for city cruising, long family road trips, or executive commutes.
            </p>
          </div>

          {/* Filter Chips matching Stitch */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shrink-0 transition-all shadow-sm ${
                  activeCategory === cat.value
                    ? "bg-[#1E1B4B] text-white"
                    : "bg-white text-[#6B7280] hover:text-[#0F0F1A] hover:bg-[#F1F2F8] border border-[#E5E7EB]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Car Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCars.map((car, index) => (
            <CarCard key={`home-car-${car.make}-${car.model}-${index}`} car={car} index={index} />
          ))}
        </div>

        {/* Center Pill Button */}
        <div className="flex justify-center mt-12">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-bold text-sm sm:text-base shadow-sm hover:bg-[#1E1B4B] hover:text-white transition-all active:scale-95"
          >
            <span>View All Cars</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* 6. Why Choose RideList (Our Distinction - Deep Indigo Section) */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full" id="advantages">
        <div className="bg-[#1E1B4B] text-white rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3730A3]/30 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-2xl mb-12 relative z-10">
            <span className="text-xs uppercase tracking-widest text-[#A5B4FC] font-bold">Our Distinction</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              Every Journey, <span className="text-[#A5B4FC]">Precisely</span> Considered
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
              RideList connects discerning drivers with pristine vehicles, effortless reservations, and around-the-clock roadside confidence.
            </p>
          </div>

          {/* 6 Feature Cards (3x2 Grid) matching Stitch */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">swap_driving_apps</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Explore Ride Options</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Choose from a versatile collection of sedans, SUVs, and luxury electrics maintained in peak mechanical health.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">touch_app</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">User-Friendly Interface</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Book in seconds with live rates, verified vehicle specs, and seamless contactless kiosk pickup passes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">my_location</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Real-Time Tracking</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Access instant bay allocations, keyless handover status, and live route navigation across NorCal.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Affordable Pricing</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Guaranteed competitive rates with zero surprise return fees and waived deposits on executive profiles.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">shield</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Secure Payments</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Bank-grade 256-bit SSL encrypted tokenization keeping your payment profiles safe and friction-free.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#3730A3]/60 text-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">24/7 Customer Support</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Round-the-clock live dispatch desk for roadside assistance, scheduling changes, and airport concierge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Promo Banners Section (Split Feature Cards) */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promo Card 1: Performance */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E5E7EB] shadow-md group">
            <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#F1F2F8]">
              <Image
                src="/car-deal1.webp"
                alt="Ultimate Car Performance"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider block mb-1">
                Engineered For Thrill
              </span>
              <h3 className="text-2xl font-bold text-[#0F0F1A] mb-2">Experience Ultimate Car Performance</h3>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                From agile sports sedans to high-torque electric cruisers, explore vehicles tuned for unmatched road balance and responsiveness.
              </p>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 font-bold text-sm text-[#0F0F1A] group-hover:text-[#3730A3] transition-colors"
              >
                <span>Explore High-Performance Fleet</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Promo Card 2: Safety */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E5E7EB] shadow-md group">
            <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#F1F2F8]">
              <Image
                src="/car-deal2.webp"
                alt="Safety is Our Top Priority"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <span className="text-xs font-bold text-[#3730A3] uppercase tracking-wider block mb-1">
                Full Safety Rating
              </span>
              <h3 className="text-2xl font-bold text-[#0F0F1A] mb-2">Safety is Our Top Priority</h3>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                Equipped with 360-degree sensor arrays, lane keeping assist, and active emergency braking for calm confidence on every stretch.
              </p>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 font-bold text-sm text-[#0F0F1A] group-hover:text-[#3730A3] transition-colors"
              >
                <span>Learn About Safety Standards</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Exclusive Deals Signup */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#EEEDF9] to-[#F8F8FB] border border-[#E5E7EB] p-8 md:p-14 shadow-sm text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#3730A3] text-white flex items-center justify-center mb-4 shadow-md">
              <span className="material-symbols-outlined text-[28px]">notifications_active</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
              Sign Up for Exclusive Car Deals and Offers
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] mt-3 mb-8 max-w-xl leading-relaxed">
              Get direct access to seasonal promotions, member discounts, and priority fleet releases from compact cars to luxury sedans.
            </p>

            {subscribedDeals ? (
              <div className="p-4 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Thank you! You are subscribed to RideList exclusive offers.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dealsEmail) setSubscribedDeals(true);
                }}
                className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={dealsEmail}
                    onChange={(e) => setDealsEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-14 pl-12 pr-4 rounded-full bg-white border border-[#E5E7EB] text-sm font-semibold text-[#0F0F1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3] shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 h-14 px-8 rounded-full bg-[#1E1B4B] hover:bg-[#0F0F1A] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. Join the RideList Waitlist Section */}
      <section className="max-w-[1280px] mx-auto px-6 pt-4 pb-20 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-[#E5E7EB] flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-widest text-[#3730A3] font-bold">
              Future of Automotive Mobility
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] mt-2 mb-4 tracking-tight">
              Join the RideList Waitlist
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              Welcome to RideList, the ultimate car rental and fleet management platform. Discover reliable, affordable, and high-quality vehicles tailored for your exact needs.
            </p>
          </div>

          <div className="w-full lg:max-w-md bg-[#F8F8FB] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            {joinedWaitlist ? (
              <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                You&apos;re on the priority early-access waitlist!
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (waitlistEmail) setJoinedWaitlist(true);
                }}
                className="flex flex-col gap-3"
              >
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Early Access Privileges
                </label>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[20px]">
                    badge
                  </span>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Your professional email"
                    className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-[#E5E7EB] text-sm font-semibold text-[#0F0F1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Claim Priority Access</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
