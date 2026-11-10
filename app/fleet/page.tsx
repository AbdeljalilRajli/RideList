"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { cars as initialCars } from "@/constants";
import { CarProps } from "@/types";
import CarCard from "@/components/CarCard";
import { useSearchParams } from "next/navigation";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";

export default function FleetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5937E0]"></div>
        </div>
      }
    >
      <FleetContent />
    </Suspense>
  );
}

const brandLogos = [
  { name: "BMW", src: "/Brands Logos/BMW.png", alt: "BMW logo", width: 110, height: 108, query: "BMW" },
  { name: "Mercedes-Benz", src: "/Brands Logos/Mercides.png", alt: "Mercedes-Benz logo", width: 110, height: 108, query: "Mercedes" },
  { name: "Audi", src: "/Brands Logos/Audi.png", alt: "Audi logo", width: 248, height: 84, query: "Audi" },
  { name: "Toyota", src: "/Brands Logos/Toyota.png", alt: "Toyota logo", width: 164, height: 108, query: "Toyota" },
  { name: "Ford", src: "/Brands Logos/Ford.png", alt: "Ford logo", width: 230, height: 88, query: "Ford" },
  { name: "Jeep", src: "/Brands Logos/Jeep.png", alt: "Jeep logo", width: 218, height: 88, query: "Jeep" },
];

function FleetContent() {
  const searchParams = useSearchParams();
  const initialFuel = searchParams.get("fuel") || "";
  const initialQuery = searchParams.get("query") || searchParams.get("city") || "";

  // Supabase Cars State
  const [carsList, setCarsList] = useState<CarProps[]>(initialCars);
  const [loadingCars, setLoadingCars] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>(initialFuel || "all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function loadCars() {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .neq("status", "hidden")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setCarsList(data as CarProps[]);
        }
      } catch (err) {
        console.error("Error loading cars from Supabase:", err);
      } finally {
        setLoadingCars(false);
      }
    }
    loadCars();
  }, []);

  const vehicleCategories = [
    { label: "All Vehicles", value: "all" },
    { label: "Sedan", value: "sedan" },
    { label: "Cabriolet", value: "cabriolet" },
    { label: "Pickup", value: "pickup" },
    { label: "SUV", value: "suv" },
    { label: "Minivan", value: "minivan" },
  ];

  // Filtered cars
  const filteredCars = useMemo(() => {
    return carsList.filter((car) => {
      // Hidden cars never show
      if (car.status === "hidden") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${car.make} ${car.model}`.toLowerCase().includes(q);
        const matchesClass = (car.class || "").toLowerCase().includes(q);
        if (!matchesName && !matchesClass) return false;
      }

      // Type
      if (selectedType !== "all") {
        const cClass = (car.class || "").toLowerCase();
        if (selectedType === "sedan" && !(cClass.includes("compact") || cClass.includes("midsize") || cClass.includes("sedan"))) return false;
        if (selectedType === "suv" && !cClass.includes("suv")) return false;
        if (selectedType === "minivan" && !(cClass.includes("van") || cClass.includes("minivan") || car.seats >= 7)) return false;
        if (selectedType === "pickup" && !cClass.includes("pickup") && !cClass.includes("truck")) return false;
        if (selectedType === "cabriolet" && !(cClass.includes("convertible") || car.price_per_day >= 700)) return false;
      }

      // Transmission
      if (transmission !== "all" && car.transmission !== transmission) {
        return false;
      }

      // Fuel
      if (fuelType !== "all") {
        const f = (car.fuel_type || "").toLowerCase();
        if (fuelType === "hybrid" && !(f.includes("hybrid") || f.includes("electric"))) return false;
        if (fuelType === "gas" && (f.includes("hybrid") || f.includes("electric"))) return false;
      }

      return true;
    });
  }, [carsList, searchQuery, selectedType, transmission, fuelType]);

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  }, [filteredCars, currentPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setTransmission("all");
    setFuelType("all");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#000000] pt-[104px] pb-24">
      {/* Header Banner (Figma Template style) */}
      <section className="bg-white border-b border-[#E5E7EB] py-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#000000] tracking-tight mb-3">
              Select a vehicle group
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={80}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              / <span className="text-[#000000] font-semibold">Fleet</span>
            </p>
          </Reveal>

          {/* Figma Style Vehicle Category Tabs */}
          <Reveal triggerOnLoad delay={140}>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {vehicleCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(cat.value);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-3 rounded-[50px] text-xs font-bold transition-all duration-200 shadow-sm hover:-translate-y-0.5 ${
                    selectedType === cat.value
                      ? "bg-[#5937E0] text-white shadow-[0_4px_16px_rgba(89,55,224,0.3)]"
                      : "bg-[#F8F8FB] border border-[#E5E7EB] text-[#000000] hover:bg-[#EEEDF9]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter and Search Bar Strip */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-8">
        <Reveal delay={0}>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <svg
                className="w-4 h-4 text-[#6C757D] absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by make or model..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-[#000000] focus:outline-none focus:border-[#5937E0]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Transmission filter */}
              <select
                value={transmission}
                onChange={(e) => {
                  setTransmission(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#000000] focus:outline-none"
              >
                <option value="all">All Transmissions</option>
                <option value="a">Automatic</option>
                <option value="m">Manual</option>
              </select>

              {/* Fuel filter */}
              <select
                value={fuelType}
                onChange={(e) => {
                  setFuelType(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#000000] focus:outline-none"
              >
                <option value="all">All Fuel Types</option>
                <option value="gas">Gasoline</option>
                <option value="hybrid">Hybrid & Electric</option>
              </select>

              {/* Reset Button */}
              {(searchQuery || selectedType !== "all" || transmission !== "all" || fuelType !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-11 px-4 rounded-xl text-xs font-bold text-[#5937E0] hover:bg-[#EEEDF9] transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Vehicles Grid */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-10">
        {paginatedCars.length === 0 ? (
          <Reveal delay={0}>
            <div className="bg-white rounded-3xl p-16 text-center border border-[#E5E7EB]">
              <h3 className="text-xl font-bold text-[#000000] mb-2">No vehicles match your criteria</h3>
              <p className="text-[#6C757D] text-sm mb-6">
                Try adjusting your search query, fuel type, or transmission options.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] hover:-translate-y-0.5 hover:shadow-md text-white text-xs font-bold transition-all duration-200"
              >
                Clear all filters
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCars.map((car, idx) => (
              <Reveal key={car.id || `${car.make}-${car.model}-${idx}`} delay={idx * 80}>
                <CarCard car={car} index={idx} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#000000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8FB] hover:-translate-y-0.5 transition-all duration-200"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                  currentPage === page
                    ? "bg-[#5937E0] text-white shadow-sm"
                    : "bg-white border border-[#E5E7EB] text-[#000000] hover:bg-[#EEEDF9]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#000000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8FB] hover:-translate-y-0.5 transition-all duration-200"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Brand Logos / Strip (matching Figma frame 1:4311) */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-20 mb-8">
        <Reveal delay={0}>
          <div className="bg-white rounded-[24px] py-10 px-6 sm:px-12 border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-8">
              Supported Automobile Brands
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-10 lg:gap-14 px-2 sm:px-6">
              {brandLogos.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => {
                    setSearchQuery(brand.query || brand.name);
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  title={`Filter by ${brand.name}`}
                  className="h-10 sm:h-12 flex items-center justify-center group transition-transform hover:-translate-y-0.5 focus:outline-none"
                >
                  <Image
                    src={brand.src}
                    alt={brand.alt}
                    width={brand.width}
                    height={brand.height}
                    unoptimized
                    className="max-h-7 sm:max-h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
