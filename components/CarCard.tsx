"use client";

import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import {
  normalizeFuel,
  normalizeTransmission,
  formatBodyType,
  formatSegment,
} from "@/lib/carTaxonomy";

interface CarCardProps {
  car: CarProps;
  index?: number;
  isAvailableForDates?: boolean;
}

const CarCard = ({ car, index = 0, isAvailableForDates }: CarCardProps) => {
  const {
    id,
    year,
    make,
    model,
    transmission,
    fuel_type,
    price_per_day,
    seats,
    km_policy,
    class: carClass,
    body_type,
    segment,
    status = "available",
  } = car;

  const carId =
    id ||
    `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "-")}-${year}-${index}`;
  const carImage = getCarImage(car);
  const isRented = status === "rented";
  const isUnavailableForDates = isAvailableForDates === false && !isRented;

  const subtitle = body_type
    ? `${formatBodyType(body_type)}${segment ? ` • ${formatSegment(segment)}` : ""}`
    : carClass || "Sedan";

  return (
    <article className="relative flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] [@media(hover:hover)]:hover:shadow-[0_12px_28px_rgba(89,55,224,0.14)] [@media(hover:hover)]:hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden group p-6 justify-between focus-within:ring-2 focus-within:ring-[#5937E0] focus-within:ring-offset-2 [@media(hover:hover)]:cursor-pointer motion-reduce:transition-none motion-reduce:hover:transform-none">
      {/* Rented or Date-Unavailable Badge */}
      {isRented && (
        <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-[#181524]/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase shadow-md pointer-events-none select-none">
          Rented
        </span>
      )}
      {isUnavailableForDates && (
        <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-amber-600/95 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase shadow-md pointer-events-none select-none">
          Unavailable for Dates
        </span>
      )}

      {/* Top: Car Image */}
      <div className="w-full h-44 sm:h-48 flex items-center justify-center relative my-2 overflow-hidden pointer-events-none">
        <Image
          src={carImage}
          alt={`${make} ${model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          className={`object-contain p-2 transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none ${
            isRented || isUnavailableForDates
              ? "opacity-75 grayscale-[20%]"
              : "[@media(hover:hover)]:group-hover:scale-105"
          }`}
        />
      </div>

      {/* Middle: Title & Price */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-lg font-bold text-black [@media(hover:hover)]:group-hover:text-[#5937E0] transition-colors truncate">
              <Link
                href={`/car/${carId}`}
                className="focus:outline-none after:absolute after:inset-0 after:z-10 after:content-['']"
              >
                {make} {model}
              </Link>
            </h3>
            <p className="text-xs text-[#6C757D] capitalize mt-0.5 truncate pointer-events-none">
              {subtitle}
            </p>
          </div>
          <div className="text-right shrink-0 pointer-events-none select-none">
            <span className="text-xl font-bold text-[#FFA000] whitespace-nowrap">
              {price_per_day} DH
            </span>
            <span className="text-[11px] text-[#6C757D] block -mt-1 whitespace-nowrap">
              per day
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-4 pointer-events-none"></div>

        {/* 4 Specs with Icons: Seats, Transmission, Fuel, Km Policy (replaces Air Conditioner) */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-[#6C757D] font-medium pb-5 pointer-events-none">
          {/* 1. Seats */}
          <div className="flex items-center gap-1.5 truncate" title={`${seats || 5} Seats`}>
            <svg
              className="w-4 h-4 shrink-0 text-[#6C757D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">{seats || 5} Seats</span>
          </div>

          {/* 2. Transmission */}
          <div className="flex items-center gap-1.5 truncate" title={normalizeTransmission(transmission)}>
            <svg
              className="w-4 h-4 shrink-0 text-[#6C757D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h8m-8 5h8m-8 5h8"
              />
            </svg>
            <span className="truncate">{normalizeTransmission(transmission)}</span>
          </div>

          {/* 3. Fuel Type */}
          <div className="flex items-center gap-1.5 truncate" title={normalizeFuel(fuel_type)}>
            <svg
              className="w-4 h-4 shrink-0 text-[#6C757D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="truncate">{normalizeFuel(fuel_type)}</span>
          </div>

          {/* 4. Km Policy */}
          <div className="flex items-center gap-1.5 truncate" title={km_policy || "Unlimited"}>
            <svg
              className="w-4 h-4 shrink-0 text-[#6C757D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="truncate">{km_policy || "Unlimited"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Button (non-interactive presentation, clicks hit stretched link overlay) */}
      {isRented ? (
        <div
          aria-hidden="true"
          className="w-full h-11 rounded-[50px] bg-[#F1F1F6] text-[#9CA3AF] text-sm font-semibold flex items-center justify-center border border-[#E5E7EB] select-none pointer-events-none"
        >
          Currently Rented
        </div>
      ) : isUnavailableForDates ? (
        <div
          aria-hidden="true"
          className="w-full h-11 rounded-[50px] bg-[#F1F1F6] text-[#9CA3AF] text-xs font-semibold flex items-center justify-center border border-[#E5E7EB] select-none pointer-events-none"
        >
          Unavailable for Selected Dates
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="w-full h-11 rounded-[50px] bg-[#5937E0] text-white text-sm font-bold flex items-center justify-center transition-all duration-200 ease-out select-none pointer-events-none shadow-sm [@media(hover:hover)]:group-hover:bg-[#4A2CC7] [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:shadow-md motion-reduce:transition-none motion-reduce:transform-none"
        >
          View Details
        </div>
      )}
    </article>
  );
};

export default CarCard;
