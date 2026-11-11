"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TireTrackPattern from "@/components/TireTrackPattern";
import Reveal from "@/components/Reveal";
import { AGENCY_CONFIG } from "@/constants/agency";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does it work?",
    answer:
      "Renting with RideList is straightforward: choose your preferred vehicle category, select your pickup dates and location, complete quick digital verification, and confirm your booking. When you arrive, unlock your car with the RideList app or collect your keys directly at the counter in minutes.",
  },
  {
    question: "Can I rent a car without a credit card?",
    answer:
      "Yes! We accept major debit cards for select vehicle categories, provided you present a valid government-issued driver's license and meet our security deposit verification during digital check-in.",
  },
  {
    question: "What are the requirements for renting a car?",
    answer:
      "You must be at least 21 years of age (young driver options available for ages 21–24), hold a valid driver's license for at least one full year, and provide a valid payment method matching the driver's legal name.",
  },
  {
    question: "Does RideList allow me to tow with or attach a hitch to the rental vehicle?",
    answer:
      "To ensure passenger safety and preserve factory warranty guidelines, towing and third-party hitch attachments are not permitted on our rental fleet. Factory-fitted bike racks can be requested in advance on select premium SUVs.",
  },
  {
    question: "Does RideList offer coverage products for purchase with my rental?",
    answer:
      "Yes, we provide three customizable protection tiers: Standard Collision Damage Waiver (CDW), Premium Zero-Deductible Coverage, and Complete Roadside & Personal Protection for absolute peace of mind throughout your journey.",
  },
];

