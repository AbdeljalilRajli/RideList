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
  const [pickupLocation, setPickupLocation] = useState("Downtown Dubai, UAE");
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
      <section className="max-w-[1280px] mx-auto px-6 pt-10 pb-12 w-full">
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
                className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-[#3730A3] text-white font-semibold text-sm sm:text-base shadow-md hover:bg-[#312E81] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Explore Cars</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <a
                href="#advantages"
                className="inline-flex items-center gap-2.5 h-14 px-7 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-semibold text-sm sm:text-base shadow-sm hover:bg-[#F1F1F6] transition-all"
              >
                <svg className="w-5 h-5 text-[#3730A3]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>How It Works</span>
              </a>
            </div>

            {/* Micro Location Meta */}
            <div className="flex items-center gap-3 pt-2 text-[#6B7280] text-xs sm:text-sm">
              <svg className="w-5 h-5 text-[#3730A3] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Zero deposit on verified corporate profiles • Available in 18 metropolitan hubs</span>
            </div>
          </div>

          {/* Hero Right Visual Stacking Composition */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0">
            {/* Backing Card with Unified Local Hero Car */}
            <div className="relative w-full max-w-[560px] h-[380px] sm:h-[460px] rounded-[28px] overflow-hidden bg-gradient-to-br from-white via-[#F8F8FB] to-[#EEEDF9] border border-[#E5E7EB] shadow-xl flex items-center justify-center p-6">
              <Image
                src="/hero.webp"
                alt="Signature Tier Luxury Car"
                fill
                priority
                className="object-contain p-8"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/80 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#EEEDF9] font-bold">Signature Fleet</p>
                  <p className="font-extrabold text-xl sm:text-2xl text-white">Porsche Panamera GTS</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
                  Available Now
                </span>
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
                  <span>★</span>
                  <span className="font-extrabold text-sm text-[#0F0F1A]">4.8</span>
                </div>
                <span className="text-[11px] font-semibold text-[#6B7280]">2K+ happy clients</span>
              </div>
            </div>

            {/* Floating Best Price Badge Bottom Left */}
            <div className="absolute -bottom-5 -left-2 sm:left-2 z-20 flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-full bg-[#EEEDF9] flex items-center justify-center text-[#3730A3]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
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
        <div className="w-full bg-white rounded-[24px] p-4 sm:p-6 shadow-xl border border-[#E5E7EB]">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            {/* Pick-up Location */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-[16px] bg-[#F8F8FB] hover:bg-[#F1F1F6] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#3730A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pick-up Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Airport or City Center"
                className="w-full bg-transparent text-sm font-semibold text-[#0F0F1A] focus:outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Pick-up Date */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-[16px] bg-[#F8F8FB] hover:bg-[#F1F1F6] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#3730A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pick-up Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Return Date */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-[16px] bg-[#F8F8FB] hover:bg-[#F1F1F6] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#3730A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Car Type Selector */}
            <div className="flex flex-col gap-1 px-4 py-2.5 rounded-[16px] bg-[#F8F8FB] hover:bg-[#F1F1F6] border border-[#E5E7EB] transition-colors">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#3730A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Car Type
              </label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#0F0F1A] focus:outline-none cursor-pointer"
              >
                <option value="all">All Fleet Types</option>
                <option value="suv">SUV & Crossover</option>
                <option value="sedan">Premium Sedan</option>
                <option value="hybrid">Hybrid & EV</option>
                <option value="luxury">Luxury Sport</option>
              </select>
            </div>

            {/* Action Button */}
            <div className="h-full flex items-end">
              <button
                type="submit"
                className="w-full h-[54px] rounded-full bg-[#1E1B4B] hover:bg-[#0F0F1A] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Cars</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Trust Strip */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0px_8px_24px_-4px_rgba(15,15,26,0.04)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[17px] text-[#0F0F1A] truncate">No Hidden Charges</span>
              <span className="text-xs text-[#6B7280]">Transparent, upfront pricing</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0px_8px_24px_-4px_rgba(15,15,26,0.04)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[17px] text-[#0F0F1A] truncate">24/7 Support</span>
              <span className="text-xs text-[#6B7280]">Live agent assistance always</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0px_8px_24px_-4px_rgba(15,15,26,0.04)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[17px] text-[#0F0F1A] truncate">Flexible Rentals</span>
              <span className="text-xs text-[#6B7280]">Daily, weekly, or monthly terms</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-[#E5E7EB] shadow-[0px_8px_24px_-4px_rgba(15,15,26,0.04)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[17px] text-[#0F0F1A] truncate">Secure Payments</span>
              <span className="text-xs text-[#6B7280]">Encrypted instant checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Typography Stats Row */}
      <section className="max-w-[1280px] mx-auto px-6 py-4 w-full">
        <div className="bg-[#EEEDF9] rounded-[24px] p-8 md:p-12 border border-[#E5E7EB] shadow-sm">
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
            <span className="text-xs uppercase tracking-widest text-[#3730A3] font-bold">Curated Inventory</span>
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
                className={`px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm shrink-0 transition-all shadow-sm ${
                  activeCategory === cat.value
                    ? "bg-[#1E1B4B] text-white"
                    : "bg-white text-[#6B7280] hover:text-[#0F0F1A] hover:bg-[#F1F1F6] border border-[#E5E7EB]"
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
            className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-white border border-[#E5E7EB] text-[#0F0F1A] font-semibold text-sm sm:text-base shadow-md hover:bg-[#1E1B4B] hover:text-white transition-all"
          >
            <span>View All Cars</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </section>

      {/* 6. Why Choose RideList (Our Distinction - Deep Indigo Section) */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full" id="advantages">
        <div className="bg-[#1E1B4B] text-white rounded-[28px] p-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3730A3]/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-2xl mb-12 relative z-10">
            <span className="text-xs uppercase tracking-widest text-[#EEEDF9] font-bold">Our Distinction</span>
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
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Explore Ride Options</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Discover a diverse range of ride options tailored to your needs. From weekend leisure convertibles to everyday city hatchbacks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">User-Friendly Interface</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Navigate through our frictionless interface designed for instant clarity. Easily browse, book, and extend rentals in seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Real-Time Tracking</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Stay updated with real-time location dispatch and telemetry. Know exactly when your car is prepped and delivered to your doorstep.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Affordable Pricing</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Enjoy highly competitive market rates without compromising on vehicle cleanliness, safety inspections, or insurance inclusions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Secure Payments</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Experience bank-grade security protocols. RideList supports encrypted credit card tokenization and flexible corporate billing.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#3730A3]/40 text-[#EEEDF9] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">24/7 Customer Support</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Our expert concierge and technical assistance team is on standby around the clock to support routing, changes, or roadside needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Promo Banners Section (2 Large Cards) */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promo Card 1 */}
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-[#E5E7EB] shadow-md group flex flex-col justify-between">
            <div className="p-8">
              <span className="text-xs uppercase font-bold text-[#3730A3] tracking-wider">Engineered For Thrill</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F0F1A] mt-2 mb-3">
                Experience Ultimate Car Performance
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mb-6">
                From agile sports sedans to powerful electric SUVs, explore handpicked vehicles tuned for unmatched road balance and responsiveness.
              </p>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#3730A3] hover:text-[#312E81] transition-colors"
              >
                <span>Explore High-Performance Fleet</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative h-56 sm:h-64 w-full bg-[#F8F8FB] border-t border-[#E5E7EB] flex items-center justify-center p-6">
              <Image
                src="/car-deal1.webp"
                alt="High Performance Car"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Promo Card 2 */}
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-[#E5E7EB] shadow-md group flex flex-col justify-between">
            <div className="p-8">
              <span className="text-xs uppercase font-bold text-[#3730A3] tracking-wider">Full Safety Rating</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F0F1A] mt-2 mb-3">
                Safety is Our Top Priority
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mb-6">
                Equipped with active sensor arrays, lane keeping assistance, and predictive collision braking to ensure calm confidence on every stretch.
              </p>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#3730A3] hover:text-[#312E81] transition-colors"
              >
                <span>Learn About Safety Standards</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative h-56 sm:h-64 w-full bg-[#F8F8FB] border-t border-[#E5E7EB] flex items-center justify-center p-6">
              <Image
                src="/car-deal2.webp"
                alt="Safety Certified Vehicle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Exclusive Deals Signup Banner */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 w-full">
        <div className="rounded-[28px] bg-gradient-to-r from-[#EEEDF9] to-[#E0E7FF] p-8 md:p-14 border border-[#E5E7EB] shadow-sm">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#3730A3] text-white flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] tracking-tight">
              Sign Up for Exclusive Car Deals and Offers
            </h2>

            <p className="text-sm sm:text-base text-[#6B7280] mt-3 mb-8 max-w-xl leading-relaxed">
              Get direct access to seasonal promotions, member discounts, and priority fleet releases from compact cars to luxury sedans.
            </p>

            {subscribedDeals ? (
              <div className="px-6 py-3 rounded-full bg-[#DCFCE7] text-[#16A34A] font-bold text-sm">
                ✓ Thank you for subscribing to exclusive RideList deals!
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
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={dealsEmail}
                    onChange={(e) => setDealsEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-14 pl-12 pr-4 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium text-[#0F0F1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3] shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 h-14 px-8 rounded-full bg-[#1E1B4B] hover:bg-[#0F0F1A] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. Join the RideList Waitlist Section */}
      <section className="max-w-[1280px] mx-auto px-6 pt-4 pb-20 w-full" id="contact">
        <div className="bg-white rounded-[28px] p-8 md:p-14 border border-[#E5E7EB] shadow-lg flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <span className="text-xs uppercase font-bold text-[#3730A3] tracking-wider">
              Future of Car Ownership & Rentals
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F0F1A] mt-2 mb-4 tracking-tight">
              Join the RideList Waitlist
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              Welcome to RideList, the modern mobility platform. Discover reliable, affordable, and high-quality vehicles tailored for your exact needs. Whether you&apos;re traveling, commuting, or exploring, RideList simplifies your path forward.
            </p>
          </div>

          <div className="w-full lg:max-w-md bg-[#F8F8FB] p-6 rounded-[22px] border border-[#E5E7EB]">
            {joinedWaitlist ? (
              <div className="p-4 rounded-full bg-[#DCFCE7] text-[#16A34A] text-center font-bold text-sm">
                ✓ You&apos;re on the waitlist! We&apos;ll be in touch soon.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (waitlistEmail) setJoinedWaitlist(true);
                }}
                className="flex flex-col gap-3"
              >
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Early Access Privileges</label>
                <div className="relative w-full">
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Your professional email"
                    className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-[#E5E7EB] text-sm text-[#0F0F1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#3730A3] hover:bg-[#312E81] text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <p className="text-[11px] text-[#9CA3AF] text-center mt-1">No spam ever. Unsubscribe anytime in 1 click.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
