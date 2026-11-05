"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { WobbleCard } from "@/components/ui/WobbleCard";

export function FeaturesCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Card 1: Experience Ultimate Car Performance */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-[#181524] min-h-[440px] lg:min-h-[320px] border border-white/5"
        className="flex flex-col justify-between"
      >
        <div className="max-w-xs sm:max-w-sm relative z-10">
          <h2 className="text-left font-['Work_Sans',sans-serif] text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-white leading-snug">
            Experience Ultimate Car Performance
          </h2>
          <p className="mt-4 text-left font-['Work_Sans',sans-serif] text-sm sm:text-base leading-relaxed text-white/80">
            From SUVs to sports cars, explore the finest range of vehicles with
            top-notch features for maximum speed, comfort, and efficiency.
          </p>
        </div>
        <Image
          src="/car-deal2.webp"
          width={520}
          height={480}
          alt="Car Performance"
          priority
          className="absolute -right-6 lg:-right-[5%] -bottom-8 lg:-bottom-16 object-contain pointer-events-none"
        />
      </WobbleCard>

      {/* Card 2: Safety is Our Top Priority */}
      <WobbleCard
        containerClassName="col-span-1 min-h-[320px] bg-gradient-to-br from-[#FFB300] via-[#FFA000] to-[#FF8F00] border border-white/20"
        className="flex flex-col justify-between"
      >
        <div className="relative z-10">
          <h2 className="max-w-xs text-left font-['Work_Sans',sans-serif] text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-white leading-snug drop-shadow-sm">
            Safety is Our Top Priority
          </h2>
          <p className="mt-4 max-w-[26rem] text-left font-['Work_Sans',sans-serif] text-sm sm:text-base leading-relaxed text-white/90 font-medium drop-shadow-sm">
            Advanced safety features and cutting-edge technology ensure a smooth,
            secure ride for you and your loved ones.
          </p>
        </div>
      </WobbleCard>

      {/* Card 3: Sign Up for Exclusive Car Deals and Offers */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-r from-[#4423C6] via-[#5937E0] to-[#4F2FD4] min-h-[440px] lg:min-h-[340px] border border-white/10"
        className="flex flex-col justify-between"
      >
        <div className="max-w-sm sm:max-w-md relative z-10">
          <h2 className="max-w-sm md:max-w-lg text-left font-['Work_Sans',sans-serif] text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-snug">
            Sign Up for Exclusive Car Deals and Offers
          </h2>
          <p className="mt-4 max-w-[28rem] text-left font-['Work_Sans',sans-serif] text-sm sm:text-base leading-relaxed text-white/85">
            Get access to the best deals on the latest models, from compact cars
            to luxury sedans.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center justify-center bg-[#FFA000] hover:bg-[#FF8F00] text-white mt-8 rounded-full font-bold text-sm px-8 py-3.5 shadow-md transition-all active:scale-95"
          >
            Sign Up
          </Link>
        </div>
        <Image
          src="/car-deal1.webp"
          width={680}
          height={500}
          alt="Car Deals"
          priority
          className="absolute -right-8 md:-right-[20%] lg:-right-[2%] -bottom-6 lg:-bottom-14 object-contain pointer-events-none"
        />
      </WobbleCard>
    </div>
  );
}
