"use client";

import React from "react";
import { WobbleCard } from "@/components/ui/WobbleCard";
import Image from "next/image";
import Link from "next/link";

export function FeaturesCards() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1280px] mx-auto w-full">
        {/* Card 1: Large — Experience Ultimate Performance */}
        <div className="col-span-1 lg:col-span-2 bg-[#1E1B4B] rounded-[24px] p-8 relative overflow-hidden min-h-[300px] flex flex-col justify-between border border-white/10">
          {/* Decorative blob */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#3730A3]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xs">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
              Featured
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-snug">
              Experience Ultimate Car Performance
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              From SUVs to sports cars, explore the finest range of vehicles with top-notch features for maximum speed, comfort, and efficiency.
            </p>
          </div>

          <Image
            src="/car-deal2.webp"
            width={400}
            height={280}
            alt="car performance"
            className="absolute -right-4 lg:-right-[5%] -bottom-10 object-contain rounded-2xl opacity-90"
          />
        </div>

        {/* Card 2: Small — Safety */}
        <div className="col-span-1 bg-[#3730A3] rounded-[24px] p-8 relative overflow-hidden min-h-[300px] flex flex-col justify-between border border-white/10">
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-snug">
              Safety is Our Top Priority
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Advanced safety features and cutting-edge technology ensure a smooth, secure ride for you and your loved ones.
            </p>
          </div>

          {/* Checklist */}
          <ul className="relative z-10 mt-6 space-y-2">
            {["Full insurance included", "24/7 roadside assistance", "Regular inspections"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Full width — Exclusive Deals */}
        <div className="col-span-1 lg:col-span-3 bg-[#1E1B4B] rounded-[24px] p-8 md:p-12 relative overflow-hidden min-h-[280px] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="absolute top-0 right-0 w-[400px] h-full bg-[#3730A3]/20 blur-[80px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-pulse" />
              Exclusive Offers
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
              Sign Up for Exclusive Car Deals and Offers
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Get access to the best deals on the latest models, from compact cars to luxury sedans.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#3730A3] text-white font-semibold text-sm hover:bg-[#312E81] transition-all"
              >
                Browse Fleet
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button className="h-12 px-6 rounded-full bg-white text-[#1E1B4B] font-semibold text-sm hover:bg-[#F1F1F6] transition-all">
                Sign Up Free
              </button>
            </div>
          </div>

          <Image
            src="/car-deal1.webp"
            width={500}
            height={320}
            alt="car deals"
            className="relative z-10 object-contain rounded-2xl md:absolute md:right-0 md:bottom-0 md:h-full md:w-auto opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
