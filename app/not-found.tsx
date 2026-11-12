"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const isVehiclePage = pathname?.startsWith("/car");

  return (
    <>
      <title>{isVehiclePage ? "Vehicle not found | Ridelist" : "Page not found | Ridelist"}</title>
      <meta name="robots" content="noindex, nofollow" />

      <main className="w-full pt-[104px] bg-[#5937E0] overflow-hidden">
        <section className="relative w-full min-h-[calc(100dvh-104px)] flex flex-col justify-between overflow-hidden">
          {/* Layer 1: Clean background texture from homepage hero */}
          <Image
            src="/hero-bg-clean.webp"
            alt="Hero Background"
            fill
            priority
            unoptimized
            className="object-cover object-center pointer-events-none"
          />

          {/* Layer 2: Subtle Noise overlay from homepage hero */}
          <div
            className="absolute inset-0 w-full h-full opacity-[0.08] [mask-image:radial-gradient(#fff,transparent,90%)] pointer-events-none z-[5]"
            style={{
              backgroundImage: "url(/noise.webp)",
              backgroundSize: "30%",
            }}
          />

          {/* Layer 3: Centered Content Container */}
          <div className="relative z-10 w-full max-w-[840px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center py-12 lg:py-20">
            <div className="text-[clamp(6.5rem,14vw,12.5rem)] font-black tracking-tight leading-none text-white mb-2 sm:mb-4 select-none">
              4<span className="text-[#FFA000]">0</span>4
            </div>

            <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.18] tracking-tight text-white mb-4 sm:mb-6 [text-wrap:balance]">
              {isVehiclePage ? "Vehicle not found" : "Page not found"}
            </h1>

            <p className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-[560px] mx-auto font-normal [text-wrap:balance]">
              {isVehiclePage
                ? "This vehicle isn't available anymore. Let's get you back on the road."
                : "The page you're looking for doesn't exist or has moved. Let's get you back on the road."}
            </p>

            {/* Stackable Centered CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full sm:w-auto">
              {isVehiclePage ? (
                <>
                  <Link
                    href="/fleet"
                    className="h-14 px-9 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-base flex items-center justify-center transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Browse the fleet
                  </Link>
                  <Link
                    href="/"
                    className="h-14 px-9 rounded-full border-2 border-white text-white hover:bg-white/10 font-bold text-base flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Back to home
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    className="h-14 px-9 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-base flex items-center justify-center transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Back to home
                  </Link>
                  <Link
                    href="/fleet"
                    className="h-14 px-9 rounded-full border-2 border-white text-white hover:bg-white/10 font-bold text-base flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Browse the fleet
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Bottom Sub-Links inside the purple section */}
          <div className="relative z-20 w-full pb-6 pt-2 flex items-center justify-center gap-3 text-sm text-white/75 font-medium">
            <Link
              href="/contact"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
            <span className="text-white/40">·</span>
            <Link
              href="/track"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Track booking
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
