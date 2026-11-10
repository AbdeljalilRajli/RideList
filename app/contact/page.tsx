"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reveal from "@/components/Reveal";
import { blogArticles } from "@/constants/blog";
import { AGENCY_CONFIG } from "@/constants/agency";

const brandLogos = [
  { name: "Toyota", src: "/Brands Logos/Toyota.png", alt: "Toyota logo", width: 164, height: 108, query: "Toyota" },
  { name: "Ford", src: "/Brands Logos/Ford.png", alt: "Ford logo", width: 230, height: 88, query: "Ford" },
  { name: "Mercedes-Benz", src: "/Brands Logos/Mercides.png", alt: "Mercedes-Benz logo", width: 110, height: 108, query: "Mercedes" },
  { name: "Jeep", src: "/Brands Logos/Jeep.png", alt: "Jeep logo", width: 218, height: 88, query: "Jeep" },
  { name: "BMW", src: "/Brands Logos/BMW.png", alt: "BMW logo", width: 110, height: 108, query: "BMW" },
  { name: "Audi", src: "/Brands Logos/Audi.png", alt: "Audi logo", width: 248, height: 84, query: "Audi" },
];

export default function ContactPage() {
  const router = useRouter();

  // Booking Form State
  const [carType, setCarType] = useState("all");
  const [rentalPlace, setRentalPlace] = useState("");
  const [returnPlace, setReturnPlace] = useState("");
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/fleet?type=${carType}${rentalPlace ? `&city=${encodeURIComponent(rentalPlace)}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden pt-[104px]">
      {/* =========================================================================
          1. HERO HEADER BANNER (Figma Frame matching About & Fleet)
         ========================================================================= */}
      <section className="bg-white border-b border-[#E5E7EB] py-12 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-3 font-['Work_Sans',sans-serif]">
              Contact Us
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={80}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              / <span className="text-black font-semibold">Contact Us</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          2. BOOKING FORM & HERO PHOTOGRAPHY SPLIT SECTION
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Purple "Book your car" Card */}
          <div className="lg:col-span-5 w-full flex">
            <Reveal delay={0} className="w-full h-full">
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] bg-[#5937E0] text-white p-7 sm:p-9 shadow-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold text-white text-center mb-6 font-['Work_Sans',sans-serif]">
                    Book your car
                  </h2>

                  <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3.5">
                    {/* Field 1: Car Type */}
                    <div className="relative">
                      <select
                        value={carType}
                        onChange={(e) => setCarType(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-white appearance-none cursor-pointer transition-colors"
                      >
                        <option value="all" className="text-black">Car type</option>
                        <option value="sedan" className="text-black">Sedan</option>
                        <option value="cabriolet" className="text-black">Cabriolet</option>
                        <option value="pickup" className="text-black">Pickup</option>
                        <option value="suv" className="text-black">SUV</option>
                        <option value="minivan" className="text-black">Minivan</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
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
                        className="w-full h-12 pl-4 pr-10 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                        className="w-full h-12 pl-4 pr-10 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                        className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Field 5: Return date */}
                    <div className="relative">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full h-12 mt-2 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer"
                    >
                      Book now
                    </button>
                  </form>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: Rounded Feature Image */}
          <div className="lg:col-span-7 flex">
            <Reveal variant="fade-scale" delay={120} className="w-full h-full min-h-[380px] sm:min-h-[460px]">
              <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-xl group border border-[#E5E7EB]">
                <Image
                  src="/contact-hero.jpg"
                  alt="Customer enjoying RideList premium road trip"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Subtle soft gradient highlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CONTACT DETAILS STRIP (4 Info Cards in a Row)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-12 border-y border-[#E5E7EB]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 items-center">
          {/* Item 1: Address */}
          <Reveal delay={0}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif]">
                <span className="text-xs sm:text-sm font-normal text-[#6C757D] block mb-0.5">Address</span>
                <span className="text-sm sm:text-base font-semibold text-black block leading-snug">Oxford Ave. Cary, NC 27511</span>
              </div>
            </div>
          </Reveal>

          {/* Item 2: Email */}
          <Reveal delay={80}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif]">
                <span className="text-xs sm:text-sm font-normal text-[#6C757D] block mb-0.5">Email</span>
                <a
                  href={AGENCY_CONFIG.emailMailto}
                  className="text-sm sm:text-base font-semibold text-black block hover:text-[#5937E0] transition-colors leading-snug"
                >
                  {AGENCY_CONFIG.email}
                </a>
              </div>
            </div>
          </Reveal>

          {/* Item 3: Phone */}
          <Reveal delay={160}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif]">
                <span className="text-xs sm:text-sm font-normal text-[#6C757D] block mb-0.5">Phone</span>
                <a
                  href={AGENCY_CONFIG.phoneTel}
                  className="text-sm sm:text-base font-semibold text-black block hover:text-[#5937E0] transition-colors leading-snug"
                >
                  {AGENCY_CONFIG.phoneDisplay}
                </a>
              </div>
            </div>
          </Reveal>

          {/* Item 4: Opening hours */}
          <Reveal delay={240}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif]">
                <span className="text-xs sm:text-sm font-normal text-[#6C757D] block mb-0.5">Opening hours</span>
                <span className="text-sm sm:text-base font-semibold text-black block leading-snug">Sun–Mon: 10am – 10pm</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          4. "Latest blog posts & news" SECTION (3 Cards Grid)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <Reveal delay={0}>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-center text-black mb-12 sm:mb-16 font-['Work_Sans',sans-serif] tracking-tight">
            Latest blog posts & news
          </h2>
        </Reveal>

        {/* 3 Blog Cards Staggered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {blogArticles.map((article, idx) => (
            <Reveal key={article.slug} delay={idx * 100} className="h-full">
              <Link
                href={`/blog/${article.slug}`}
                className="group h-full flex flex-col justify-between bg-white rounded-[24px] border border-[#E5E7EB] p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200"
              >
                <div>
                  {/* Top: Feature Image */}
                  <div className="relative w-full aspect-[16/10] rounded-[18px] overflow-hidden mb-5 bg-[#EEEDF9]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Category & Date */}
                  <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider block mb-2">
                    {article.category} / {article.date}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-[#5937E0] transition-colors leading-snug font-['Work_Sans',sans-serif] mb-3">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-[#6C757D] leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                {/* Read More Link */}
                <div className="pt-4 mt-4 border-t border-[#E5E7EB]/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5937E0] group-hover:gap-2.5 transition-all">
                    <span>Read article</span>
                    <span>→</span>
                  </span>
                  <span className="text-xs text-[#9CA3AF] font-medium">{article.readTime}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. SUPPORTED AUTOMOBILE BRANDS STRIP (Exact Figma Component)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 pb-20 sm:pb-28">
        <Reveal delay={0}>
          <div className="bg-white rounded-[24px] py-10 px-6 sm:px-12 border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-8">
              Supported Automobile Brands
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-10 lg:gap-14 px-2 sm:px-6">
              {brandLogos.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => router.push(`/fleet?query=${encodeURIComponent(brand.query)}`)}
                  title={`Filter by ${brand.name}`}
                  className="h-10 sm:h-12 flex items-center justify-center group transition-transform hover:-translate-y-0.5 focus:outline-none cursor-pointer"
                >
                  <Image
                    src={brand.src}
                    alt={brand.alt}
                    width={brand.width}
                    height={brand.height}
                    unoptimized
                    className="max-h-7 sm:max-h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
