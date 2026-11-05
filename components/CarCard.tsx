"use client";

import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";

interface CarCardProps {
  car: CarProps;
  index?: number;
}

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const {
    city_mpg,
    year,
    make,
    model,
    transmission,
    drive,
    fuel_type,
    price_per_day,
    class: carClass,
    seats = 5,
  } = car;

  const carId = `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, "-")}-${year}-${index}`;
  const carImage = getCarImage(car);

  return (
    <article className="flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(89,55,224,0.1)] transition-all duration-300 overflow-hidden group p-6 justify-between">
      {/* Top: Car Image */}
      <div className="w-full h-44 sm:h-48 flex items-center justify-center relative my-2 overflow-hidden">
        <Image
          src={carImage}
          alt={`${make} ${model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Middle: Title & Price */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-lg font-bold text-black group-hover:text-[#5937E0] transition-colors truncate">
              {make} {model}
            </h3>
            <p className="text-xs text-[#6C757D] capitalize mt-0.5">
              {carClass || "Sedan"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-[#FFA000]">
              ${price_per_day}
            </span>
            <span className="text-[11px] text-[#6C757D] block -mt-1">
              per day
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] my-4"></div>

        {/* 3 Specs with Icons (Exact Figma design: Automat, PB 95, Air Conditioner) */}
        <div className="flex items-center justify-between text-xs text-[#6C757D] font-medium pb-5">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#6C757D]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-8 5h8" />
            </svg>
            <span>{transmission === "a" ? "Automat" : "Manual"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#6C757D]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{fuel_type?.toLowerCase().includes("hybrid") ? "Hybrid" : "PB 95"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#6C757D]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m15.364 6.364l-12.728-12.728m12.728 0L5.636 18.364" />
            </svg>
            <span>Air Conditioner</span>
          </div>
        </div>
      </div>

      {/* Bottom Button: Full-width vibrant purple pill "View Details" */}
      <Link
        href={`/car/${carId}`}
        className="w-full h-11 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold flex items-center justify-center transition-all shadow-sm active:scale-[0.99]"
      >
        View Details
      </Link>
    </article>
  );
};

export default CarCard;
