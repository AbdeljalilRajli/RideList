"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cars } from "@/constants";
import ReservationCheckout from "@/components/ReservationCheckout";
import Link from "next/link";

function ReserveContent() {
  const searchParams = useSearchParams();
  const carParam = searchParams.get("car") || "";
  const pickupDate = searchParams.get("pickup") || "";
  const returnDate = searchParams.get("return") || "";
  const location = searchParams.get("location") || "";

  // Locate the car in the manual cars list
  const matchedCar = cars.find((c, idx) => {
    const slug = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}-${c.year}-${idx}`;
    const baseSlug = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}-${c.year}`;
    const shortSlug = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      slug === carParam ||
      baseSlug === carParam ||
      shortSlug === carParam ||
      carParam.toLowerCase().includes(c.model.toLowerCase())
    );
  }) || cars[0]; // fallback to default flagship car if unspecified

  return (
    <div className="pt-20">
      <ReservationCheckout
        car={matchedCar}
        initialPickupDate={pickupDate}
        initialReturnDate={returnDate}
        initialPickupLocation={location || "SFO Airport - Rental Concourse"}
      />
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3] mx-auto mb-4"></div>
            <p className="text-[#6B7280] font-medium text-sm">Preparing secure reservation checkout...</p>
          </div>
        </div>
      }
    >
      <ReserveContent />
    </Suspense>
  );
}
