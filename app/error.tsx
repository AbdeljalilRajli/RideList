"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally for developer monitoring
    console.error("Runtime error caught by error boundary:", error);
  }, [error]);

  return (
    <>
      <title>Something went wrong | Ridelist</title>
      <meta name="robots" content="noindex, nofollow" />

      <main className="min-h-[calc(100vh-104px)] pt-[124px] pb-16 px-4 sm:px-6 lg:px-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-[1100px] mx-auto">
          {/* Main Hero-Style Error Card in Brand Purple */}
          <div className="relative w-full rounded-[32px] lg:rounded-[40px] bg-[#5937E0] overflow-hidden p-8 sm:p-12 lg:p-16 text-white shadow-xl min-h-[460px] lg:min-h-[500px] flex items-center">
            {/* Layer 1: Background texture */}
            <Image
              src="/hero-bg-clean.webp"
              alt="Background texture"
              fill
              priority
              unoptimized
              className="object-cover object-center pointer-events-none"
            />

            {/* Layer 2: Subtle Noise overlay */}
            <div
              className="absolute inset-0 w-full h-full opacity-[0.08] [mask-image:radial-gradient(#fff,transparent,90%)] pointer-events-none z-[5]"
              style={{
                backgroundImage: "url(/noise.webp)",
                backgroundSize: "30%",
              }}
            />

            {/* Content Grid */}
            <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading, Friendly Message, Buttons */}
              <div className="lg:col-span-7 flex flex-col items-start w-full">
                <div className="text-[clamp(3.5rem,8vw,5.5rem)] font-black tracking-tight leading-none text-white mb-2">
                  5<span className="text-[#FFA000]">0</span>0
                </div>

                <h1 className="text-[clamp(1.85rem,4.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white mb-4 [text-wrap:balance]">
                  Something went wrong
                </h1>

                <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-8 max-w-[480px] font-normal">
                  An unexpected error occurred while loading this page. Let&apos;s get you back on the road.
                </p>

                {/* Stackable CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                  <button
                    onClick={() => reset()}
                    className="h-12 px-7 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-sm flex items-center justify-center transition-all shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    Try again
                  </button>
                  <Link
                    href="/"
                    className="h-12 px-7 rounded-full border-2 border-white text-white hover:bg-white/10 font-bold text-sm flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    Back to home
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero cars cutout image */}
              <div className="lg:col-span-5 w-full flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] aspect-[962/409]">
                  <Image
                    src="/hero-cars-cutout.webp"
                    alt="RideList Cars"
                    fill
                    priority
                    unoptimized
                    className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Links Below Card */}
          <div className="flex items-center justify-center gap-3 pt-6 text-sm text-[#6C757D] font-medium">
            <Link
              href="/contact"
              className="hover:text-[#5937E0] transition-colors underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
            <span className="text-[#9CA3AF]">·</span>
            <Link
              href="/track"
              className="hover:text-[#5937E0] transition-colors underline-offset-4 hover:underline"
            >
              Track booking
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
