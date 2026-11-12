"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

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

          {/* Layer 3: Main Content Container (Vertically centered in section) */}
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex-1 flex flex-col justify-center py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: 500 number, Headline, Subtitle, Buttons */}
              <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start w-full z-20">
                <Reveal triggerOnLoad delay={50} variant="fade-up" className="w-full">
                  <div className="text-[clamp(6rem,12vw,11.25rem)] font-black tracking-tight leading-none text-white mb-2 sm:mb-3 select-none">
                    5<span className="text-[#FFA000]">0</span>0
                  </div>
                </Reveal>

                <Reveal triggerOnLoad delay={120} variant="fade-up" className="w-full">
                  <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.18] tracking-tight text-white mb-4 sm:mb-6 [text-wrap:balance]">
                    Something went wrong
                  </h1>
                </Reveal>

                <Reveal triggerOnLoad delay={180} variant="fade-up" className="w-full">
                  <p className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-[500px] font-normal">
                    An unexpected error occurred while loading this page. Let&apos;s get you back on the road.
                  </p>
                </Reveal>

                {/* Stackable CTA Buttons */}
                <Reveal triggerOnLoad delay={240} variant="fade-up" className="w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => reset()}
                      className="h-14 px-8 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white font-bold text-base flex items-center justify-center transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      Try again
                    </button>
                    <Link
                      href="/"
                      className="h-14 px-8 rounded-full border-2 border-white text-white hover:bg-white/10 font-bold text-base flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      Back to home
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* Right Column: Hero cars cutout (Audi + Tesla) sitting slightly lower and bleeding off edge on desktop */}
              <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end items-center relative z-10 w-full mt-4 lg:mt-0">
                <Reveal
                  triggerOnLoad
                  delay={200}
                  variant="fade-scale"
                  className="w-full max-w-[480px] sm:max-w-[560px] lg:max-w-none lg:w-[clamp(440px,50vw,820px)] lg:-mr-8 xl:-mr-16 2xl:-mr-20 lg:translate-y-6"
                >
                  <div className="relative w-full aspect-[962/409]">
                    {/* Soft Ground Shadow under tires */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-6 sm:h-8 bg-black/45 blur-xl rounded-full pointer-events-none" />

                    <Image
                      src="/hero-cars-cutout.webp"
                      alt="Audi and Tesla cars"
                      fill
                      priority
                      unoptimized
                      className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
                    />
                  </div>
                </Reveal>
              </div>
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
