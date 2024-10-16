"use client";
import Image from "next/image";
import React from "react";
import { WobbleCard } from "@/components/ui/WobbleCard";
import { CustomButton } from "./CustomButton";

export function FeaturesCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-gray-800 min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Experience Ultimate Car Performance
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
            From SUVs to sports cars, explore the finest range of vehicles with
            top-notch features for maximum speed, comfort, and efficiency.
          </p>
        </div>
        <Image
          src="/car-deal2.webp"
          width={500}
          height={500}
          alt="car performance"
          className="absolute -right-4 lg:-right-[10%] grayscale filter -bottom-20 object-contain rounded-2xl"
        />
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Safety is Our Top Priority
        </h2>
        <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
          Advanced safety features and cutting-edge technology ensure a smooth,
          secure ride for you and your loved ones.
        </p>
      </WobbleCard>

      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Sign Up for Exclusive Car Deals and Offers
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Get access to the best deals on the latest models, from compact cars
            to luxury sedans.
          </p>
          <CustomButton 
                title="Sign Up"
                btnType="button"
                containerStyles="text-indigo-800 mt-10 rounded-full bg-white min-w-[130px]"
            />
        </div>
        <Image
          src="/car-deal1.webp"
          width={700}
          height={600}
          alt="car deals"
          className="absolute -right-10 md:-right-[10%] lg:-right-[5%] lg:-bottom-20 md:-bottom-14 object-contain rounded-2xl"
        />
      </WobbleCard>
    </div>
  );
}
