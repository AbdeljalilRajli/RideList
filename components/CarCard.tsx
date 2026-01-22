"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarProps } from "@/types";
import { CustomButton } from "./CustomButton";
// Removed unused import
import { getCarImage } from "@/lib/utils";
import CarDetails from "./CarDetails";

interface CarCardProps {
    car: CarProps;
    index?: number;
}

const CarCard = ({ car, index = 0 }: CarCardProps) => {
  const {city_mpg, year, make, model, transmission, drive} = car;

  const [isOpen, setIsOpen] = useState(false);

  const carRent = car.price_per_day;
  
  // Generate unique car ID for routing
  const carId = `${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}-${year}-${index}`;

  return (
    <div className="car-card group">
      <div className="car-card__content">
        <h2 className="car-card__content-title">
            {make} {model}
        </h2>
      </div>

      <p className="flex mt-6 text-[32px] font-extrabold">
        <span className="self-start text-[14px] font-semibold">
            $
        </span>
        {carRent}
        <span className="self-end text-[14px] font-medium">
            /day
        </span>
      </p>

      <div className="relative w-full h-40 my-3 object-contain">
        <Image 
          src={getCarImage(car)} 
          alt={`${make} ${model}`} 
          fill 
          priority={index < 6} // Only prioritize first 6 images
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={70}
          className="object-contain" 
        />
      </div>

      <div className="relative flex w-full mt-2">
        <div className="flex group-hover:invisible w-full justify-between text-gray">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image src="/steering-wheel.svg" width={20} height={20} alt="steering wheel" />
            <p className="text-[14px]">
                {transmission === 'a' ? 'Automatic' : 'Manual'}
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-2">
            <Image src="/tire.svg" width={20} height={20} alt="tire" />
            <p className="text-[14px]">
                {drive.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-2">
            <Image src="/gas.svg" width={20} height={20} alt="gas" />
            <p className="text-[14px]">
                {city_mpg} MPG
            </p>
          </div>
        </div>

        <div className="car-card__btn-container">
          <Link href={`/car/${carId}`} className="w-full">
            <CustomButton 
              title="View Details" 
              containerStyles="w-full py-[16px] rounded-full bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]"
              textStyles="text-white text-[14px] leading-[17px] font-bold"
              rightIcon="/right-arrow.svg"
            />
          </Link>
        </div>
      </div>

      <CarDetails isOpen={isOpen} closeModal={() => setIsOpen(false)} car={car} />
    </div>
  )
}

export default CarCard
