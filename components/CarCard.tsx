"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";

interface CarCardProps {
  car: CarProps;
  index?: number;
}

const badgePresets = [
  "Popular",
  "Eco Choice",
  "Spacious",
  "Best Seller",
  "Executive",
  "Long Range",
  "Ultra Efficient",
  "Adventure",
];

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const { city_mpg, year, make, model, transmission, drive, fuel_type, price_per_day, class: carClass } = car;
  const carId = `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}-${year}-${index}`;
  const carImage = getCarImage(car);
  const badgeLabel = badgePresets[index % badgePresets.length];
  const [favorited, setFavorited] = useState(false);

  return (
    <article className="car-card flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group w-full justify-between">
      {/* Top Section with Pills & Image Stage */}
      <div className="relative p-5 pb-0 w-full">
        <div className="flex items-center justify-between relative z-10 w-full mb-2">
          <span className="px-3 py-1 rounded-full bg-[#F1F2F8] text-[11px] font-bold text-[#3730A3] tracking-wide uppercase">
            {badgeLabel}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-[#E5E7EB]/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-bold text-[#0F0F1A]">Available Now</span>
          </div>
        </div>

        {/* Vehicle Image Stage */}
        <div className="w-full h-48 sm:h-52 flex items-center justify-center overflow-hidden my-2 relative bg-gradient-to-b from-[#F8F8FB] to-[#F1F2F8] rounded-2xl">
          <Image
            src={carImage}
            alt={`${make} ${model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={index < 4}
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
          <button
            type="button"
            aria-label={`Favorite ${make} ${model}`}
            onClick={(e) => {
              e.preventDefault();
              setFavorited(!favorited);
            }}
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6B7280] hover:text-red-500 transition-colors shadow-sm"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${favorited ? "text-red-500" : ""}`}
              style={favorited ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Middle Spec Details */}
      <div className="p-5 pt-2 flex flex-col flex-1 justify-between gap-4 bg-gradient-to-b from-transparent to-[#F8F8FB]/50 w-full">
        <div>
          <div className="flex items-baseline justify-between mb-1 w-full">
            <h3 className="text-lg font-bold text-[#0F0F1A] group-hover:text-[#3730A3] transition-colors truncate">
              {make} {model}
            </h3>
            <span className="text-xs font-semibold text-[#6B7280] ml-2 shrink-0">{year}</span>
          </div>
          <p className="text-xs text-[#6B7280] truncate mb-3 capitalize">
            {carClass || "Sedan"} • Seamless performance & comfort
          </p>

          {/* 4-Chip Specs Grid matching Stitch UI */}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]/60 text-center">
              <span className="material-symbols-outlined text-[16px] text-[#6B7280]">swap_driving_apps</span>
              <span className="text-[11px] font-semibold text-[#0F0F1A] mt-0.5">{transmission === "a" ? "Auto" : "Manual"}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]/60 text-center">
              <span className="material-symbols-outlined text-[16px] text-[#6B7280]">electric_meter</span>
              <span className="text-[11px] font-semibold text-[#0F0F1A] mt-0.5">{drive.toUpperCase()}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]/60 text-center">
              <span className="material-symbols-outlined text-[16px] text-[#6B7280]">local_gas_station</span>
              <span className="text-[11px] font-semibold text-[#0F0F1A] mt-0.5">{city_mpg} MPG</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB]/60 text-center">
              <span className="material-symbols-outlined text-[16px] text-[#6B7280]">airline_seat_recline_normal</span>
              <span className="text-[11px] font-semibold text-[#0F0F1A] mt-0.5">5 Seats</span>
            </div>
          </div>
        </div>

        {/* Footer: Price & View Details Button */}
        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#0F0F1A] tracking-tight">${price_per_day}</span>
              <span className="text-xs font-semibold text-[#6B7280]">/ day</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF] block truncate">Zero deposit · Insured</span>
          </div>

          <Link
            href={`/car/${carId}`}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#3730A3] hover:bg-[#1E1B4B] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            aria-label={`View ${make} ${model} details`}
          >
            <span>View Details</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
