"use client";

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
  "Economy",
  "Long Range",
  "Ultra Efficient",
  "Adventure",
];

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const { city_mpg, year, make, model, transmission, drive, fuel_type, price_per_day, class: carClass } = car;
  const carId = `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}-${year}-${index}`;
  const carImage = getCarImage(car);
  const badgeLabel = badgePresets[index % badgePresets.length];

  return (
    <article className="car-card bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Image Stage */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#F8F8FB] mb-4 flex items-center justify-center">
          <Image
            src={carImage}
            alt={`${make} ${model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={index < 4}
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E7EB] text-xs font-semibold text-[#0F0F1A] shadow-sm">
            {badgeLabel}
          </span>
        </div>

        {/* Title & Class subtitle */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-[#0F0F1A] group-hover:text-[#3730A3] transition-colors leading-snug">
            {make} {model}
          </h3>
          <span className="shrink-0 text-[11px] font-semibold text-[#6B7280] px-2 py-0.5 rounded-md bg-[#F1F2F8] capitalize">
            {carClass || "Sedan"}
          </span>
        </div>

        {/* Spec pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#6B7280]">
            {transmission === "a" ? "Automatic" : "Manual"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#6B7280]">
            {drive.toUpperCase()}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#6B7280]">
            {city_mpg} MPG
          </span>
        </div>
      </div>

      {/* Card Footer: Price & Arrow Trigger */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] bg-white">
        <div>
          <span className="text-2xl font-extrabold text-[#0F0F1A]">${price_per_day}</span>
          <span className="text-xs text-[#6B7280]"> / day</span>
        </div>
        <Link
          href={`/car/${carId}`}
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3730A3] text-white hover:bg-[#1E1B4B] transition-colors shadow-sm"
          aria-label={`View ${make} ${model} details`}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
};

export default CarCard;
