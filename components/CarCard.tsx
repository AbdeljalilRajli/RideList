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
}

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const {
    id,
    year,
    make,
    model,
    transmission,
    fuel_type,
    price_per_day,
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

  const subtitle = body_type
    ? `${formatBodyType(body_type)}${segment ? ` • ${formatSegment(segment)}` : ""}`
    : carClass || "Sedan";

  return (
    <article className="relative flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(89,55,224,0.14)] hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden group p-6 justify-between">
      {/* Rented Badge */}
      {isRented && (
        <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#181524]/90 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase shadow-md">
          Rented
        </span>
      )}

      {/* Top: Car Image */}
      <div className="w-full h-44 sm:h-48 flex items-center justify-center relative my-2 overflow-hidden">
        <Image
          src={carImage}
          alt={`${make} ${model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          className={`object-contain p-2 transition-transform duration-500 ${
            isRented ? "opacity-75 grayscale-[20%]" : "group-hover:scale-105"
          }`}
        />
      </div>

      {/* Middle: Title & Price */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-lg font-bold text-black group-hover:text-[#5937E0] transition-colors truncate">
              {make} {model}
            </h3>
            <p className="text-xs text-[#6C757D] capitalize mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl font-bold text-[#FFA000]">
              {price_per_day} DH
            </span>
            <span className="text-[11px] text-[#6C757D] block -mt-1">
              per day
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 3 Specs with Icons (Normalized: Automatic / Manual, Petrol / Hybrid / Electric) */}
        <div className="flex items-center justify-between text-xs text-[#6C757D] font-medium pb-5">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-[#6C757D]"
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
            <span>{normalizeTransmission(transmission)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-[#6C757D]"
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
            <span>{normalizeFuel(fuel_type)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-[#6C757D]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v18m9-9H3m15.364 6.364l-12.728-12.728m12.728 0L5.636 18.364"
              />
            </svg>
            <span>Air Conditioner</span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      {isRented ? (
        <button
          type="button"
          disabled
          className="w-full h-11 rounded-[50px] bg-[#F1F1F6] text-[#9CA3AF] text-sm font-semibold flex items-center justify-center cursor-not-allowed border border-[#E5E7EB]"
        >
          Currently Rented
        </button>
      ) : (
        <Link
          href={`/car/${carId}`}
          className="w-full h-11 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] hover:-translate-y-0.5 hover:shadow-md text-white text-sm font-bold flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99]"
        >
          View Details
        </Link>
      )}
    </article>
  );
};

export default CarCard;
