"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import { FeaturesCards } from "@/components/FeaturesCards";
import TireTrackPattern from "@/components/TireTrackPattern";
import { AvailabilityIcon, ComfortIcon, SavingsIcon } from "@/components/ValuePillarIcons";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Reveal from "@/components/Reveal";

export default function Home() {
  const router = useRouter();

  // Booking Form States (Figma "Book your car" form)
  const [carType, setCarType] = useState("all");
  const [rentalPlace, setRentalPlace] = useState("");
  const [returnPlace, setReturnPlace] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Newsletter search state
  const [searchCity, setSearchCity] = useState("");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (carType && carType !== "all") params.set("type", carType.toLowerCase());
    if (rentalDate) params.set("pickup_date", rentalDate);
    if (returnDate) params.set("return_date", returnDate);
    if (rentalPlace) params.set("pickup_place", rentalPlace);
    if (returnPlace) params.set("return_place", returnPlace);
    const qs = params.toString();
    router.push(`/fleet${qs ? `?${qs}` : ""}`);
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/fleet?city=${encodeURIComponent(searchCity)}`);
  };

  // Top 6 cars for the 2x3 grid (defaults to constants, hydrated from Supabase)
  const [displayCars, setDisplayCars] = useState<CarProps[]>(cars.slice(0, 6));

  useEffect(() => {
    async function loadFeaturedCars() {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .neq("status", "hidden")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          setDisplayCars(data as CarProps[]);
        }
      } catch (err) {
        console.error("Error loading featured cars from Supabase:", err);
      }
    }
    loadFeaturedCars();
  }, []);

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden pt-[104px]">
      {/* =========================================================================
          1. HERO SECTION (Using Figma Hero Background Image)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-12">
        <div className="relative w-full rounded-[32px] lg:rounded-[40px] bg-[#5937E0] overflow-hidden p-8 sm:p-12 lg:p-16 text-white shadow-xl min-h-[580px] lg:min-h-[620px] flex items-center">
          {/* Layer 1: Hero Background Image (Covering hero section) */}
          <Image
            src="/hero-bg-clean.webp"
            alt="Hero Background"
            fill
            priority
            unoptimized
            className="object-cover object-center pointer-events-none"
          />

          {/* Layer 2: Light Noise Texture Overlay on Background Alone */}
          <div
            className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-[0.08] [mask-image:radial-gradient(#fff,transparent,90%)] pointer-events-none z-[5]"
            style={{
              backgroundImage: "url(/noise.webp)",
              backgroundSize: "30%",
            }}
          />

          {/* Layer 3: 2 Cars Cutout (No noise, front half appearing, back under booking form) */}
          <Reveal
            triggerOnLoad
            delay={400}
            variant="fade-scale"
            className="hidden sm:block absolute bottom-0 right-0 sm:right-[1%] md:right-[2%] lg:right-[3%] xl:right-[5%] w-[540px] md:w-[640px] lg:w-[740px] xl:w-[820px] aspect-[962/409] pointer-events-none z-10"
          >
            <div className="relative w-full h-full">
              <Image
                src="/hero-cars-cutout.webp"
                alt="RideList Cars"
                fill
                priority
                unoptimized
                className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
              />
            </div>
          </Reveal>

          <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Hero Left: Headline, Subtext, Orange "View all cars" Button */}
            <div className="lg:col-span-7 flex flex-col items-start z-20">
              <Reveal triggerOnLoad delay={0}>
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.26] sm:leading-[1.28] lg:leading-[1.3] mb-10 lg:mb-12">
                  Experience the road <br />
                  like never before
                </h1>
              </Reveal>

              <Reveal triggerOnLoad delay={120}>
                <p className="text-white/85 text-base sm:text-lg max-w-[480px] leading-relaxed mb-10 lg:mb-12 font-normal">
                  Discover flexible, premium vehicle rentals at unbeatable rates. Instant 24/7 online booking, full insurance coverage, and doorstep delivery for every journey.
                </p>
              </Reveal>

              <Reveal triggerOnLoad delay={240}>
                <Link
                  href="/fleet"
                  className="h-12 px-8 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] hover:-translate-y-0.5 hover:shadow-lg text-white font-bold text-sm flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
                >
                  View all cars
                </Link>
              </Reveal>
            </div>

            {/* Hero Right: Floating "Book your car" White Card */}
            <div className="lg:col-span-5 w-full flex justify-end z-20">
              <Reveal triggerOnLoad delay={300} className="w-full max-w-[400px]">
                <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl text-black w-full">
                  <h2 className="text-2xl font-bold text-black text-center mb-6">
                    Book your car
                  </h2>

                  <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3.5">
                    {/* Field 1: Car Type */}
                    <div className="relative">
                      <select
                        value={carType}
                        onChange={(e) => setCarType(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-medium text-black focus:outline-none focus:border-[#5937E0] appearance-none cursor-pointer"
                      >
                        <option value="all">Car type</option>
                        <option value="sedan">Sedan</option>
                        <option value="cabriolet">Cabriolet</option>
                        <option value="pickup">Pickup</option>
                        <option value="suv">SUV</option>
                        <option value="minivan">Minivan</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C757D]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Field 2: Place of rental */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Place of rental"
                        value={rentalPlace}
                        onChange={(e) => setRentalPlace(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-medium text-black placeholder:text-[#6C757D] focus:outline-none focus:border-[#5937E0]"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C757D]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Field 3: Place of return */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Place of return"
                        value={returnPlace}
                        onChange={(e) => setReturnPlace(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-medium text-black placeholder:text-[#6C757D] focus:outline-none focus:border-[#5937E0]"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6C757D]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Field 4: Rental date */}
                    <div className="relative">
                      <input
                        type="date"
                        value={rentalDate}
                        onChange={(e) => setRentalDate(e.target.value)}
                        placeholder="Rental date"
                        className="w-full h-11 px-4 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-medium text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Field 5: Return date */}
                    <div className="relative">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        placeholder="Return date"
                        className="w-full h-11 px-4 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-medium text-black focus:outline-none focus:border-[#5937E0]"
                      />
                    </div>

                    {/* Submit Button: Orange "Book now" pill */}
                    <button
                      type="submit"
                      className="w-full h-12 mt-2 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] hover:-translate-y-0.5 hover:shadow-lg text-white font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.98]"
                    >
                      Book now
                    </button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. THREE VALUE PILLARS ("Availability", "Comfort", "Savings")
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-[72px] py-[60px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-[72px] items-start justify-between">
          {/* Pillar 1: Availability */}
          <Reveal delay={0} className="flex flex-col gap-[29px] items-center text-center">
            <div className="flex flex-col gap-[20px] items-center">
              <AvailabilityIcon />
              <h3 className="font-['Work_Sans',sans-serif] font-semibold text-[24px] leading-normal text-black text-center w-full max-w-[336px]">
                Availability
              </h3>
            </div>
            <p className="font-['Work_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-black text-center max-w-[357px]">
              Instant access to verified vehicles near you, anytime with easy 24/7 online booking and contactless pickup.
            </p>
          </Reveal>

          {/* Pillar 2: Comfort */}
          <Reveal delay={90} className="flex flex-col gap-[29px] items-center text-center">
            <div className="flex flex-col gap-[20px] items-center">
              <ComfortIcon />
              <h3 className="font-['Work_Sans',sans-serif] font-semibold text-[24px] leading-normal text-black text-center w-full max-w-[336px]">
                Comfort
              </h3>
            </div>
            <p className="font-['Work_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-black text-center max-w-[357px]">
              Hand-inspected, premium condition cars with modern climate control ensuring a smooth, safe drive every time.
            </p>
          </Reveal>

          {/* Pillar 3: Savings */}
          <Reveal delay={180} className="flex flex-col gap-[29px] items-center text-center">
            <div className="flex flex-col gap-[20px] items-center">
              <SavingsIcon />
              <h3 className="font-['Work_Sans',sans-serif] font-semibold text-[24px] leading-normal text-black text-center w-full max-w-[336px]">
                Savings
              </h3>
            </div>
            <p className="font-['Work_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-black text-center max-w-[357px]">
              Transparent daily rates with no hidden fees, included insurance coverage, and flexible free cancellation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (Modern 2-Column Split: Editorial Steps + Scenic Photography)
         ========================================================================= */}
      <section id="how-it-works" className="max-w-[1440px] mx-auto px-6 lg:px-16 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Large Rounded Feature Photography */}
          <Reveal variant="fade-scale" className="lg:col-span-6 xl:col-span-6 flex">
            <div className="group relative w-full h-[480px] sm:h-[560px] lg:h-full min-h-[520px] lg:min-h-[700px] rounded-[24px] overflow-hidden shadow-lg border border-[#E5E7EB] bg-[#EEEDF9] cursor-pointer">
              <Image
                src="/how-it-works-suv.webp"
                alt="Get Behind the Wheel - RideList"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
            </div>
          </Reveal>

          {/* Right Column: Heading, Two-Step Columns & App CTA */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center">
            {/* Headline */}
            <Reveal delay={0}>
              <h2 className="font-['Work_Sans',sans-serif] font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-[1.18] text-black tracking-tight mb-8">
                Get Behind the Wheel in Easy Minutes
              </h2>
            </Reveal>

            {/* Divider */}
            <Reveal delay={50}>
              <hr className="border-t border-[#E5E7EB] mb-8" />
            </Reveal>

            {/* 4 Step Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mb-10">
              {/* Step 1: Book Online */}
              <Reveal delay={100}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 font-['Work_Sans',sans-serif]">
                    Book Online
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#6C757D] leading-relaxed mb-3">
                    Select your vehicle, choose flexible pickup dates, and confirm your reservation with transparent rates and zero hidden fees.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] hover:text-[#4423C6] transition-colors"
                  >
                    <span>Learn more</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>

              {/* Step 2: Pick Up & Drive */}
              <Reveal delay={180}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 font-['Work_Sans',sans-serif]">
                    Pick Up & Drive
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#6C757D] leading-relaxed mb-3">
                    Unlock your car seamlessly with contactless digital access or meet our concierge, then hit the road with 24/7 assistance.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] hover:text-[#4423C6] transition-colors"
                  >
                    <span>Learn more</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>

              {/* Step 3: Flexible Return */}
              <Reveal delay={260}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 font-['Work_Sans',sans-serif]">
                    Flexible Return
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#6C757D] leading-relaxed mb-3">
                    Drop off your vehicle at any certified station or airport terminal with swift contactless return and automated billing.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] hover:text-[#4423C6] transition-colors"
                  >
                    <span>Learn more</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>

              {/* Step 4: 24/7 Assistance */}
              <Reveal delay={340}>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 font-['Work_Sans',sans-serif]">
                    24/7 Assistance
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#6C757D] leading-relaxed mb-3">
                    Enjoy around-the-clock emergency roadside help, trip protection, and dedicated customer support whenever you need it.
                  </p>
                  <Link
                    href="/fleet"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] hover:text-[#4423C6] transition-colors"
                  >
                    <span>Learn more</span>
                    <span>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Standard App CTA Button */}
            <Reveal delay={380}>
              <Link
                href="/fleet"
                className="h-12 px-8 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] hover:-translate-y-0.5 hover:shadow-lg text-white font-bold text-sm inline-flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
              >
                View all cars
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. "Choose the car that suits you" (CATALOGUE / 2x3 GRID OF 6 CARS)
         ========================================================================= */}
      <section id="catalogue" className="max-w-[1440px] mx-auto px-6 lg:px-16 py-20">
        <Reveal delay={0} className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            Choose the car that suits you
          </h2>
          <Link
            href="/fleet"
            className="flex items-center gap-1.5 text-sm font-bold text-black hover:text-[#5937E0] transition-colors"
          >
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </Reveal>

        {/* 2 Rows of 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayCars.map((car, idx) => (
            <Reveal key={`${car.make}-${car.model}-${idx}`} delay={idx * 80}>
              <CarCard car={car} index={idx} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. FEATURES CARDS (Experience Performance, Safety, Exclusive Deals)
         ========================================================================= */}
      <section id="about" className="max-w-[1440px] mx-auto px-6 sm:px-[72px] py-14">
        <FeaturesCards />
      </section>

      {/* =========================================================================
          6. "Download mobile app" SECTION (Dual iPhone Wireframe Mockups)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-[72px] lg:pl-[120px] lg:pr-[72px] py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Text & Badges (1:1 Figma Design) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Reveal delay={0}>
              <h2 className="font-['Work_Sans',sans-serif] font-bold text-4xl sm:text-5xl lg:text-[50px] leading-[1.1] tracking-tight text-black max-w-[320px] mb-8 sm:mb-10">
                Download <br />
                mobile app
              </h2>
            </Reveal>

            <Reveal delay={90}>
              <p className="font-['Work_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-black/60 max-w-[536px] mb-10 sm:mb-12">
                Unlock cars directly from your phone, manage reservations on the fly, and access 24/7 roadside support with just a tap. Experience the future of modern car rental at your fingertips with the RideList mobile app.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <a
                  href="#"
                  className="hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0"
                >
                  <Image
                    src="/app-store.svg"
                    alt="Download on the App Store"
                    width={173}
                    height={50}
                    unoptimized
                    className="h-[50px] w-auto object-contain"
                  />
                </a>

                <a
                  href="#"
                  className="hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 shrink-0"
                >
                  <Image
                    src="/google-play-store.svg"
                    alt="Get it on Google Play"
                    width={173}
                    height={50}
                    unoptimized
                    className="h-[50px] w-auto object-contain"
                  />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right: Dual iPhone App Mockup Image */}
          <Reveal
            variant="fade-scale"
            delay={120}
            className="lg:col-span-6 flex items-center justify-center relative w-full"
          >
            <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[500px] aspect-[763/1024]">
              <Image
                src="/ridelist-app-mockup.webp"
                alt="RideList Mobile App Mockup"
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          7. "Enjoy every mile with complete peace of mind." BANNER
         ========================================================================= */}
      <section id="contact" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14">
        <div className="group relative w-full rounded-[32px] lg:rounded-[40px] bg-gradient-to-r from-[#4423C6] via-[#5937E0] to-[#4F2FD4] border border-white/10 overflow-hidden p-8 sm:p-12 lg:p-16 text-white shadow-2xl min-h-[460px] lg:min-h-[500px] flex items-center">
          {/* Ambient Radial Gradient Highlight (matching WobbleCard style) */}
          <div className="absolute inset-0 [background-image:radial-gradient(88%_100%_at_top_left,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none" />

          {/* Soft Modern Glow */}
          <div className="absolute top-0 right-1/4 w-[460px] h-[340px] bg-white/10 blur-[110px] rounded-full pointer-events-none" />

          {/* Noise Overlay (Matching the "Sign Up for Exclusive Car Deals" card) */}
          <div
            className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-20 [mask-image:radial-gradient(#fff,transparent,85%)] pointer-events-none"
            style={{
              backgroundImage: "url(/noise.webp)",
              backgroundSize: "30%",
            }}
          />

          {/* Branded Tire Track Pattern */}
          <div className="opacity-25 pointer-events-none">
            <TireTrackPattern variant="newsletter" />
          </div>

          {/* Left Content: Hero Typography & Search Input Pill */}
          <div className="relative z-30 max-w-xl lg:max-w-2xl flex flex-col items-start">
            <Reveal delay={0}>
              <h2 className="font-['Work_Sans',sans-serif] text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.22] sm:leading-[1.24] lg:leading-[1.26] mb-6 sm:mb-8">
                Enjoy every mile with <br />
                complete peace of mind.
              </h2>
            </Reveal>

            <Reveal delay={90}>
              <p className="font-['Work_Sans',sans-serif] text-base sm:text-lg text-white/85 max-w-[500px] leading-relaxed mb-8 sm:mb-10 font-normal">
                Find verified rental cars near you right now. Enter your city or destination to browse available vehicles, compare rates, and start your trip instantly.
              </p>
            </Reveal>

            {/* Floating White Input Pill with Orange "Search" Button */}
            <Reveal delay={180} className="w-full max-w-md sm:max-w-lg">
              <form
                onSubmit={handleCitySearch}
                className="bg-white rounded-full p-2 flex items-center shadow-xl w-full transition-all focus-within:ring-4 focus-within:ring-white/20"
              >
                <input
                  type="text"
                  placeholder="City or destination"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="flex-1 h-11 sm:h-12 px-6 text-sm sm:text-base text-black placeholder:text-[#6C757D] focus:outline-none rounded-full font-['Work_Sans',sans-serif]"
                />
                <button
                  type="submit"
                  className="h-11 sm:h-12 px-8 sm:px-10 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] hover:-translate-y-0.5 hover:shadow-lg text-white text-sm font-bold transition-all duration-200 shrink-0 shadow-md active:scale-95 flex items-center justify-center"
                >
                  Search
                </button>
              </form>
            </Reveal>
          </div>

          {/* Prominent High-Res Car with Rear Hidden Off Right Margin */}
          <Reveal
            variant="fade-scale"
            delay={150}
            className="hidden md:block absolute -right-16 sm:-right-24 lg:-right-28 xl:-right-36 -bottom-4 sm:-bottom-8 lg:-bottom-12 w-[540px] md:w-[620px] lg:w-[740px] xl:w-[820px] aspect-[2816/1536] pointer-events-none z-20"
          >
            <div className="relative w-full h-full">
              <Image
                src="/ridelist cars images/Tesla Model Y.webp"
                alt="Tesla Model Y"
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
