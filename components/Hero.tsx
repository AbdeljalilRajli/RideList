"use client";

import Image from "next/image";
import Link from "next/link";
import { FlipWords } from "./ui/FlipWords";
import { AnimatedTooltipPreview } from "./AnimatedTooltipPreview";

const Hero = () => {
  const words = ["Fast", "Comfy", "Luxe", "Affordable"];

  const handleScroll = () => {
    document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative w-full min-h-screen bg-[#1E1B4B] overflow-hidden flex items-center">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#3730A3]/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#312E81]/40 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#3730A3]/10 blur-[160px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-7">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-pulse" />
              Premium Car Rentals 2026
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-tight tracking-tight text-white">
              Book a Car That&apos;s{" "}
              <span className="text-[#818CF8]">
                <FlipWords words={words} />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/70 max-w-lg leading-relaxed">
              The ultimate platform for convenient, stress-free car rentals at unbeatable prices. Select hand-inspected vehicles ready on your schedule.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={handleScroll}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-[#3730A3] text-white font-semibold text-[15px] hover:bg-[#312E81] active:scale-[0.98] transition-all shadow-lg"
              >
                Explore Cars
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 h-14 px-7 rounded-full bg-white/10 border border-white/25 text-white font-semibold text-[15px] hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                View Full Fleet
              </Link>
            </div>

            {/* Animated Tooltips */}
            <div className="pt-1">
              <AnimatedTooltipPreview />
            </div>

            {/* Trust meta */}
            <p className="text-sm text-white/50 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#818CF8]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1l2.39 4.84L18 6.76l-4 3.9.94 5.5L10 13.77 5.06 16.16l.94-5.5L2 6.76l5.61-.92L10 1z" clipRule="evenodd" />
              </svg>
              Zero deposit on verified profiles · Available in 18 cities
            </p>
          </div>

          {/* Right: Car image showcase */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-[560px]">
              {/* Main Showcase Card */}
              <div className="relative h-[420px] md:h-[480px] rounded-[24px] overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <Image
                  src="/hero.webp"
                  alt="Featured car"
                  fill
                  priority
                  className="object-contain p-6"
                />
                {/* Bottom overlay label */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#1E1B4B]/90 via-[#1E1B4B]/30 to-transparent rounded-b-[24px]">
                  <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Featured Tier</p>
                  <p className="text-white font-bold text-xl">RideList Premium Fleet</p>
                </div>
              </div>

              {/* Floating stat badge — top right */}
              <div className="absolute -top-4 -right-4 z-20 flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E5E7EB]">
                <div className="flex -space-x-2">
                  {["JD", "AL", "SR"].map((init, i) => (
                    <span
                      key={i}
                      className="inline-flex w-8 h-8 rounded-full bg-[#3730A3] text-white items-center justify-center text-xs font-bold border-2 border-white"
                    >
                      {init}
                    </span>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F0F1A]">4.8 ★</p>
                  <p className="text-xs text-[#6B7280]">2K+ clients</p>
                </div>
              </div>

              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-4 -left-4 z-20 flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E5E7EB]">
                <div className="w-9 h-9 rounded-full bg-[#EEEDF9] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#3730A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F0F1A]">Best Price Guaranteed</p>
                  <p className="text-xs text-[#6B7280]">Direct fleet pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
