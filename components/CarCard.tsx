"use client";

import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { getCarImage, getCarSlug, formatDayMonth } from "@/lib/utils";
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
  rentedUntilDate?: string | null;
}

const CarCard = ({ car, index = 0, isAvailableForDates, rentedUntilDate }: CarCardProps) => {
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

  const carSlug = getCarSlug(car);
  const carImage = getCarImage(car);
  const isMaintenance = status === "maintenance";
  const isUnavailableForDates = isAvailableForDates === false;

  const subtitle = body_type
    ? `${formatBodyType(body_type)}${segment ? ` • ${formatSegment(segment)}` : ""}`
    : carClass || "Sedan";

  return (
    <article className="relative flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] [@media(hover:hover)]:hover:shadow-[0_12px_28px_rgba(89,55,224,0.14)] [@media(hover:hover)]:hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden group p-6 justify-between motion-reduce:transition-none motion-reduce:hover:transform-none">
      {/* Maintenance Badge */}
      {isMaintenance && (
        <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-orange-600/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase shadow-md select-none">
          Unavailable
        </span>
      )}

      {/* Date-Unavailable Badge on Fleet page with dates selected */}
      {!isMaintenance && isUnavailableForDates && (
        <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-amber-600/95 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider uppercase shadow-md select-none">
          Unavailable for these dates
        </span>
      )}

      {/* Rented Today Badge: "Back on DD Mon" */}
      {!isMaintenance && rentedUntilDate && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#181524]/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider shadow-md select-none">
          Back on {formatDayMonth(rentedUntilDate)}
        </span>
      )}

      {/* Top: Car Image Link */}
      <Link
        href={`/car/${carSlug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="w-full h-44 sm:h-48 flex items-center justify-center relative my-2 overflow-hidden cursor-pointer block focus:outline-none"
      >
        <Image
          src={carImage}
          alt={`${make} ${model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          className={`object-contain p-2 transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none ${
            isMaintenance
              ? "opacity-60 grayscale-[40%]"
              : "[@media(hover:hover)]:group-hover:scale-105"
          }`}
        />
      </Link>

      {/* Middle: Title & Price */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-lg font-bold text-black transition-colors truncate">
              <Link
                href={`/car/${carSlug}`}
                className="hover:text-[#5937E0] [@media(hover:hover)]:group-hover:text-[#5937E0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5937E0] focus-visible:ring-offset-2 rounded-sm cursor-pointer"
              >
                {make} {model}
              </Link>
            </h3>
            <p className="text-xs text-[#6C757D] capitalize mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
          <div className="text-right shrink-0 select-none">
            <span className="text-xl font-bold text-[#FFA000] whitespace-nowrap">
              {price_per_day} DH
            </span>
            <span className="text-[11px] text-[#6C757D] block -mt-1 whitespace-nowrap">
              per day
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 4 Specs with Icons: Seats, Transmission, Fuel, Km Policy (replaces Air Conditioner) */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-[#6C757D] font-medium pb-5">
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

      {/* Bottom Button */}
      {isMaintenance ? (
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-[50px] bg-[#F1F1F6] text-[#9CA3AF] text-sm font-semibold flex items-center justify-center cursor-not-allowed border border-[#E5E7EB]"
        >
          Unavailable
        </button>
      ) : (
        <Link
          href={`/car/${carSlug}`}
          className="w-full h-11 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] hover:-translate-y-0.5 hover:shadow-md text-white text-sm font-bold flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5937E0] focus-visible:ring-offset-2"
        >
          View Details
        </Link>
      )}
    </article>
  );
};

export default CarCard;