const testimonials = [
  {
    name: "Emanuel Boyle",
    company: "Kuphal LLC",
    role: "Corporate Travel Manager",
    image: "/about/testimonial-emanuel.webp",
    text: "Booking with RideList was completely seamless from start to finish. The vehicle was pristine, fully detailed, and ready for pickup the second our plane touched down. Truly our go-to service for executive business travel.",
  },
  {
    name: "Sophia Vance",
    company: "Vance Studio",
    role: "Creative Director",
    image: "/about/testimonial-sophia.webp",
    text: "We booked a premium SUV for a week-long coastal production tour. Customer support was phenomenal when we needed to extend our dates, and the keyless mobile unlock feature saved us hours of counter wait time.",
  },
  {
    name: "Marcus Reynolds",
    company: "Apex Ventures",
    role: "Founder & Investor",
    image: "/about/testimonial-marcus.webp",
    text: "The transparent pricing with zero surprise surcharges is refreshing in the car rental industry. Premium fleet quality, spotless interior, and effortless return process. I recommend RideList to all my colleagues.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden pt-[104px]">
      {/* =========================================================================
          1. HERO BANNER (Figma Frame 1:10718) - Load-triggered Entrance
         ========================================================================= */}
      <section className="bg-white border-b border-[#E5E7EB] py-12 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-3 font-['Work_Sans',sans-serif]">
              About Us
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={100}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              / <span className="text-black font-semibold">About Us</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          2. VALUE PILLARS: "Where every drive feels extraordinary" (Figma 1:10721)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Title */}
          <div className="lg:col-span-5">
            <Reveal delay={0}>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-black leading-[1.18] tracking-tight font-['Work_Sans',sans-serif]">
                Where every drive feels extraordinary
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="w-16 h-1 bg-[#5937E0] rounded-full mt-6 mb-4"></div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[#6C757D] text-base leading-relaxed">
                RideList was built with a single mission: to transform vehicle rental into an effortless, transparent, and enjoyable driving experience.
              </p>
            </Reveal>
          </div>

          {/* Right 2x2 Feature Grid (Staggered by 90ms) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <Reveal delay={0} className="flex flex-col gap-2.5">
              <h3 className="text-xl sm:text-2xl font-semibold text-black capitalize font-['Work_Sans',sans-serif]">
                Variety Brands
              </h3>
              <p className="text-[#6C757D] text-sm sm:text-base leading-relaxed">
                From luxury executive sedans to spacious SUVs and eco-friendly hybrids, our fleet comprises top-tier models from the world&apos;s leading manufacturers.
              </p>
            </Reveal>

            {/* Feature 2 */}
            <Reveal delay={90} className="flex flex-col gap-2.5">
              <h3 className="text-xl sm:text-2xl font-semibold text-black capitalize font-['Work_Sans',sans-serif]">
                Awesome Support
              </h3>
              <p className="text-[#6C757D] text-sm sm:text-base leading-relaxed">
                Our 24/7 concierge and roadside assistance team is always one tap away, guaranteeing dependable help whenever and wherever you need it.
              </p>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={180} className="flex flex-col gap-2.5">
              <h3 className="text-xl sm:text-2xl font-semibold text-black capitalize font-['Work_Sans',sans-serif]">
                Maximum Freedom
              </h3>
              <p className="text-[#6C757D] text-sm sm:text-base leading-relaxed">
                Enjoy flexible rental durations, generous mileage allowances, and zero cancellation penalties up to 24 hours prior to pickup.
              </p>
            </Reveal>

            {/* Feature 4 */}
            <Reveal delay={270} className="flex flex-col gap-2.5">
              <h3 className="text-xl sm:text-2xl font-semibold text-black capitalize font-['Work_Sans',sans-serif]">
                Flexibility On The Go
              </h3>
              <p className="text-[#6C757D] text-sm sm:text-base leading-relaxed">
                Effortless mobile reservations, instant digital contract signing, and keyless vehicle access designed around your busy lifestyle.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VIDEO / MEDIA SHOWCASE BANNER (Figma Frame 1:10739)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 mb-16 sm:mb-20">
        <Reveal variant="fade-scale" delay={0}>
          <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] lg:aspect-[16/6] min-h-[320px] sm:min-h-[420px] rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-xl group bg-[#0F0F1A]">
            <Image
              src="/about/video-bg.jpg"
              alt="Automotive dealership consultant handing over rental car keys with thumbs up"
              fill
              priority
              unoptimized
              quality={100}
              className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />

            {/* Centered Play Button (App Amber/Yellow Accent #FFA000) */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              aria-label="Play brand video"
              className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white flex items-center justify-center shadow-2xl shadow-[#FFA000]/40 transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 group/btn cursor-pointer z-10"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 translate-x-0.5 fill-current transition-transform duration-300 group-hover/btn:scale-110"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          4. COUNTER / STATS SECTION (Figma Frame 1:10744) - Staggered
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 border-y border-[#E5E7EB]/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center">
          {/* Stat 1 */}
          <Reveal delay={0} className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold text-[#5937E0] tracking-tight leading-none font-['Work_Sans',sans-serif]">
              20k+
            </span>
            <span className="text-black text-lg sm:text-xl font-bold mt-3 font-['Work_Sans',sans-serif]">
              Happy customers
            </span>
          </Reveal>

          {/* Stat 2 */}
          <Reveal delay={100} className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold text-[#5937E0] tracking-tight leading-none font-['Work_Sans',sans-serif]">
              540+
            </span>
            <span className="text-black text-lg sm:text-xl font-bold mt-3 font-['Work_Sans',sans-serif]">
              Count of cars
            </span>
          </Reveal>

          {/* Stat 3 */}
          <Reveal delay={200} className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold text-[#5937E0] tracking-tight leading-none font-['Work_Sans',sans-serif]">
              25+
            </span>
            <span className="text-black text-lg sm:text-xl font-bold mt-3 font-['Work_Sans',sans-serif]">
              Years of experience
            </span>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          5. QUALITY & STORY SECTION (Figma Frame 1:10754)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text & Checklist */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <Reveal delay={0}>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-black leading-[1.18] tracking-tight mb-6 font-['Work_Sans',sans-serif]">
                Unlock unforgettable memories on the road
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-[#6C757D] text-base sm:text-lg leading-relaxed mb-10 max-w-[620px]">
                We believe renting a vehicle should be as thrilling and dependable as the journey ahead. Every car in our fleet is hand-curated, rigorously inspected, and primed to elevate your travels into pure joy.
              </p>
            </Reveal>

            {/* 4 Feature Checklist Items (Staggered) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {/* Item 1 */}
              <Reveal delay={120} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#5937E0] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-black/80 font-medium leading-snug">
                  Transparent pricing with zero hidden surcharges or surprise fees.
                </p>
              </Reveal>

              {/* Item 2 */}
              <Reveal delay={200} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#5937E0] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-black/80 font-medium leading-snug">
                  30-point safety check and showroom detailing before every trip.
                </p>
              </Reveal>

              {/* Item 3 */}
              <Reveal delay={280} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#5937E0] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-black/80 font-medium leading-snug">
                  Instant smartphone unlock and paperless digital check-in.
                </p>
              </Reveal>

              {/* Item 4 */}
              <Reveal delay={360} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#5937E0] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-black/80 font-medium leading-snug">
                  Convenient airport and city-center drop-off locations worldwide.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Right Portrait Image */}
          <Reveal variant="fade-scale" delay={140} className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px] aspect-square rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl group">
              <Image
                src="/about/customer-driving-experience.jpg"
                alt="Smiling driver resting hands on steering wheel enjoying a seamless RideList rental journey"
                fill
                unoptimized
                quality={100}
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          6. APP DOWNLOAD BANNER (Figma Frame 1:10782)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-28 sm:pt-36 lg:pt-44 pb-12 sm:pb-16">
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#5937E0] text-white shadow-2xl px-6 sm:px-10 lg:px-16 py-7 sm:py-8 lg:py-9">
          {/* Clipped background layer for tire track texture & subtle noise */}
          <div className="absolute inset-0 rounded-[28px] sm:rounded-[36px] overflow-hidden pointer-events-none">
            <TireTrackPattern className="opacity-15" variant="banner" />
            <div
              className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage: "url(/noise.webp)",
                backgroundSize: "30%",
              }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Single iPhone Mockup sticking out well above the purple box */}
            <Reveal
              variant="fade-scale"
              delay={100}
              className="lg:col-span-5 flex justify-center lg:justify-start lg:pl-6 xl:pl-8"
            >
              <div className="relative -mt-36 sm:-mt-48 lg:-mt-56 xl:-mt-64 mb-1 sm:mb-2 w-[230px] sm:w-[260px] lg:w-[285px] xl:w-[305px] aspect-[506/1024] drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] group">
                <Image
                  src="/about/app-mockup-single.png"
                  alt="RideList mobile app iPhone interface"
                  fill
                  priority
                  unoptimized
                  quality={100}
                  className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </Reveal>

            {/* Right: Copy & App Badges */}
            <div className="lg:col-span-7 flex flex-col items-start lg:pl-4">
              <Reveal delay={0}>
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-white/80 uppercase mb-3 block">
                  DOWNLOAD OUR APP
                </span>
              </Reveal>
              <Reveal delay={70}>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight mb-4 font-['Work_Sans',sans-serif] leading-tight">
                  Download our app
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-[540px] mb-6 sm:mb-8 font-normal">
                  Unlock cars directly with your phone, manage reservations in seconds, access keyless digital doors, and receive 24/7 roadside assistance at your fingertips.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <a
                    href="#"
                    className="hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shrink-0 shadow-md"
                  >
                    <Image
                      src="/app-store.svg"
                      alt="Download on the App Store"
                      width={172}
                      height={50}
                      unoptimized
                      className="h-[46px] sm:h-[50px] w-auto object-contain"
                    />
                  </a>
                  <a
                    href="#"
                    className="hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shrink-0 shadow-md"
                  >
                    <Image
                      src="/google-play.svg"
                      alt="Get it on Google Play"
                      width={172}
                      height={50}
                      unoptimized
                      className="h-[46px] sm:h-[50px] w-auto object-contain"
                    />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. TESTIMONIALS SECTION (Figma Frame 1:11479)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <Reveal delay={0}>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-center text-black mb-14 sm:mb-20 font-['Work_Sans',sans-serif]">
            Reviews from our customers
          </h2>
        </Reveal>

        {/* 3 Staggered Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {testimonials.map((item, idx) => (
            <Reveal key={idx} delay={idx * 100} className="h-full">
              <div className="h-full bg-white rounded-[24px] border border-[#E5E7EB] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
                {/* Card Top: Quote & Text */}
                <div className="p-8 sm:p-9 flex flex-col flex-1">
                  <span className="text-[#5937E0] text-5xl font-serif font-black leading-none mb-4 select-none">
                    “
                  </span>
                  <p className="text-[#6C757D] text-sm sm:text-base leading-relaxed flex-1">
                    {item.text}
                  </p>
                </div>

                {/* Avatar overlapping border */}
                <div className="relative -mb-10 z-10 flex justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={`Customer review by ${item.name}`}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  </div>
                </div>

                {/* Card Bottom: Purple Profile Container */}
                <div className="bg-[#5937E0] text-white pt-12 pb-6 px-6 text-center rounded-b-[24px]">
                  <h4 className="text-lg font-bold font-['Work_Sans',sans-serif]">{item.name}</h4>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5 font-normal">
                    {item.company} • {item.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. FAQ ACCORDION SECTION (Figma Frame 1:11506)
         ========================================================================= */}
      <section className="max-w-[1000px] mx-auto px-6 sm:px-8 py-12 sm:py-20">
        <Reveal delay={0}>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-center text-black mb-12 sm:mb-16 font-['Work_Sans',sans-serif]">
            Top Car Rental Questions
          </h2>
        </Reveal>

        {/* Staggered Accordion Items */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <Reveal key={index} delay={index * 70}>
                <div className="rounded-[18px] border border-[#E5E7EB] bg-[#F8F8FB] hover:border-[#5937E0]/40 overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 transition-colors hover:bg-white"
                  >
                    <span className="font-semibold text-base sm:text-lg text-black font-['Work_Sans',sans-serif]">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#5937E0]" : "text-[#6C757D]"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-8 pb-6 pt-1 text-[#6C757D] text-sm sm:text-base leading-relaxed border-t border-[#E5E7EB]/50 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          9. BOTTOM CTA BANNER: "Looking for a car?" (Figma Frame 1:11532)
         ========================================================================= */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
        <div className="group relative w-full rounded-[32px] lg:rounded-[40px] bg-gradient-to-r from-[#4423C6] via-[#5937E0] to-[#4F2FD4] border border-white/10 overflow-hidden p-8 sm:p-12 lg:p-16 text-white shadow-2xl min-h-[460px] lg:min-h-[500px] flex items-center">
          {/* Ambient Radial Gradient Highlight (matching homepage banner) */}
          <div className="absolute inset-0 [background-image:radial-gradient(88%_100%_at_top_left,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none" />

          {/* Soft Modern Glow */}
          <div className="absolute top-0 right-1/4 w-[460px] max-w-full h-[340px] bg-white/10 blur-[110px] rounded-full pointer-events-none" />

          {/* Noise Overlay */}
          <div
            className="absolute inset-0 w-full h-full opacity-20 [mask-image:radial-gradient(#fff,transparent,85%)] pointer-events-none"
            style={{
              backgroundImage: "url(/noise.webp)",
              backgroundSize: "30%",
            }}
          />

          {/* Branded Tire Track Pattern */}
          <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
            <TireTrackPattern variant="newsletter" />
          </div>

          {/* Left Content */}
          <div className="relative z-30 max-w-xl lg:max-w-2xl flex flex-col items-start">
            <Reveal delay={0}>
              <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold tracking-tight mb-2 font-['Work_Sans',sans-serif]">
                Looking for a car?
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <a
                href={AGENCY_CONFIG.phoneTel}
                className="text-2xl sm:text-3xl font-bold text-[#FFA000] hover:text-[#FF8F00] hover:-translate-y-0.5 transition-all duration-200 mb-4 inline-flex items-center gap-3"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                {AGENCY_CONFIG.phoneDisplay}
              </a>
            </Reveal>

            <Reveal delay={140}>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-[560px] mb-8 font-normal">
                Our reservation specialists are on standby 24/7 to help you secure the ideal vehicle for your upcoming trip at unmatched daily and weekly rates.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <Link
                href="/fleet"
                className="h-12 px-9 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] hover:-translate-y-0.5 hover:shadow-lg text-white font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-200 shadow-md active:scale-95"
              >
                Book now
              </Link>
            </Reveal>

            {/* Mobile Car View (visible only below md) */}
            <div className="md:hidden mt-8 w-full flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-[2816/1536] drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]">
                <Image
                  src="/ridelist cars images/Tesla Model Y.webp"
                  alt="Tesla Model Y"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Prominent High-Res Car with Rear Hidden Off Right Margin, identical to Homepage Tesla Banner */}
          <Reveal
            variant="fade-scale"
            delay={150}
            className="hidden lg:block absolute -right-20 lg:-right-28 xl:-right-36 -bottom-4 sm:-bottom-8 lg:-bottom-12 w-[540px] md:w-[620px] lg:w-[740px] xl:w-[820px] aspect-[2816/1536] pointer-events-none z-20"
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

      {/* =========================================================================
          VIDEO MODAL (Interactive preview for the media banner)
         ========================================================================= */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="RideList Experience"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  );
}
